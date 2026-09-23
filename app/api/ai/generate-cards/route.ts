import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured, isGeminiConfigured } from '@/services/gemini/geminiClient';
import { SYSTEM_PROMPT_FLASHCARDS } from '@/services/gemini/prompts';
import { AIGenerateCardsRequestSchema, AIGeneratedCardItem } from '@/types';
import { z } from 'zod';

const CardsResponseSchema = z.object({
  cards: z.array(
    z.object({
      cardType: z.enum(['basic', 'reversed', 'cloze', 'multiple_choice', 'true_false']),
      front: z.string(),
      back: z.string(),
      clozeText: z.string().optional(),
      explanation: z.string().optional(),
      example: z.string().optional(),
      pitfall: z.string().optional(),
      tags: z.array(z.string()).default([]),
      disciplina: z.string().optional(),
      assunto: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = AIGenerateCardsRequestSchema.parse(body);

    // Se a chave não estiver configurada, devolve dados demonstrativos estruturados
    if (!isGeminiConfigured()) {
      const demoCards: AIGeneratedCardItem[] = [
        {
          cardType: 'basic',
          front: `Qual é o ponto central tratado no texto sobre ${validatedInput.hierarchy?.assunto || 'este assunto'}?`,
          back: 'Exige memorização ativa do conceito essencial e diferenciação das exceções.',
          explanation: 'Baseado na análise preliminar do texto fornecido.',
          pitfall: 'Bancas examinadoras costumam trocar os termos centrais por sinônimos impróprios.',
          tags: ['ia-demo', validatedInput.hierarchy?.disciplina || 'geral'].filter(Boolean),
          disciplina: validatedInput.hierarchy?.disciplina,
          assunto: validatedInput.hierarchy?.assunto,
        },
        {
          cardType: 'cloze',
          front: `O conceito principal estabelece que {{c1::a retenção de longo prazo}} depende de revisões atômicas.`,
          back: 'a retenção de longo prazo',
          explanation: 'Omissão focada na palavra-chave mais provável de ser cobrada.',
          tags: ['cloze', 'ia-demo'],
          disciplina: validatedInput.hierarchy?.disciplina,
          assunto: validatedInput.hierarchy?.assunto,
        },
      ];

      return NextResponse.json({
        cards: demoCards,
        tokenEstimate: 450,
        isDemo: true,
      });
    }

    const userPrompt = `
Gere exatamente ${validatedInput.quantity} flashcards a partir do material a seguir.
Formato de saída obrigatório: Objeto JSON com a propriedade "cards" contendo o array de cartões.
Tipos permitidos: ${validatedInput.cardTypes.join(', ')}.
Disciplina: ${validatedInput.hierarchy?.disciplina || 'Geral'}.
Assunto: ${validatedInput.hierarchy?.assunto || 'Tópico Geral'}.

MATERIAL PARA EXTRAÇÃO:
"""
${validatedInput.content}
"""
`;

    const rawResult = await callGeminiStructured<any>(SYSTEM_PROMPT_FLASHCARDS, userPrompt);
    const parsed = CardsResponseSchema.parse(rawResult);

    return NextResponse.json({
      cards: parsed.cards,
      tokenEstimate: Math.round(validatedInput.content.length / 4) + parsed.cards.length * 50,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Erro na API generate-cards:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar conteúdo com IA.' },
      { status: 500 }
    );
  }
}
