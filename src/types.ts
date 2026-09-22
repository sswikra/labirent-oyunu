export interface StoneNode {
  id: string;
  letter: string;
  left: number; // percentage (0 - 100)
  top: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
  isTarget: boolean;
  orderIndex?: number; // 1 to 12
}

export interface LevelData {
  id: number;
  chapterNumber: number;
  title: string;
  themeName: string;
  targetLetter: string;
  bgImage: string;
  chestPosition: { right: number; bottom: number; width: number; height: number };
  fishPosition?: { left: number; top: number };
  initialTimeSeconds: number;
  description: string;
  storyPrompt: string;
  sampleWords: { word: string; meaning: string; emoji: string }[];
  nodes: StoneNode[];
}

export interface PlayerStats {
  levelStars: Record<number, number>; // levelId -> stars (1-3)
  levelCompleted: Record<number, boolean>;
  shellsCount: number;
  unlockedBadges: string[];
}

export type ActiveScreen = 'game' | 'levels' | 'studio' | 'aquarium';
