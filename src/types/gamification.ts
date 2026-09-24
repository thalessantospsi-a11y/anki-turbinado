export type BadgeCategory = 'streak' | 'cards' | 'questions' | 'exam' | 'mastery';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji ou nome do ícone
  category: BadgeCategory;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    max: number;
  };
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  currentLevelXp: number;
  levelTotalXp: number;
  progressPercentage: number;
}

export interface GamificationStats {
  totalXp: number;
  levelInfo: LevelInfo;
  streak: {
    current: number;
    best: number;
    lastActiveDate?: string;
  };
  badges: Badge[];
  unlockedBadgesCount: number;
  totalBadgesCount: number;
}
