import { LevelInfo } from '@/types/gamification';

interface LevelBracket {
  levelMin: number;
  levelMax: number;
  xpMin: number;
  xpMax: number;
  title: string;
}

const BRACKETS: LevelBracket[] = [
  { levelMin: 1, levelMax: 4, xpMin: 0, xpMax: 500, title: 'Calouro do Concurso' },
  { levelMin: 5, levelMax: 9, xpMin: 500, xpMax: 1500, title: 'Estudante Focado' },
  { levelMin: 10, levelMax: 19, xpMin: 1500, xpMax: 3500, title: 'Rato de Biblioteca' },
  { levelMin: 20, levelMax: 29, xpMin: 3500, xpMax: 7500, title: 'Mestre da Lei Seca' },
  { levelMin: 30, levelMax: 49, xpMin: 7500, xpMax: 15000, title: 'Papa-Gabaritos' },
  { levelMin: 50, levelMax: 99, xpMin: 15000, xpMax: 50000, title: 'Quase Concursado / Nome no DOU' },
];

export function calculateLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);

  // Encontrar o bracket correspondente
  let bracket = BRACKETS.find((b) => safeXp >= b.xpMin && safeXp < b.xpMax);

  if (!bracket) {
    // Acima do nível 50
    bracket = BRACKETS[BRACKETS.length - 1];
  }

  const xpInBracket = safeXp - bracket.xpMin;
  const bracketRange = bracket.xpMax - bracket.xpMin;
  const levelsCount = bracket.levelMax - bracket.levelMin + 1;
  const xpPerLevel = Math.max(1, Math.floor(bracketRange / levelsCount));

  const levelOffset = Math.min(levelsCount - 1, Math.floor(xpInBracket / xpPerLevel));
  const currentLevel = bracket.levelMin + levelOffset;

  const currentLevelMinXp = bracket.xpMin + levelOffset * xpPerLevel;
  const currentLevelMaxXp = currentLevelMinXp + xpPerLevel;

  const currentLevelProgress = safeXp - currentLevelMinXp;
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((currentLevelProgress / xpPerLevel) * 100))
  );

  return {
    level: currentLevel,
    title: bracket.title,
    minXp: currentLevelMinXp,
    maxXp: currentLevelMaxXp,
    currentLevelXp: currentLevelProgress,
    levelTotalXp: xpPerLevel,
    progressPercentage,
  };
}

export const XP_REWARDS = {
  CARD_REVIEW: 10,
  QUESTION_CORRECT: 25,
  QUESTION_ATTEMPT: 5,
  DAILY_GOAL_MET: 100,
  STREAK_MAINTAINED: 50,
  EXAM_COMPLETED: 75,
  ERROR_CONVERTED: 30,
} as const;
