import {
  AIGenerateCardsRequest,
  AIGeneratedCardItem,
  AIAnalyzeErrorRequest,
  AIAnalyzeErrorResponse,
} from '@/types';

export class AIService {
  async generateFlashcards(
    req: AIGenerateCardsRequest
  ): Promise<{ cards: AIGeneratedCardItem[]; tokenEstimate: number; isDemo?: boolean }> {
    const res = await fetch('/api/ai/generate-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao gerar flashcards com IA');
    }

    return res.json();
  }

  async explainConcept(
    concept: string,
    style: 'simple' | 'exam' | 'technical' | 'analogy' | 'pitfall' = 'simple',
    context?: string
  ): Promise<{ explanation: string; keyTakeaway: string; samplePitfall?: string; isDemo?: boolean }> {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, style, context }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao solicitar explicação à IA');
    }

    return res.json();
  }

  async analyzeWrongAnswer(
    req: AIAnalyzeErrorRequest
  ): Promise<AIAnalyzeErrorResponse & { isDemo?: boolean }> {
    const res = await fetch('/api/ai/analyze-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao diagnosticar erro da questão com IA');
    }

    return res.json();
  }

  async executeTeacherAction(
    content: string,
    action: 'analyze_topics' | 'summary' | 'mindmap' | 'questions' | 'pitfalls',
    options?: any
  ): Promise<any> {
    const res = await fetch('/api/ai/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, action, options }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha no processamento do Modo Professor');
    }

    return res.json();
  }
}

export const aiService = new AIService();
