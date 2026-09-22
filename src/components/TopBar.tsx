import React from 'react';
import { Volume2, VolumeX, ArrowLeft, Clock, Shell, Star, Map, BookOpen, Fish } from 'lucide-react';
import { sound } from '../utils/sound';
import { ActiveScreen } from '../types';

interface TopBarProps {
  chapterNumber: number;
  levelTitle: string;
  targetLetter: string;
  timerSeconds: number;
  starsEarned: number;
  collectedCount: number;
  totalTargets: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBackToMenu: () => void;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  chapterNumber,
  levelTitle,
  targetLetter,
  timerSeconds,
  starsEarned,
  collectedCount,
  totalTargets,
  soundEnabled,
  onToggleSound,
  onBackToMenu,
  activeScreen,
  onNavigate,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="absolute top-0 inset-x-0 z-30 p-2 sm:p-3 md:p-4 flex items-center justify-between pointer-events-none">
      {/* Top Left: Back Button & Game Badge */}
      <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto">
        <button
          id="btn-back"
          type="button"
          onClick={() => {
            sound.playWoodClick();
            onBackToMenu();
          }}
          aria-label="Geri Dön"
          title="Bölüm Seçimine Dön"
          className="wood-btn-round w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 sm:w-7 sm:h-7 stroke-[3.5] drop-shadow" />
        </button>

        {/* Playful Storybook Title Badge */}
        <div className="wood-plank px-2.5 py-1 sm:px-4 sm:py-2 md:px-5 md:py-2.5 flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-2xl filter drop-shadow">🧭</span>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200 font-bold leading-none">
              BÖLÜM {chapterNumber}
            </span>
            <span className="text-xs sm:text-base md:text-xl font-baloo font-extrabold text-amber-100 tracking-wide leading-tight line-clamp-1">
              {levelTitle}
            </span>
          </div>
        </div>

        {/* Hanging Target Letter Signpost */}
        <div className="wood-plank px-2 py-1 sm:px-3.5 sm:py-1.5 flex items-center gap-1.5 border-2 border-amber-900 bg-amber-800">
          <span className="text-[10px] sm:text-xs font-bold text-amber-200">HEDEF:</span>
          <span className="text-base sm:text-xl md:text-2xl font-black font-baloo text-yellow-300 animate-bounce">
            {targetLetter}
          </span>
        </div>
      </div>

      {/* Top Center: Wooden Countdown Timer */}
      <div className="pointer-events-auto hidden md:flex items-center">
        <div className="wood-plank px-4 py-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-200 animate-pulse" />
          <span className="font-baloo text-xl md:text-2xl font-extrabold text-amber-100 tracking-wider">
            {formatTime(timerSeconds)}
          </span>
        </div>
      </div>

      {/* Top Right: Navigation, Stars, Shells & Sound Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
        {/* Navigation Quick Switches */}
        <div className="hidden lg:flex items-center gap-1.5 bg-black/25 backdrop-blur-xs p-1 rounded-2xl border border-amber-900/40">
          <button
            id="nav-game-tab"
            type="button"
            onClick={() => onNavigate('game')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeScreen === 'game' ? 'wood-plank text-yellow-200' : 'text-amber-100/80 hover:text-white'
            }`}
          >
            🎮 Oyun
          </button>
          <button
            id="nav-levels-tab"
            type="button"
            onClick={() => onNavigate('levels')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeScreen === 'levels' ? 'wood-plank text-yellow-200' : 'text-amber-100/80 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Harita
          </button>
          <button
            id="nav-studio-tab"
            type="button"
            onClick={() => onNavigate('studio')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeScreen === 'studio' ? 'wood-plank text-yellow-200' : 'text-amber-100/80 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Harf Kartı
          </button>
          <button
            id="nav-aquarium-tab"
            type="button"
            onClick={() => onNavigate('aquarium')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeScreen === 'aquarium' ? 'wood-plank text-yellow-200' : 'text-amber-100/80 hover:text-white'
            }`}
          >
            <Fish className="w-3.5 h-3.5" /> Akvaryum
          </button>
        </div>

        {/* Collected Star Badges */}
        <div className="wood-plank px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1">
          <Star
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 drop-shadow ${
              starsEarned >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-amber-950/50'
            }`}
          />
          <Star
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 drop-shadow ${
              starsEarned >= 2 ? 'text-yellow-400 fill-yellow-400' : 'text-amber-950/50'
            }`}
          />
          <Star
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 drop-shadow ${
              starsEarned >= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-amber-950/50'
            }`}
          />
        </div>

        {/* Shell Progress Counter */}
        <div className="wood-plank px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
          <Shell className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-200" />
          <span className="font-baloo text-xs sm:text-base md:text-lg font-bold text-amber-100">
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
          className="wood-btn-round w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 drop-shadow" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-6 sm:h-6 text-red-300 drop-shadow" />
          )}
        </button>
      </div>
    </header>
  );
};
