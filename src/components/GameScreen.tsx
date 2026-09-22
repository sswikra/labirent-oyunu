import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelData, ActiveScreen } from '../types';
import { sound } from '../utils/sound';
import { TopBar } from './TopBar';
import { Volume2, Sparkles, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';

interface GameScreenProps {
  level: LevelData;
  onLevelComplete: (levelId: number, stars: number) => void;
  onNextLevel: () => void;
  onBackToMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  level,
  onLevelComplete,
  onNextLevel,
  onBackToMenu,
  soundEnabled,
  onToggleSound,
  activeScreen,
  onNavigate,
}) => {
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [speechMessage, setSpeechMessage] = useState<string>(level.storyPrompt);
  const [timerSeconds, setTimerSeconds] = useState<number>(level.initialTimeSeconds);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; dx: string; dy: string }[]>([]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sparkleCountRef = useRef(0);

  const targetNodes = level.nodes.filter((n) => n.isTarget);
  const totalTargets = targetNodes.length;
  const collectedCount = foundIds.size;

  // Calculate stars based on collected count and time
  const starsEarned =
    collectedCount === 0
      ? 1
      : collectedCount < Math.floor(totalTargets * 0.5)
      ? 1
      : collectedCount < totalTargets
      ? 2
      : 3;

  // Reset state when level changes
  useEffect(() => {
    setFoundIds(new Set());
    setWobbleId(null);
    setHintedId(null);
    setSpeechMessage(level.storyPrompt);
    setTimerSeconds(level.initialTimeSeconds);
    setIsVictory(false);
  }, [level]);

  // Countdown Timer
  useEffect(() => {
    if (isVictory) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVictory]);

  // Spawn visual sparkle particles on success
  const spawnSparkles = useCallback((clientX: number, clientY: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newSparkles: { id: number; x: number; y: number; dx: string; dy: string }[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * (Math.PI * 2);
      const dist = 35 + Math.random() * 40;
      const dx = `${Math.cos(angle) * dist}px`;
      const dy = `${Math.sin(angle) * dist}px`;
      newSparkles.push({
        id: ++sparkleCountRef.current,
        x,
        y,
        dx,
        dy,
      });
    }

    setSparkles((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
    }, 850);
  }, []);

  // Handle Stone Selection
  const handleNodeClick = (e: React.MouseEvent<HTMLButtonElement>, node: typeof level.nodes[0]) => {
    e.stopPropagation();

    if (node.isTarget) {
      if (foundIds.has(node.id)) {
        // Already found
        sound.speak(`Harf ${node.letter}`);
        return;
      }

      // Successful discovery!
      const newFound = new Set(foundIds);
      newFound.add(node.id);
      setFoundIds(newFound);

      sound.playSuccess();
      spawnSparkles(e.clientX, e.clientY);

      const encouragements = [
        `Harika! Bir "${level.targetLetter}" taşı buldun!`,
        `Aferin sana! Yolu adım adım tamamlıyorsun!`,
        `Çok iyi gidiyorsun! İşte bir "${level.targetLetter}" daha!`,
        `Hazineye çok yaklaştın, devam et!`,
      ];
      const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
      setSpeechMessage(randomMsg);
      sound.speak(node.letter);

      // Clear hint if this was hinted
      if (hintedId === node.id) {
        setHintedId(null);
      }

      // Check Victory
      if (newFound.size >= totalTargets) {
        setTimeout(() => {
          setIsVictory(true);
          sound.playVictory();
          onLevelComplete(level.id, 3);
        }, 500);
      }
    } else {
      // Wrong Letter Clicked
      sound.playWobble();
      setWobbleId(node.id);
      const wrongMsg = `Bu taş "${node.letter}" harfi. Biz "${level.targetLetter}" harfini arıyoruz!`;
      setSpeechMessage(wrongMsg);
      sound.speak(wrongMsg);

      setTimeout(() => {
        setWobbleId((curr) => (curr === node.id ? null : curr));
      }, 550);
    }
  };

  // Provide visual hint
  const handleGiveHint = () => {
    sound.playWoodClick();
    const nextUnfound = targetNodes.find((n) => !foundIds.has(n.id));
    if (nextUnfound) {
      setHintedId(nextUnfound.id);
      const hintMsg = `Bak! İşte bir "${level.targetLetter}" taşı orada parıldıyor!`;
      setSpeechMessage(hintMsg);
      sound.speak(hintMsg);

      setTimeout(() => {
        setHintedId(null);
      }, 2500);
    } else {
      const allFoundMsg = `Bütün "${level.targetLetter}" taşlarını buldun! İnci sandığına dokun!`;
      setSpeechMessage(allFoundMsg);
      sound.speak(allFoundMsg);
    }
  };

  // Read message aloud
  const handleSpeakSpeech = () => {
    sound.speak(speechMessage);
  };

  // Restart level
  const handleRestart = () => {
    sound.playWoodClick();
    setFoundIds(new Set());
    setTimerSeconds(level.initialTimeSeconds);
    setIsVictory(false);
    setSpeechMessage(level.storyPrompt);
  };

  // Compute SVG trail coordinates for discovered targets
  const discoveredTargetCoords = targetNodes
    .filter((n) => foundIds.has(n.id))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((n) => ({
      x: n.left + n.width / 2,
      y: n.top + n.height / 2,
    }));

  return (
    <div className="relative w-full h-screen bg-[#123136] flex items-center justify-center overflow-hidden p-0 sm:p-2">
      {/* Main 16:9 Viewport Container */}
      <main
        ref={viewportRef}
        id="maze-viewport"
        className="relative w-full max-w-[177.78vh] h-full max-h-[56.25vw] aspect-[16/9] overflow-hidden select-none shadow-2xl rounded-none sm:rounded-2xl border-0 sm:border-4 border-[#3c1e0b] bg-[#fed7aa]"
      >
        {/* Full-bleed Illustrated Storybook Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
          <img
            id="bg-art"
            src={level.bgImage}
            alt={level.title}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Subtle ocean atmosphere tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/15 via-transparent to-black/15 pointer-events-none" />
        </div>

        {/* SVG Trail for Discovered Letters Path */}
        {discoveredTargetCoords.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <polyline
              points={discoveredTargetCoords.map((c) => `${c.x}%,${c.y}%`).join(' ')}
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"
            />
          </svg>
        )}

        {/* Top HUD Bar */}
        <TopBar
          chapterNumber={level.chapterNumber}
          levelTitle={level.title}
          targetLetter={level.targetLetter}
          timerSeconds={timerSeconds}
          starsEarned={starsEarned}
          collectedCount={collectedCount}
          totalTargets={totalTargets}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onBackToMenu={onBackToMenu}
          activeScreen={activeScreen}
          onNavigate={onNavigate}
        />

        {/* Interactive Stone Letters Layer */}
        <section
          id="letter-grid"
          aria-label="Harf Taşları Labirenti"
          className="absolute inset-0 z-20 pointer-events-auto"
        >
          {level.nodes.map((node) => {
            const isFound = foundIds.has(node.id);
            const isWobbling = wobbleId === node.id;
            const isHinted = hintedId === node.id;

            return (
              <button
                key={node.id}
                id={`stone-${node.id}`}
                type="button"
                onClick={(e) => handleNodeClick(e, node)}
                aria-label={`Harf ${node.letter}`}
                style={{
                  left: `${node.left}%`,
                  top: `${node.top}%`,
                  width: `${node.width}%`,
                  height: `${node.height}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center rounded-full transition-transform duration-200 active:scale-95 group focus:outline-hidden ${
                  isWobbling ? 'wobble-wrong' : ''
                } ${isFound ? 'scale-105' : 'hover:scale-115'}`}
              >
                {/* Glowing ring if discovered */}
                {isFound && <span className="stone-glow-ring" />}

                {/* Pulsing golden ring if hinted */}
                {isHinted && <span className="stone-hint-ring" />}

                {/* Subtle stone text overlay */}
                <span
                  className={`font-baloo font-black text-center transition-all duration-200 leading-none select-none text-xs sm:text-base md:text-xl lg:text-2xl ${
                    isFound
                      ? 'text-emerald-700 font-extrabold drop-shadow-[0_0_8px_rgba(134,239,172,1)] scale-110'
                      : 'text-amber-950/20 group-hover:text-amber-950/80 group-hover:drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                  }`}
                >
                  {node.letter}
                </span>
              </button>
            );
          })}
        </section>

        {/* Treasure Chest Interactive Zone */}
        <div
          id="chest-zone"
          onClick={() => {
            sound.playChestOpen();
            if (collectedCount >= totalTargets) {
              setIsVictory(true);
            } else {
              const msg = `Sandık kilitli! Kalan ${totalTargets - collectedCount} adet "${level.targetLetter}" taşını bularak aç!`;
              setSpeechMessage(msg);
              sound.speak(msg);
            }
          }}
          style={{
            right: `${level.chestPosition.right}%`,
            bottom: `${level.chestPosition.bottom}%`,
            width: `${level.chestPosition.width}%`,
            height: `${level.chestPosition.height}%`,
          }}
          title="Hazine Sandığı!"
          className="absolute z-20 cursor-pointer pointer-events-auto rounded-2xl group flex items-center justify-center hover:ring-4 ring-yellow-400/80 transition-all"
        >
          <span
            className={`transition-opacity duration-300 text-2xl sm:text-3xl ${
              collectedCount >= totalTargets
                ? 'opacity-100 animate-bounce'
                : 'opacity-0 group-hover:opacity-100 animate-pulse'
            }`}
          >
            ✨
          </span>
        </div>

        {/* Mascot Fish & Speech Bubble Area */}
        <div
          id="mascot-speech-area"
          className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-5 md:left-6 z-30 pointer-events-none flex items-end gap-2"
        >
          {/* Fish Mascot Companion */}
          <button
            id="fish-mascot-btn"
            type="button"
            onClick={() => {
              sound.playBubble();
              sound.speak(speechMessage);
            }}
            title="Neşeli Balık Kıpır! Tıklayarak sesli dinle."
            className="pointer-events-auto cursor-pointer animate-float wood-btn-round w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-xl border-2 border-yellow-200 hover:scale-105 active:scale-95 transition-transform"
          >
            🐠
          </button>

          {/* Speech Bubble */}
          <div className="painted-bubble pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3 flex items-center gap-2 sm:gap-3 max-w-[280px] sm:max-w-md md:max-w-lg">
            {/* Audio speaker trigger */}
            <button
              id="btn-speak-instruction"
              type="button"
              onClick={handleSpeakSpeech}
              title="Mesajı Sesli Oku"
              className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <p
              id="speech-text"
              className="text-[11px] sm:text-sm md:text-base font-bold text-amber-950 leading-tight m-0 flex-1"
            >
              {speechMessage}
            </p>

            {/* Hint Button */}
            <button
              id="btn-hint"
              type="button"
              onClick={handleGiveHint}
              className="wood-plank px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs md:text-sm font-bold text-yellow-200 hover:text-white whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>İpucu</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sparkles Layer */}
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            className="particle-sparkle"
            style={
              {
                left: `${sp.x}px`,
                top: `${sp.y}px`,
                '--dx': sp.dx,
                '--dy': sp.dy,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Victory Celebration Modal */}
        {isVictory && (
          <div
            id="victory-modal"
            className="absolute inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div
              id="victory-card"
              className="wood-plank p-5 sm:p-7 md:p-8 max-w-md w-full text-center relative border-4 border-amber-950 shadow-2xl"
            >
              {/* Crown Emblem */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto -mt-12 sm:-mt-16 wood-btn-round flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border-4 border-yellow-300">
                👑
              </div>

              <h2 className="text-2xl sm:text-4xl font-baloo font-black text-amber-200 mt-3 tracking-wide drop-shadow-md">
                HARİKA İŞ!
              </h2>

              <p className="text-amber-100 font-semibold text-xs sm:text-sm md:text-base mt-2 mb-3 leading-relaxed">
                Bütün{' '}
                <span className="text-yellow-300 font-black text-lg sm:text-xl">"{level.targetLetter}"</span>{' '}
                taşlarını bularak labirenti başarıyla tamamladın ve inci sandığına ulaştın!
              </p>

              {/* Three Golden Stars */}
              <div className="flex justify-center items-center gap-2 sm:gap-3 my-3 text-3xl sm:text-5xl text-yellow-300">
                <span className="drop-shadow animate-bounce" style={{ animationDelay: '0.1s' }}>
                  ★
                </span>
                <span className="drop-shadow animate-bounce text-4xl sm:text-6xl" style={{ animationDelay: '0.2s' }}>
                  ★
                </span>
                <span className="drop-shadow animate-bounce" style={{ animationDelay: '0.3s' }}>
                  ★
                </span>
              </div>

              {/* Rewards Summary */}
              <div className="bg-black/30 rounded-xl p-2.5 my-3 flex justify-around text-xs sm:text-sm font-bold text-amber-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> +{totalTargets * 10} Puan
                </span>
                <span>🐚 +{totalTargets} İnci</span>
                <span>⭐ +3 Yıldız</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center mt-4">
                <button
                  id="btn-play-again"
                  type="button"
                  onClick={handleRestart}
                  className="wood-plank px-4 py-2 sm:px-5 sm:py-2.5 font-baloo text-sm sm:text-base font-bold text-yellow-200 hover:text-white active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Tekrar Oyna
                </button>
                <button
                  id="btn-next-level"
                  type="button"
                  onClick={() => {
                    sound.playWoodClick();
                    onNextLevel();
                  }}
                  className="gem-btn-green px-5 py-2 sm:px-6 sm:py-2.5 font-baloo text-sm sm:text-base font-black text-yellow-100 hover:text-white active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  Sonraki Harf <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
