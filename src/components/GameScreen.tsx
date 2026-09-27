import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelData, PlayerStats, StoneNode } from '../types';
import { sound } from '../utils/sound';
import { buildRandomizedLevelNodes } from '../utils/mazeGenerator';
import { TopBar } from './TopBar';
import { Volume2, Sparkles, RotateCcw, ArrowRight, Lightbulb, Shuffle } from 'lucide-react';

interface GameScreenProps {
  levels: LevelData[];
  currentLevel: LevelData;
  playerStats: PlayerStats;
  onLevelComplete: (levelId: number, stars: number) => void;
  onSelectLevel: (levelId: number) => void;
  onNextLevel: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levels,
  currentLevel,
  playerStats,
  onLevelComplete,
  onSelectLevel,
  onNextLevel,
  soundEnabled,
  onToggleSound,
}) => {
  // Dynamically randomized connected stone nodes for the active level
  const [nodes, setNodes] = useState<StoneNode[]>(() =>
    buildRandomizedLevelNodes(currentLevel.targetLetter)
  );
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [speechMessage, setSpeechMessage] = useState<string>(
    `Hazineye ulaşmak için "${currentLevel.targetLetter}" taşlarını sırayla takip et!`
  );
  const [timerSeconds, setTimerSeconds] = useState<number>(currentLevel.initialTimeSeconds);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; dx: string; dy: string }[]>([]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sparkleCountRef = useRef(0);

  const targetNodes = nodes.filter((n) => n.isTarget);
  const totalTargets = targetNodes.length;
  const collectedCount = foundIds.size;

  // Calculate stars based on collected count
  const starsEarned =
    collectedCount === 0
      ? 1
      : collectedCount < Math.floor(totalTargets * 0.5)
      ? 1
      : collectedCount < totalTargets
      ? 2
      : 3;

  // Regenerate a fresh, randomized connected path
  const handleRegeneratePath = useCallback(() => {
    sound.playWoodClick();
    const freshNodes = buildRandomizedLevelNodes(currentLevel.targetLetter);
    setNodes(freshNodes);
    setFoundIds(new Set());
    setWobbleId(null);
    setHintedId(null);
    setTimerSeconds(currentLevel.initialTimeSeconds);
    setIsVictory(false);
    const msg = `Yeni bir "${currentLevel.targetLetter}" yolu hazırlandı! Başlangıç taşını bul ve takip et!`;
    setSpeechMessage(msg);
    sound.speak(msg);
  }, [currentLevel.targetLetter, currentLevel.initialTimeSeconds]);

  // Whenever level changes (e.g. user chooses Ü, S, Ö, Y, D, or Z), generate a fresh path
  useEffect(() => {
    const freshNodes = buildRandomizedLevelNodes(currentLevel.targetLetter);
    setNodes(freshNodes);
    setFoundIds(new Set());
    setWobbleId(null);
    setHintedId(null);
    setSpeechMessage(`Hazineye ulaşmak için "${currentLevel.targetLetter}" taşlarını sırayla takip et!`);
    setTimerSeconds(currentLevel.initialTimeSeconds);
    setIsVictory(false);
  }, [currentLevel.id, currentLevel.targetLetter, currentLevel.initialTimeSeconds]);

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

  // Spawn visual sparkle particles
  const spawnSparklesForNode = useCallback((nodeLeft: number, nodeTop: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = (rect.width * nodeLeft) / 100;
    const y = (rect.height * nodeTop) / 100;

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

  // Handle Stone Click
  const handleNodeClick = (e: React.MouseEvent<HTMLButtonElement>, node: StoneNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (node.isTarget) {
      if (foundIds.has(node.id)) {
        sound.speak(`Harf ${node.letter}`);
        return;
      }

      // Success
      const newFound = new Set(foundIds);
      newFound.add(node.id);
      setFoundIds(newFound);

      sound.playSuccess();
      spawnSparklesForNode(node.left, node.top);

      const encouragements = [
        `Aferin! Bir "${currentLevel.targetLetter}" taşı buldun!`,
        `Harika gidiyorsun! Devam et!`,
        `Yolu adım adım tamamlıyorsun!`,
        `İşte bir tane daha "${currentLevel.targetLetter}"!`,
        `Hazineye çok yaklaştın!`,
      ];
      const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
      setSpeechMessage(randomMsg);
      sound.speak(node.letter);

      if (hintedId === node.id) {
        setHintedId(null);
      }

      // Check Victory
      if (newFound.size >= totalTargets) {
        setTimeout(() => {
          setIsVictory(true);
          sound.playVictory();
          onLevelComplete(currentLevel.id, 3);
        }, 450);
      }
    } else {
      // Wrong stone
      sound.playWobble();
      setWobbleId(node.id);
      const wrongMsg = `Bu taş "${node.letter}" harfi. Biz "${currentLevel.targetLetter}" arıyoruz!`;
      setSpeechMessage(wrongMsg);
      sound.speak(wrongMsg);

      setTimeout(() => {
        setWobbleId((curr) => (curr === node.id ? null : curr));
      }, 500);
    }
  };

  // Hint button: selects the next unfound target stone in order of the stepping path
  const handleGiveHint = () => {
    sound.playWoodClick();
    const sortedUnfound = targetNodes
      .filter((n) => !foundIds.has(n.id))
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const nextUnfound = sortedUnfound[0];
    if (nextUnfound) {
      setHintedId(nextUnfound.id);
      let hintMsg: string;
      if (nextUnfound.orderIndex === 1) {
        hintMsg = `Bak! Labirentin başlangıç "${currentLevel.targetLetter}" taşı orada parıldıyor!`;
      } else if (nextUnfound.orderIndex === totalTargets) {
        hintMsg = `Hazine sandığına giden son "${currentLevel.targetLetter}" taşı orada!`;
      } else {
        hintMsg = `Sıradaki "${currentLevel.targetLetter}" taşı orada parıldıyor, onu takip et!`;
      }
      setSpeechMessage(hintMsg);
      sound.speak(hintMsg);

      setTimeout(() => {
        setHintedId(null);
      }, 2500);
    } else {
      const allFoundMsg = `Bütün "${currentLevel.targetLetter}" taşlarını buldun! İnci sandığına dokun!`;
      setSpeechMessage(allFoundMsg);
      sound.speak(allFoundMsg);
    }
  };

  // Speak speech aloud
  const handleSpeakSpeech = () => {
    sound.speak(speechMessage);
  };

  // SVG trail coordinates: connects found target stones along the sequence
  const discoveredTargetCoords = targetNodes
    .filter((n) => foundIds.has(n.id))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((n) => ({
      x: n.left,
      y: n.top,
    }));

  return (
    <div className="relative w-full h-screen bg-[#123136] flex items-center justify-center overflow-hidden p-0 sm:p-2">
      {/* 16:9 Viewport matching the kiosk / tablet display */}
      <main
        ref={viewportRef}
        id="maze-viewport"
        className="relative w-full max-w-[177.78vh] h-full max-h-[56.25vw] aspect-[16/9] overflow-hidden select-none shadow-2xl rounded-none sm:rounded-2xl border-0 sm:border-4 border-[#3c1e0b] bg-[#fed7aa]"
      >
        {/* Full-bleed Illustrated Storybook Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
          <img
            id="bg-art"
            src={currentLevel.bgImage}
            alt="Harf Bulma Labirenti Sahil ve Deniz İllüstrasyonu"
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dynamic Sign Overlays for Current Target Letter */}
        {/* 1. Top Wooden Sign by the Cliff */}
        <div
          className="absolute z-15 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: '32.8%', top: '29.8%', width: '7.6%', height: '7.8%' }}
        >
          <div className="wood-plank px-2 py-0.5 flex items-center gap-1 shadow-md scale-90 sm:scale-100 border-2 border-amber-950">
            <span className="font-baloo font-black text-amber-100 text-sm sm:text-base md:text-xl drop-shadow">
              {currentLevel.targetLetter}
            </span>
            <span className="text-[10px] sm:text-xs">🧭</span>
          </div>
        </div>

        {/* 2. Wooden Sign on the Treasure Chest */}
        <div
          className="absolute z-15 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: '66.8%', top: '53.0%', width: '7.2%', height: '6.4%' }}
        >
          <div className="wood-plank px-2.5 py-0.5 shadow-md scale-85 sm:scale-95 border-2 border-amber-950">
            <span className="font-baloo font-black text-amber-100 text-xs sm:text-base md:text-lg drop-shadow">
              {currentLevel.targetLetter}
            </span>
          </div>
        </div>

        {/* 3. Bottom Wooden Sign on the Post */}
        <div
          className="absolute z-15 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: '46.2%', top: '70.5%', width: '7.4%', height: '6.6%' }}
        >
          <div className="wood-plank px-2.5 py-0.5 shadow-md scale-85 sm:scale-95 border-2 border-amber-950">
            <span className="font-baloo font-black text-amber-100 text-xs sm:text-base md:text-lg drop-shadow">
              {currentLevel.targetLetter}
            </span>
          </div>
        </div>

        {/* SVG Connecting Trail for Discovered Target Letters */}
        {discoveredTargetCoords.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <polyline
              points={discoveredTargetCoords.map((c) => `${c.x}%,${c.y}%`).join(' ')}
              fill="none"
              stroke="#22c55e"
              strokeWidth="5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse"
            />
          </svg>
        )}

        {/* Top HUD Bar */}
        <TopBar
          levels={levels}
          currentLevel={currentLevel}
          timerSeconds={timerSeconds}
          starsEarned={starsEarned}
          collectedCount={collectedCount}
          totalTargets={totalTargets}
          soundEnabled={soundEnabled}
          playerStats={playerStats}
          onToggleSound={onToggleSound}
          onSelectLevel={onSelectLevel}
          onRestartLevel={handleRegeneratePath}
          onRegeneratePath={handleRegeneratePath}
        />

        {/* Interactive Stone Letters Layer */}
        <section
          id="letter-grid"
          aria-label="Harf Taşları Labirenti"
          className="absolute inset-0 z-20 pointer-events-auto"
        >
          {nodes.map((node) => {
            const isFound = foundIds.has(node.id);
            const isWobbling = wobbleId === node.id;
            const isHinted = hintedId === node.id;
            const isStartStone = node.isTarget && node.orderIndex === 1;

            return (
              <button
                key={node.id}
                id={`stone-${node.id}`}
                type="button"
                onClick={(e) => handleNodeClick(e, node)}
                aria-label={`Harf ${node.letter}`}
                style={{
                  position: 'absolute',
                  left: `${node.left}%`,
                  top: `${node.top}%`,
                  width: `${node.width}%`,
                  height: `${node.height}%`,
                  minWidth: '38px',
                  minHeight: '38px',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  zIndex: 25,
                }}
                className={`stone-node ${isWobbling ? 'wobble-wrong' : ''} ${
                  isFound ? 'found' : ''
                }`}
              >
                {/* Glowing ring if discovered */}
                {isFound && <span className="stone-glow-ring" />}

                {/* Pulsing golden ring if hinted */}
                {isHinted && <span className="stone-hint-ring" />}

                {/* Start flag on the first stone of the path until clicked */}
                {isStartStone && !isFound && (
                  <span
                    className="absolute -top-3.5 -right-2 bg-emerald-600 text-yellow-100 font-baloo text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md border border-emerald-300 animate-bounce pointer-events-none flex items-center gap-0.5 whitespace-nowrap z-30"
                    title="Labirent Başlangıcı"
                  >
                    🚩 Başla
                  </span>
                )}

                {/* Hand painted letter tag on the stone */}
                <span className="stone-inner-tag">
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
              const msg = `Sandık kilitli! Kalan ${totalTargets - collectedCount} adet "${currentLevel.targetLetter}" taşını bularak aç!`;
              setSpeechMessage(msg);
              sound.speak(msg);
            }
          }}
          style={{
            right: `${currentLevel.chestPosition.right}%`,
            bottom: `${currentLevel.chestPosition.bottom}%`,
            width: `${currentLevel.chestPosition.width}%`,
            height: `${currentLevel.chestPosition.height}%`,
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

        {/* Companion Fish Mascot & Speech Bubble */}
        <div
          id="mascot-speech-area"
          className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-5 md:left-6 z-30 pointer-events-none flex items-end gap-2"
        >
          {/* Companion Fish Avatar */}
          <button
            id="fish-helper-avatar"
            type="button"
            onClick={() => {
              sound.playBubble();
              sound.speak(speechMessage);
            }}
            title="Tatlı Balık Sana Yardımcı Olabilir! Tıkla ve dinle."
            className="pointer-events-auto cursor-pointer animate-float wood-btn-round w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-xl border-2 border-yellow-200 hover:scale-105 active:scale-95 transition-transform"
          >
            🐠
          </button>

          {/* Speech Bubble */}
          <div className="painted-bubble pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3 flex items-center gap-1.5 sm:gap-2.5 max-w-[290px] sm:max-w-md md:max-w-lg">
            {/* Audio speaker trigger */}
            <button
              id="btn-speak-instruction"
              type="button"
              onClick={handleSpeakSpeech}
              title="Mesajı Sesli Oku"
              className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer shrink-0"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <p
              id="speech-text"
              className="text-[11px] sm:text-sm md:text-base font-bold text-amber-950 leading-tight m-0 flex-1 line-clamp-2"
            >
              {speechMessage}
            </p>

            {/* Hint Button */}
            <button
              id="btn-hint"
              type="button"
              onClick={handleGiveHint}
              className="wood-plank px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold text-yellow-200 hover:text-white whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>İpucu</span>
            </button>

            {/* New Path / Shuffle Button in bubble */}
            <button
              id="btn-bubble-new-path"
              type="button"
              onClick={handleRegeneratePath}
              title="Yeni bir rastgele labirent yolu oluştur"
              className="wood-plank px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold text-yellow-200 hover:text-white whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Shuffle className="w-3 h-3 text-yellow-300" />
              <span>Yeni Yol</span>
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
            className="absolute inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in pointer-events-auto"
          >
            <div
              id="victory-card"
              className="wood-plank p-5 sm:p-7 md:p-8 max-w-md w-full text-center relative border-4 border-amber-950 shadow-2xl"
            >
              {/* Crown Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto -mt-12 sm:-mt-16 wood-btn-round flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border-4 border-yellow-300">
                👑
              </div>

              <h2 className="text-2xl sm:text-4xl font-baloo font-black text-amber-200 mt-3 tracking-wide drop-shadow-md">
                HARİKA İŞ!
              </h2>

              <p className="text-amber-100 font-semibold text-xs sm:text-sm md:text-base mt-2 mb-3 leading-relaxed">
                Bütün{' '}
                <span className="text-yellow-300 font-black text-lg sm:text-xl">
                  "{currentLevel.targetLetter}"
                </span>{' '}
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

              {/* Reward stats */}
              <div className="bg-black/35 rounded-xl p-2.5 my-3 flex justify-around text-xs sm:text-sm font-bold text-amber-200 border border-amber-900/60">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> +{totalTargets * 10} Puan
                </span>
                <span>🐚 +{totalTargets} İnci</span>
                <span>⭐ +3 Yıldız</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center mt-4">
                <button
                  id="btn-play-again"
                  type="button"
                  onClick={handleRegeneratePath}
                  className="wood-plank px-4 py-2 sm:px-5 sm:py-2.5 font-baloo text-sm sm:text-base font-bold text-yellow-200 hover:text-white active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Yeni Yolla Tekrar Oyna
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
