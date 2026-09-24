import { z } from 'zod';

// ==============================================================================
// 1. ENUMS E CONSTANTES CENTRAIS
// ==============================================================================

export const FSRS_RATINGS = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
} as const;

export type FSRSRating = typeof FSRS_RATINGS[keyof typeof FSRS_RATINGS];

export const FSRS_STATES = {
  NEW: 0,
  LEARNING: 1,
  REVIEW: 2,
  RELEARNING: 3,
} as const;

export type FSRSState = typeof FSRS_STATES[keyof typeof FSRS_STATES];

export const CARD_TYPES = [
  'basic',
  'reversed',
  'cloze',
  'multiple_choice',
  'true_false',
] as const;

export type CardType = typeof CARD_TYPES[number];

export const ERROR_REASONS = [
  'nao_sabia',
  'esqueci',
  'confundi_conceitos',
  'interpretacao',
  'atencao',
  'pegadinha',
  'chute',
  'desconhecimento_legislacao',
  'erro_calculo',
  'outro',
] as const;

export type ErrorReason = typeof ERROR_REASONS[number];

// ==============================================================================
// 2. SCHEMAS E TIPOS DE FSRS
// ==============================================================================

export const FSRSCardDataSchema = z.object({
  due: z.string(), // ISO String serializável
  stability: z.number().default(0),
  difficulty: z.number().default(0),
  elapsedDays: z.number().default(0),
  scheduledDays: z.number().default(0),
  reps: z.number().default(0),
  lapses: z.number().default(0),
  state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
  lastReview: z.string().optional(),
});

export type FSRSCardData = z.infer<typeof FSRSCardDataSchema>;

export const FSRSParametersSchema = z.object({
  requestRetention: z.number().min(0.7).max(0.99).default(0.9),
  maximumInterval: z.number().min(30).max(36500).default(36500),
  w: z.array(z.number()).default([]), // Pesos do modelo FSRS v4.5
  enableFuzz: z.boolean().default(true),
});

export type FSRSParameters = z.infer<typeof FSRSParametersSchema>;

// ==============================================================================
// 3. USUÁRIO E PERFIL
// ==============================================================================

export const UserGoalsSchema = z.object({
  dailyStudyMinutes: z.number().min(5).max(1440).default(60),
  dailyNewCards: z.number().min(0).max(500).default(20),
  dailyMaxReviews: z.number().min(0).max(2000).default(100),
  dailyQuestions: z.number().min(0).max(500).default(30),
});

export type UserGoals = z.infer<typeof UserGoalsSchema>;

