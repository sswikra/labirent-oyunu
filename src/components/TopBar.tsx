import React, { useState } from 'react';
import { Volume2, VolumeX, Clock, Shell, Star, Layers, X, Shuffle } from 'lucide-react';
import { sound } from '../utils/sound';
import { LevelData, PlayerStats } from '../types';

interface TopBarProps {
  levels: LevelData[];
  currentLevel: LevelData;
  timerSeconds: number;
  starsEarned: number;
  collectedCount: number;
  totalTargets: number;
  soundEnabled: boolean;
  playerStats: PlayerStats;
  onToggleSound: () => void;
  onSelectLevel: (levelId: number) => void;
  onRestartLevel: () => void;
  onRegeneratePath: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  levels,
  currentLevel,
  timerSeconds,
  starsEarned,
  collectedCount,
  totalTargets,
  soundEnabled,
  playerStats,
  onToggleSound,
  onSelectLevel,
  onRegeneratePath,
}) => {
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      <header className="absolute top-0 inset-x-0 z-30 p-2 sm:p-3 md:p-4 flex items-center justify-between pointer-events-none">
        {/* Top Left: Level Switcher / Menu Button & Game Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Level List / Menu Toggle Button */}
          <button
            id="btn-level-menu"
            type="button"
            onClick={() => {
              sound.playWoodClick();
              setShowLevelPicker(!showLevelPicker);
            }}
            aria-label="Harf Seviyeleri Menüsü"
            title="Seviye ve Harf Değiştir"
            className="wood-btn-round w-8 h-8 sm:w-11 sm:h-11 md:w-13 md:h-13 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer active:scale-95 shrink-0"
          >
            <Layers className="w-4 h-4 sm:w-6 sm:h-6 drop-shadow" />
          </button>

          {/* Storybook Title Badge */}
          <div
            onClick={() => {
              sound.playWoodClick();
              setShowLevelPicker(!showLevelPicker);
            }}
            className="wood-plank px-2 py-1 sm:px-3.5 sm:py-2 md:px-4 md:py-2.5 flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:brightness-105 active:scale-98 transition-all shrink-0"
            title="Harf Seçimini Aç"
          >
            <span className="text-sm sm:text-2xl filter drop-shadow">🧭</span>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-xs uppercase tracking-wider text-amber-200 font-bold leading-none">
                BÖLÜM {currentLevel.chapterNumber}
              </span>
              <span className="text-[11px] sm:text-sm md:text-lg font-baloo font-extrabold text-amber-100 tracking-wide leading-tight line-clamp-1">
                Harf Labirenti
              </span>
            </div>
          </div>

          {/* Hanging Target Letter Signpost Plaque */}
          <div className="wood-plank px-2 py-0.5 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 border-2 border-amber-900 bg-amber-800 shrink-0">
            <span className="text-[9px] sm:text-xs font-bold text-amber-200">HEDEF:</span>
            <span className="text-base sm:text-xl md:text-2xl font-black font-baloo text-yellow-300 animate-bounce">
              {currentLevel.targetLetter}
            </span>
          </div>

          {/* Quick Switcher for the 6 Letters: Ü, S, Ö, Y, D, Z */}
          <div className="hidden lg:flex items-center gap-1 bg-black/35 backdrop-blur-xs p-1 rounded-2xl border border-amber-900/50">
            {levels.map((lvl) => {
              const isCurrent = lvl.id === currentLevel.id;
              const hasCompleted = playerStats.levelCompleted[lvl.id];
              return (
                <button
                  key={lvl.id}
                  id={`quick-lvl-btn-${lvl.targetLetter}`}
                  type="button"
                  onClick={() => {
                    sound.playWoodClick();
                    onSelectLevel(lvl.id);
                  }}
                  title={`Seviye ${lvl.chapterNumber}: Harf "${lvl.targetLetter}"`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-baloo font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'wood-plank text-yellow-300 scale-110 shadow-md ring-2 ring-yellow-300/80'
                      : 'bg-amber-950/40 text-amber-200 hover:text-white hover:bg-amber-900/50'
                  }`}
                >
                  {lvl.targetLetter}
                  {hasCompleted && !isCurrent && (
                    <span className="absolute -top-1 -right-1 text-[8px] text-yellow-300">★</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Shuffle / New Random Path Button on TopBar */}
          <button
            id="btn-shuffle-path"
            type="button"
            onClick={onRegeneratePath}
            title="Yolu Rastgele Yeniden Oluştur"
            className="wood-plank px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-yellow-200 hover:text-white flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
          >
            <Shuffle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Yeni Yol</span>
          </button>
        </div>

        {/* Top Center: Wooden Countdown Timer */}
        <div className="pointer-events-auto hidden md:flex items-center">
          <div className="wood-plank px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="font-baloo text-base sm:text-xl md:text-2xl font-extrabold text-amber-100 tracking-wider">
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>

        {/* Top Right: Stars, Shells & Sound Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Collected Star Badges */}
          <div className="wood-plank px-1.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-0.5 sm:gap-1">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 drop-shadow ${
                  starsEarned >= starNum ? 'text-yellow-400 fill-yellow-400' : 'text-amber-950/50'
                }`}
              />
            ))}
          </div>

          {/* Shell Progress Counter */}
          <div className="wood-plank px-1.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1">
            <Shell className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-200" />
            <span className="font-baloo text-xs sm:text-base font-bold text-amber-100">
              {collectedCount} / {totalTargets}
            </span>
          </div>

          {/* Mute/Sound Toggle */}
          <button
            id="btn-sound-toggle"
            type="button"
            onClick={() => {
              sound.playWoodClick();
              onToggleSound();
            }}
            aria-label={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="wood-btn-round w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer active:scale-95 shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 drop-shadow" />
            )}
          </button>
        </div>
      </header>

      {/* Level Selection Modal for Ü, S, Ö, Y, D, Z */}
      {showLevelPicker && (
        <div
          id="level-picker-modal"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in pointer-events-auto"
          onClick={() => setShowLevelPicker(false)}
        >
          <div
            className="wood-plank p-4 sm:p-6 max-w-lg w-full relative border-4 border-amber-950 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                sound.playWoodClick();
                setShowLevelPicker(false);
              }}
              className="absolute top-3 right-3 wood-btn-round w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="text-xs uppercase font-bold text-yellow-300 tracking-wider">
              HARF BULMA LABİRENTİ
            </span>
            <h2 className="text-xl sm:text-3xl font-baloo font-black text-amber-100 mt-1 mb-4 drop-shadow">
              Bir Harf Seviyesi Seç
            </h2>

            {/* 6 Letter Level Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {levels.map((lvl) => {
                const isSelected = lvl.id === currentLevel.id;
                const stars = playerStats.levelStars[lvl.id] || 0;
                return (
                  <button
                    key={lvl.id}
                    id={`picker-level-${lvl.targetLetter}`}
                    type="button"
                    onClick={() => {
                      sound.playWoodClick();
                      onSelectLevel(lvl.id);
                      setShowLevelPicker(false);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'wood-plank ring-4 ring-yellow-400 scale-105 shadow-xl bg-amber-800'
                        : 'bg-amber-950/50 hover:bg-amber-900/60 border-2 border-amber-900/70'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-amber-200">
                      BÖLÜM {lvl.chapterNumber}
                    </span>
                    <span className="font-baloo text-3xl sm:text-4xl font-black text-yellow-300 my-0.5">
                      {lvl.targetLetter}
                    </span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-amber-950/40'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-amber-200/90 mt-2">
              Seçtiğin harfe ait taşlar her seferinde sahilde birbirine komşu yepyeni bir yol oluşturur!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
