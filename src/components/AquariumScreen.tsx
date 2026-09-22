import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { sound } from '../utils/sound';
import { ArrowLeft, Sparkles, Award, Play } from 'lucide-react';

interface AquariumScreenProps {
  playerStats: PlayerStats;
  onBack: () => void;
  onGoToGame: () => void;
}

export const AquariumScreen: React.FC<AquariumScreenProps> = ({
  playerStats,
  onBack,
  onGoToGame,
}) => {
  const [clickedCreature, setClickedCreature] = useState<string | null>(null);

  const creatures = [
    { id: 'fish', name: 'Neşeli Balık Kıpır', emoji: '🐠', unlocked: true, desc: 'Labirentlerde sana yol gösteren dostumuz.' },
    { id: 'seahorse', name: 'Zarif Denizatı', emoji: '🐡', unlocked: playerStats.shellsCount >= 10, desc: 'Derin mercanların sakin yüzücüsü.' },
    { id: 'starfish', name: 'Işıltılı Denizyıldızı', emoji: '⭐', unlocked: playerStats.shellsCount >= 20, desc: 'Sahilde kumların üzerinde parıldar.' },
    { id: 'crab', name: 'Şakacı Yengeç', emoji: '🦀', unlocked: playerStats.shellsCount >= 30, desc: 'Yan yan yürüyerek hazineleri korur.' },
    { id: 'dolphin', name: 'Mavi Yunus', emoji: '🐬', unlocked: playerStats.shellsCount >= 40, desc: 'Dalgaların üzerinde neşeyle sıçrar.' },
  ];

  const handleCreatureClick = (name: string) => {
    sound.playBubble();
    setClickedCreature(name);
    sound.speak(name);
    setTimeout(() => setClickedCreature(null), 1000);
  };

  return (
    <div className="relative w-full min-h-screen bg-radial from-[#194a50] to-[#0d2327] text-amber-100 flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6">
        <button
          id="btn-aquarium-back"
          type="button"
          onClick={() => {
            sound.playWoodClick();
            onBack();
          }}
          className="wood-btn-round w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-amber-100 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase tracking-wider font-bold text-yellow-300">
            ÖDÜL AKVARYUMU
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-baloo font-extrabold text-amber-100">
            Deniz Canlıları & İnci Sandığı
          </h1>
        </div>

        <button
          id="btn-back-to-game-top"
          type="button"
          onClick={() => {
            sound.playWoodClick();
            onGoToGame();
          }}
          className="gem-btn-green px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-yellow-100 flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Oyuna Dön
        </button>
      </div>

      {/* Pearl Stats Card */}
      <div className="w-full max-w-4xl wood-plank p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="wood-btn-round w-14 h-14 flex items-center justify-center text-3xl">
            🐚
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-amber-200">KAZANILAN İNCİLER</span>
            <div className="font-baloo text-2xl sm:text-3xl font-black text-yellow-300">
              {playerStats.shellsCount} Adet İnci
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-amber-100/90 max-w-md">
          Harf labirentlerindeki hedef taşları topladıkça daha fazla deniz canlısı ve ödülün kilidini açarsın!
        </p>
      </div>

      {/* Interactive Aquarium Area */}
      <div className="w-full max-w-4xl bg-cyan-950/40 border-4 border-cyan-900/60 rounded-3xl p-6 mb-6 relative overflow-hidden min-h-[300px] flex flex-col justify-between shadow-2xl backdrop-blur-xs">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <h2 className="font-baloo text-lg sm:text-xl font-bold text-cyan-200">
              Akvaryum Dostlarımız
            </h2>
          </div>
          <span className="text-xs text-cyan-300 font-semibold bg-cyan-900/60 px-3 py-1 rounded-full">
            Canlılara dokunarak seslerini dinle!
          </span>
        </div>

        {/* Swimming Creatures Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-6 z-10">
          {creatures.map((c) => (
            <div
              key={c.id}
              onClick={() => c.unlocked && handleCreatureClick(c.name)}
              className={`p-3.5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${
                c.unlocked
                  ? 'bg-amber-950/40 border-2 border-yellow-400/50 hover:scale-105 hover:bg-amber-900/50'
                  : 'bg-black/30 border border-gray-700/50 opacity-50 grayscale'
              } ${clickedCreature === c.name ? 'scale-110 ring-2 ring-cyan-300' : ''}`}
            >
              <span className="text-4xl sm:text-5xl mb-2 animate-float filter drop-shadow">
                {c.emoji}
              </span>
              <span className="font-baloo text-sm sm:text-base font-bold text-amber-100">
                {c.name}
              </span>
              <span className="text-[10px] text-amber-200/70 mt-1">
                {c.unlocked ? c.desc : 'Kilitli 🔒'}
              </span>
            </div>
          ))}
        </div>

        {/* Ambient Sea Floor Decor */}
        <div className="flex items-center justify-between text-2xl opacity-40 px-4">
          <span>🌿</span>
          <span>🪸</span>
          <span>🐚</span>
          <span>🪸</span>
          <span>🌿</span>
        </div>
      </div>
    </div>
  );
};
