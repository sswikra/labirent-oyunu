import { LevelData } from '../types';
import { buildRandomizedLevelNodes } from '../utils/mazeGenerator';

export const COMMON_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGpEy7A86T6wcoHUHoeqveGgmxW8BS4PK7LyQGXo6Z1LhAnnzTNFaAwH8P-yIFYI2Ysc_CGMvjYsSKcQcBsIYZoI65N7F5Q4CKsi4aaClkAKlz9eB0E96jo2YL_ZNg31eHhodYS79Q23UUV_E1RLYl1Ir79bCwOvy775Mr0Wjv2v51-I_jp7sbFmzZSeWIwNIY69-XQqSaO1tulvqY_bZ8J7IiiSpUH3nRh98YlrEmuKwJ1XC43VmCg4TDmdH7mXAKkdo';

export const COMMON_CHEST = { right: 32, bottom: 31, width: 8.0, height: 11.0 };

export const LEVELS: LevelData[] = [
  {
    id: 1,
    chapterNumber: 1,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'Ü',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 102,
    description: 'Hazineye ulaşmak için "Ü" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "Ü" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('Ü'),
  },
  {
    id: 2,
    chapterNumber: 2,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'S',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 100,
    description: 'Hazineye ulaşmak için "S" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "S" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('S'),
  },
  {
    id: 3,
    chapterNumber: 3,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'Ö',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 100,
    description: 'Hazineye ulaşmak için "Ö" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "Ö" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('Ö'),
  },
  {
    id: 4,
    chapterNumber: 4,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'Y',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 95,
    description: 'Hazineye ulaşmak için "Y" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "Y" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('Y'),
  },
  {
    id: 5,
    chapterNumber: 5,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'D',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 95,
    description: 'Hazineye ulaşmak için "D" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "D" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('D'),
  },
  {
    id: 6,
    chapterNumber: 6,
    title: 'Harf Bulma Labirenti',
    targetLetter: 'Z',
    bgImage: COMMON_BG,
    chestPosition: COMMON_CHEST,
    initialTimeSeconds: 90,
    description: 'Hazineye ulaşmak için "Z" taşlarını sırayla takip et!',
    storyPrompt: 'Hazineye ulaşmak için "Z" taşlarını sırayla takip et!',
    nodes: buildRandomizedLevelNodes('Z'),
  },
];
