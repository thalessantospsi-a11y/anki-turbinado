import { Badge } from '@/types/gamification';

export interface UserGamificationMetrics {
  reviewCount: number;
  correctQuestions: number;
  streakBest: number;
  streakCurrent: number;
  examCount: number;
  convertedErrorsCount: number;
}

export function computeBadges(metrics: UserGamificationMetrics): Badge[] {
  const BADGE_DEFINITIONS: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    category: Badge['category'];
    max: number;
    getValue: (m: UserGamificationMetrics) => number;
  }> = [
    {
      id: 'primeira_revisao',
      title: 'Primeira Revisão',
      description: 'Concluiu a revisão do seu primeiro flashcard no motor FSRS.',
      icon: '🌱',
      category: 'cards',
      max: 1,
      getValue: (m) => m.reviewCount,
    },
    {
      id: 'fogo_sagrado',
      title: 'Fogo Sagrado',
      description: 'Manteve 7 dias consecutivos de ofensiva sem interrupções.',
      icon: '🔥',
      category: 'streak',
      max: 7,
      getValue: (m) => m.streakBest,
    },
    {
      id: 'centuriao',
      title: 'Centurião',
      description: 'Revisou 100 cartões no sistema de repetição espaçada.',
      icon: '🛡️',
      category: 'cards',
      max: 100,
      getValue: (m) => m.reviewCount,
    },
    {
      id: 'tiro_certeiro',
      title: 'Tiro Certeiro',
      description: 'Acertou 50 questões de concurso no banco prático.',
      icon: '🎯',
      category: 'questions',
      max: 50,
      getValue: (m) => m.correctQuestions,
    },
    {
      id: 'sob_pressao',
      title: 'Sob Pressão',
      description: 'Completou seu primeiro simulado com cronômetro real.',
      icon: '⏱️',
      category: 'exam',
      max: 1,
      getValue: (m) => m.examCount,
    },
    {
      id: 'estrategista',
      title: 'Estrategista',
      description: 'Converteu 10 erros do caderno em flashcards FSRS.',
      icon: '🧠',
      category: 'mastery',
      max: 10,
      getValue: (m) => m.convertedErrorsCount,
    },
    {
      id: 'indomavel',
      title: 'Indomável',
      description: 'Alcançou a marca histórica de 30 dias seguidos de estudo diário.',
      icon: '⚡',
      category: 'streak',
      max: 30,
      getValue: (m) => m.streakBest,
    },
    {
      id: 'disciplina_de_ferro',
      title: 'Disciplina de Ferro',
      description: 'Superou a impressionante marca de 500 revisões concluídas.',
      icon: '💎',
      category: 'cards',
      max: 500,
      getValue: (m) => m.reviewCount,
    },
    {
      id: 'gabaritador',
      title: 'Papa-Gabaritos',
      description: 'Acertou 200 questões de concurso com alto índice de fixação.',
      icon: '👑',
      category: 'questions',
      max: 200,
      getValue: (m) => m.correctQuestions,
    },
  ];

  return BADGE_DEFINITIONS.map((def) => {
    const val = def.getValue(metrics);
    const unlocked = val >= def.max;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      unlocked,
      progress: {
        current: Math.min(val, def.max),
        max: def.max,
      },
    };
  });
}
