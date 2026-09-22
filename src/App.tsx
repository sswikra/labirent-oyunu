/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveScreen, PlayerStats } from './types';
import { LEVELS } from './data/levelsData';
import { sound } from './utils/sound';
import { GameScreen } from './components/GameScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { LetterStudioScreen } from './components/LetterStudioScreen';
import { AquariumScreen } from './components/AquariumScreen';

export default function App() {
  // Default to Level 3 ("Bölüm 3 - Harf Bulma Labirenti - Ü") as shown in the user's uploaded mockup
  const [currentLevelId, setCurrentLevelId] = useState<number>(3);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('game');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Player progress & stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('harf_labirenti_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      levelStars: { 1: 3, 2: 3, 3: 2, 4: 1 },
      levelCompleted: { 1: true, 2: true, 3: false, 4: false },
      shellsCount: 24,
      unlockedBadges: ['Kâşif Balık', 'İlk Adım'],
    };
  });

  // Persist stats changes
  useEffect(() => {
    try {
      localStorage.setItem('harf_labirenti_stats', JSON.stringify(playerStats));
    } catch {
      // ignore
    }
  }, [playerStats]);

  const currentLevel = LEVELS.find((lvl) => lvl.id === currentLevelId) || LEVELS[2];

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.soundEnabled = newState;
    sound.voiceEnabled = newState;
  };

  const handleLevelComplete = (levelId: number, stars: number) => {
    setPlayerStats((prev) => {
      const prevStars = prev.levelStars[levelId] || 0;
      const targetCount = LEVELS.find((l) => l.id === levelId)?.nodes.filter((n) => n.isTarget).length || 10;
      return {
        ...prev,
        levelStars: {
          ...prev.levelStars,
          [levelId]: Math.max(prevStars, stars),
        },
        levelCompleted: {
          ...prev.levelCompleted,
          [levelId]: true,
        },
        shellsCount: prev.shellsCount + targetCount,
      };
    });
  };

  const handleNextLevel = () => {
    const currentIndex = LEVELS.findIndex((l) => l.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex < LEVELS.length - 1) {
      setCurrentLevelId(LEVELS[currentIndex + 1].id);
    } else {
      // Loop back to level 1 or stay
      setCurrentLevelId(LEVELS[0].id);
    }
    setActiveScreen('game');
  };

  return (
    <div className="w-full min-h-screen bg-[#123136] text-amber-50 select-none overflow-hidden flex flex-col items-center justify-center">
      {activeScreen === 'game' && (
        <GameScreen
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onNextLevel={handleNextLevel}
          onBackToMenu={() => setActiveScreen('levels')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
        />
      )}

      {activeScreen === 'levels' && (
        <LevelSelectScreen
          levels={LEVELS}
          currentLevelId={currentLevelId}
          playerStats={playerStats}
          onSelectLevel={(id) => {
            setCurrentLevelId(id);
            setActiveScreen('game');
          }}
          onNavigateToStudio={() => setActiveScreen('studio')}
          onNavigateToAquarium={() => setActiveScreen('aquarium')}
        />
      )}

      {activeScreen === 'studio' && (
        <LetterStudioScreen
          levels={LEVELS}
          currentLevel={currentLevel}
          onBack={() => setActiveScreen('game')}
          onPlayLevel={(id) => {
            setCurrentLevelId(id);
            setActiveScreen('game');
          }}
        />
      )}

      {activeScreen === 'aquarium' && (
        <AquariumScreen
          playerStats={playerStats}
          onBack={() => setActiveScreen('levels')}
          onGoToGame={() => setActiveScreen('game')}
        />
      )}
    </div>
  );
}
