/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerStats } from './types';
import { LEVELS } from './data/levelsData';
import { sound } from './utils/sound';
import { GameScreen } from './components/GameScreen';

export default function App() {
  // Current active letter level (Levels: 1: Ü, 2: S, 3: Ö, 4: Y, 5: D, 6: Z)
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Player progress & stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('harf_labirenti_v2_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      levelStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      levelCompleted: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
      shellsCount: 0,
    };
  });

  // Persist stats changes
  useEffect(() => {
    try {
      localStorage.setItem('harf_labirenti_v2_stats', JSON.stringify(playerStats));
    } catch {
      // ignore
    }
  }, [playerStats]);

  const currentLevel = LEVELS.find((lvl) => lvl.id === currentLevelId) || LEVELS[0];

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.soundEnabled = newState;
    sound.voiceEnabled = newState;
  };

  const handleLevelComplete = (levelId: number, stars: number) => {
    setPlayerStats((prev) => {
      const prevStars = prev.levelStars[levelId] || 0;
      const targetCount = LEVELS.find((l) => l.id === levelId)?.nodes.filter((n) => n.isTarget).length || 12;
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
      // Completed all 6 levels (Z completed), loop back to Ü
      setCurrentLevelId(LEVELS[0].id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#123136] text-amber-50 select-none overflow-hidden flex flex-col items-center justify-center">
      <GameScreen
        levels={LEVELS}
        currentLevel={currentLevel}
        playerStats={playerStats}
        onLevelComplete={handleLevelComplete}
        onSelectLevel={(id) => setCurrentLevelId(id)}
        onNextLevel={handleNextLevel}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
    </div>
  );
}
