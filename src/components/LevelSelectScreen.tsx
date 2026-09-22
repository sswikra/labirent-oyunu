import React from 'react';
import { LevelData, PlayerStats } from '../types';
import { sound } from '../utils/sound';
import { Star, Play, Lock, Sparkles, MapPin, Award, BookOpen, Fish } from 'lucide-react';

interface LevelSelectScreenProps {
  levels: LevelData[];
  currentLevelId: number;
  playerStats: PlayerStats;
  onSelectLevel: (levelId: number) => void;
  onNavigateToStudio: () => void;
  onNavigateToAquarium: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  levels,
  currentLevelId,
  playerStats,
  onSelectLevel,
  onNavigateToStudio,
  onNavigateToAquarium,
}) => {
  const totalStars = Object.values(playerStats.levelStars).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="relative w-full min-h-screen bg-[#133338] text-amber-100 flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto">
      {/* Top Header Card */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="wood-btn-round w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
            🗺️
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-yellow-300">
              HARF ADALARI HARİTASI
            </span>
            <h1 className="text-xl sm:text-3xl font-baloo font-black text-amber-100 drop-shadow-md">
              Bölüm ve Harf Labirentleri
            </h1>
          </div>
        </div>

        {/* Stats Plaque */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="wood-plank px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-baloo text-sm sm:text-lg font-bold">{totalStars} Yıldız</span>
          </div>

          <div className="wood-plank px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2">
            <span className="text-base sm:text-xl">🐚</span>
            <span className="font-baloo text-sm sm:text-lg font-bold">{playerStats.shellsCount} İnci</span>
          </div>

          <button
            id="btn-open-aquarium"
            type="button"
            onClick={() => {
              sound.playWoodClick();
              onNavigateToAquarium();
            }}
            className="wood-plank px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-200 hover:text-white cursor-pointer"
          >
            <Fish className="w-4 h-4 text-cyan-300" /> Akvaryum
          </button>
        </div>
      </div>

      {/* Island Route Map Banner */}
      <div className="w-full max-w-4xl bg-amber-950/40 border-2 border-amber-900/60 rounded-2xl p-4 sm:p-6 mb-6 relative overflow-hidden backdrop-blur-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base sm:text-xl font-baloo font-bold text-amber-200">
              Macera Yolculuğu: Sahilde Gizli Harfler
            </h2>
          </div>
          <span className="text-xs text-amber-300 font-semibold bg-amber-900/60 px-2.5 py-1 rounded-full">
            Labirenti Takip Et ➔ Sandığı Aç
          </span>
        </div>
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl">
          Her adada gizlenmiş harf taşlarını sırayla takip et. Sevimli balık dostumuz sana ipuçları verecek.
          Hazine sandığına ulaşıp incileri topla!
        </p>
      </div>

      {/* Levels Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {levels.map((lvl) => {
          const stars = playerStats.levelStars[lvl.id] || (lvl.id === 3 ? 2 : 1);
          const isCompleted = playerStats.levelCompleted[lvl.id] || lvl.id === 3;
          const isSelected = lvl.id === currentLevelId;

          return (
            <div
              key={lvl.id}
              id={`level-card-${lvl.id}`}
              onClick={() => {
                sound.playWoodClick();
                onSelectLevel(lvl.id);
              }}
              className={`wood-plank p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                isSelected ? 'ring-4 ring-yellow-400/90' : ''
              }`}
            >
              {/* Card Top: Chapter & Target Letter */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-amber-200">
                    <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                    <span>BÖLÜM {lvl.chapterNumber}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-baloo font-extrabold text-amber-50 leading-tight">
                    {lvl.title}
                  </h3>
                  <span className="text-xs text-amber-200/80">{lvl.themeName}</span>
                </div>

                {/* Target Letter Large Badge */}
                <div className="wood-btn-round w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center border-2 border-yellow-300 shadow-md">
                  <span className="text-[9px] uppercase font-bold text-yellow-200 leading-none">HEDEF</span>
                  <span className="text-xl sm:text-2xl font-black font-baloo text-yellow-300 leading-none">
                    {lvl.targetLetter}
                  </span>
                </div>
              </div>

              {/* Card Description */}
              <p className="text-xs text-amber-100/90 line-clamp-2 mb-4 leading-relaxed">
                {lvl.description}
              </p>

              {/* Card Bottom: Stars & Play Button */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-900/40">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        s <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow' : 'text-amber-950/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Action button */}
                <button
                  id={`play-level-btn-${lvl.id}`}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl font-baloo text-xs sm:text-sm font-black flex items-center gap-1.5 transition-transform active:scale-95 ${
                    isSelected
                      ? 'gem-btn-green text-white'
                      : 'wood-plank text-yellow-200 hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isCompleted ? 'Oyna' : 'Başla'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access to Letter Studio */}
      <div className="w-full max-w-4xl flex justify-center pb-6">
        <button
          id="btn-open-studio-bottom"
          type="button"
          onClick={() => {
            sound.playWoodClick();
            onNavigateToStudio();
          }}
          className="wood-plank px-6 py-3 font-baloo text-sm sm:text-base font-bold text-yellow-200 hover:text-white flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <BookOpen className="w-5 h-5 text-amber-300" />
          <span>Harf Tanıma & Ses Kartlarını Keşfet</span>
        </button>
      </div>
    </div>
  );
};
