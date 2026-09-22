import React, { useState } from 'react';
import { LevelData } from '../types';
import { sound } from '../utils/sound';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, Play } from 'lucide-react';

interface LetterStudioScreenProps {
  levels: LevelData[];
  currentLevel: LevelData;
  onBack: () => void;
  onPlayLevel: (levelId: number) => void;
}

export const LetterStudioScreen: React.FC<LetterStudioScreenProps> = ({
  levels,
  currentLevel,
  onBack,
  onPlayLevel,
}) => {
  const [selectedLetterId, setSelectedLetterId] = useState<number>(currentLevel.id);
  const activeLevel = levels.find((l) => l.id === selectedLetterId) || currentLevel;

  const handlePronounceLetter = () => {
    sound.speak(`Harf: ${activeLevel.targetLetter}`);
  };

  const handlePronounceWord = (word: string, meaning: string) => {
    sound.playSuccess();
    sound.speak(`${word}. ${meaning}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#14353b] text-amber-100 flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6">
        <button
          id="btn-studio-back"
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
            EĞİTİCİ HARF KARTLARI
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-baloo font-extrabold text-amber-100">
            Harf Tanıma & Ses Çalışması
          </h1>
        </div>

        <button
          id="btn-play-from-studio"
          type="button"
          onClick={() => {
            sound.playWoodClick();
            onPlayLevel(activeLevel.id);
          }}
          className="wood-plank px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-yellow-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Labirente Git
        </button>
      </div>

      {/* Letter Switcher Tabs */}
      <div className="w-full max-w-4xl flex items-center justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            id={`tab-letter-${lvl.targetLetter}`}
            type="button"
            onClick={() => {
              sound.playWoodClick();
              setSelectedLetterId(lvl.id);
              sound.speak(lvl.targetLetter);
            }}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-baloo font-black text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-center ${
              lvl.id === activeLevel.id
                ? 'wood-plank text-yellow-300 scale-110 shadow-lg'
                : 'bg-amber-950/40 text-amber-200/70 hover:text-amber-100 border border-amber-900/60'
            }`}
          >
            {lvl.targetLetter}
          </button>
        ))}
      </div>

      {/* Main Letter Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Left: Giant Letter & Audio */}
        <div className="wood-plank p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase font-bold text-amber-300 mb-2">HEDEF HARFİMİZ</span>
          <div
            id="giant-letter-display"
            onClick={handlePronounceLetter}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-radial from-amber-500/30 to-amber-900/60 border-4 border-amber-700/80 flex items-center justify-center cursor-pointer shadow-inner hover:scale-105 transition-transform group"
            title="Sesi duymak için dokun!"
          >
            <span className="font-baloo text-7xl sm:text-8xl font-black text-yellow-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
              {activeLevel.targetLetter}
            </span>
          </div>

          <button
            id="btn-giant-pronounce"
            type="button"
            onClick={handlePronounceLetter}
            className="mt-4 wood-plank px-4 py-2 font-baloo text-sm sm:text-base font-bold text-yellow-200 hover:text-white flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Volume2 className="w-5 h-5 text-yellow-300" />
            <span>"{activeLevel.targetLetter}" Sesini Dinle</span>
          </button>
        </div>

        {/* Right: Sample Words with Emojis */}
        <div className="md:col-span-2 wood-plank p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg sm:text-xl font-baloo font-bold text-amber-200">
                "{activeLevel.targetLetter}" ile Başlayan Kelimeler
              </h2>
            </div>
            <p className="text-xs text-amber-100/80 mb-4">
              Kelimelerin üzerine tıklayarak doğru telaffuzunu ve anlamını dinleyebilirsin:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeLevel.sampleWords.map((item, idx) => (
                <div
                  key={idx}
                  id={`word-card-${idx}`}
                  onClick={() => handlePronounceWord(item.word, item.meaning)}
                  className="bg-amber-950/50 hover:bg-amber-900/60 border border-amber-900/80 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow">{item.emoji}</span>
                  <div className="flex-1">
                    <span className="font-baloo text-lg sm:text-xl font-black text-yellow-300 leading-tight block">
                      {item.word}
                    </span>
                    <span className="text-xs text-amber-200/90 leading-tight block">
                      {item.meaning}
                    </span>
                  </div>
                  <Volume2 className="w-4 h-4 text-amber-400 opacity-60 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hazır mısın? Harf labirentine gir ve gizli taşları bul!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