export const UserProfileSchema = z.object({
  id: stringRequired(),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().optional().nullable(),
  targetExam: z.string().optional(),
  targetRole: z.string().optional(),
  goals: UserGoalsSchema,
  fsrsParameters: FSRSParametersSchema,
  streak: z.object({
    current: z.number().default(0),
    best: z.number().default(0),
    lastActiveDate: z.string().optional(), // YYYY-MM-DD
  }),
  xp: z.number().default(0),
  level: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ==============================================================================
// 4. BARALHOS E HIERARQUIA
// ==============================================================================

export const DeckHierarchySchema = z.object({
  concurso: z.string().optional(),
  banca: z.string().optional(),
  cargo: z.string().optional(),
  disciplina: z.string().min(1, 'Disciplina é obrigatória'),
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  subassunto: z.string().optional(),
});

export type DeckHierarchy = z.infer<typeof DeckHierarchySchema>;

export const DeckSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  hierarchy: DeckHierarchySchema,
  cardCounts: z.object({
    new: z.number().default(0),
    learning: z.number().default(0),
    review: z.number().default(0),
    relearning: z.number().default(0),
    total: z.number().default(0),
  }),
  isArchived: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Deck = z.infer<typeof DeckSchema>;

// ==============================================================================
// 5. FLASHCARDS
// ==============================================================================

export const CardSourceSchema = z.object({
  documentId: z.string().optional(),
  title: z.string(),
  pageOrSection: z.string().optional(),
});

export type CardSource = z.infer<typeof CardSourceSchema>;

export const CardContentSchema = z.object({
  front: z.string().min(1, 'Frente é obrigatória'),
  back: z.string().min(1, 'Verso é obrigatório'),
  clozeText: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().optional(),
  explanation: z.string().optional(),
  example: z.string().optional(),
  pitfall: z.string().optional(), // Pegadinha de banca
  source: CardSourceSchema.optional(),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
});

export type CardContent = z.infer<typeof CardContentSchema>;

export const CardMetadataSchema = z.object({
  concurso: z.string().optional(),
  banca: z.string().optional(),
  ano: z.number().optional(),
  disciplina: z.string(),
  assunto: z.string(),
  subassunto: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isSuspended: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  relatedQuestionId: z.string().optional(),
});

export type CardMetadata = z.infer<typeof CardMetadataSchema>;

export const CardSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  deckId: stringRequired(),
  cardType: z.enum(CARD_TYPES),
  content: CardContentSchema,
  metadata: CardMetadataSchema,
  fsrs: FSRSCardDataSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Card = z.infer<typeof CardSchema>;

// ==============================================================================
// 6. HISTÓRICO DE REVISÕES
// ==============================================================================

export const ReviewLogSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  cardId: stringRequired(),
  deckId: stringRequired(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  scheduledDays: z.number(),
  elapsedDays: z.number(),
  lastElapsedDays: z.number(),
  reviewTimestamp: z.string(), // ISO string
  durationMs: z.number().min(0),
});

export type ReviewLog = z.infer<typeof ReviewLogSchema>;

// ==============================================================================
// 7. QUESTÕES, TENTATIVAS E CADERNO DE ERROS
// ==============================================================================

export const QuestionOptionSchema = z.object({
  id: z.string(), // 'A', 'B', 'C', 'D', 'E' ou uuid
  text: z.string().min(1),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

export const QuestionSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  statement: z.string().min(1, 'Enunciado é obrigatório'),
  options: z.array(QuestionOptionSchema).min(2, 'Pelo menos 2 alternativas são necessárias'),
  correctOptionId: z.string().min(1),
  explanation: z.string(),
  metadata: z.object({
    concurso: z.string().optional(),
    banca: z.string().optional(),
    cargo: z.string().optional(),
    ano: z.number().optional(),
    disciplina: z.string().min(1),
    assunto: z.string().min(1),
    subassunto: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
  }),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuestionAttemptSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  questionId: stringRequired(),
  selectedOptionId: z.string(),
  isCorrect: z.boolean(),
  timeSpentSeconds: z.number().min(0),
  createdAt: z.string(),
  errorDetails: z.object({
    reason: z.enum(ERROR_REASONS),
    conceptNotes: z.string().optional(),
    generatedCardId: z.string().optional(),
  }).optional(),
});

export type QuestionAttempt = z.infer<typeof QuestionAttemptSchema>;

// ==============================================================================
// 8. SESSÕES DE ESTUDO E SIMULADOS
// ==============================================================================

export const StudySessionSchema = z.object({
  id: stringRequired(),
  ownerId: stringRequired(),
  startedAt: z.string(),
  endedAt: z.string(),
  durationMinutes: z.number().min(0),
  cardsReviewed: z.number().default(0),
  questionsAnswered: z.number().default(0),
  questionsCorrect: z.number().default(0),
  topicsCovered: z.array(z.string()).default([]),
});

export type StudySession = z.infer<typeof StudySessionSchema>;

export const MockExamConfigSchema = z.object({
  title: z.string().min(1),
  totalQuestions: z.number().min(1).max(200),
  timeLimitMinutes: z.number().min(5).max(360),
  filters: z.object({
    disciplinas: z.array(z.string()).optional(),
    assuntos: z.array(z.string()).optional(),
    bancas: z.array(z.string()).optional(),
    difficulties: z.array(z.enum(['easy', 'medium', 'hard'])).optional(),
  }),
});

export type MockExamConfig = z.infer<typeof MockExamConfigSchema>;

// ==============================================================================
// 9. CONTRATOS DE INTEGRAÇÃO COM GEMINI (IA)
// ==============================================================================

export const AIGenerateCardsRequestSchema = z.object({
  content: z.string().min(20, 'Conteúdo deve ter ao menos 20 caracteres'),
  sourceTitle: z.string().default('Material fornecido'),
  quantity: z.number().min(1).max(30).default(10),
  cardTypes: z.array(z.enum(CARD_TYPES)).default(['basic', 'cloze']),
  hierarchy: DeckHierarchySchema.partial().optional(),
});

export type AIGenerateCardsRequest = z.infer<typeof AIGenerateCardsRequestSchema>;

export const AIGeneratedCardItemSchema = z.object({
  cardType: z.enum(CARD_TYPES),
  front: z.string(),
  back: z.string(),
  clozeText: z.string().optional(),
  explanation: z.string().optional(),
  example: z.string().optional(),
  pitfall: z.string().optional(),
  tags: z.array(z.string()).default([]),
  disciplina: z.string().optional(),
  assunto: z.string().optional(),
});

export type AIGeneratedCardItem = z.infer<typeof AIGeneratedCardItemSchema>;

export const AIAnalyzeErrorRequestSchema = z.object({
  questionStatement: z.string(),
  options: z.array(QuestionOptionSchema),
  selectedOptionId: z.string(),
  correctOptionId: z.string(),
  explanation: z.string().optional(),
  userReason: z.enum(ERROR_REASONS).optional(),
});

export type AIAnalyzeErrorRequest = z.infer<typeof AIAnalyzeErrorRequestSchema>;

export const AIAnalyzeErrorResponseSchema = z.object({
  conceptIdentified: z.string(),
  diagnosis: z.string(),
  reinforcementExplanation: z.string(),
  suggestedFlashcard: z.object({
    front: z.string(),
    back: z.string(),
    pitfall: z.string().optional(),
  }),
  contrastQuestion: z.object({
    statement: z.string(),
    options: z.array(QuestionOptionSchema),
    correctOptionId: z.string(),
    explanation: z.string(),
  }).optional(),
});

export type AIAnalyzeErrorResponse = z.infer<typeof AIAnalyzeErrorResponseSchema>;

// ==============================================================================
// 10. REPOSITÓRIOS E SERVIÇOS (INTERFACES DE CONTRATO)
// ==============================================================================

export interface IDeckRepository {
  create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck>;
  getById(id: string): Promise<Deck | null>;
  listByOwner(ownerId: string, options?: { isArchived?: boolean }): Promise<Deck[]>;
  update(id: string, updates: Partial<Deck>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ICardRepository {
  create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
  getById(id: string): Promise<Card | null>;
  listDueCards(ownerId: string, limit?: number, deckId?: string): Promise<Card[]>;
  listByDeck(deckId: string): Promise<Card[]>;
  update(id: string, updates: Partial<Card>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IQuestionRepository {
  create(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question>;
  getById(id: string): Promise<Question | null>;
  filterQuestions(ownerId: string, filters: {
    disciplina?: string;
    assunto?: string;
    banca?: string;
    ano?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }, limit?: number): Promise<Question[]>;
}

export interface IReviewLogRepository {
  logReview(log: Omit<ReviewLog, 'id'>): Promise<ReviewLog>;
  listRecentReviews(ownerId: string, limit?: number): Promise<ReviewLog[]>;
}

// Auxiliar
function stringRequired() {
  return z.string().min(1, 'ID é obrigatório');
}

export * from './planner';

export * from './gamification';
