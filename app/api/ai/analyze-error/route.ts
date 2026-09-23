import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured, isGeminiConfigured } from '@/services/gemini/geminiClient';
import { SYSTEM_PROMPT_ANALYZE_ERROR } from '@/services/gemini/prompts';
import { AIAnalyzeErrorRequestSchema, AIAnalyzeErrorResponseSchema } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = AIAnalyzeErrorRequestSchema.parse(body);

    const selectedOpt = input.options.find((o) => o.id === input.selectedOptionId);
    const correctOpt = input.options.find((o) => o.id === input.correctOptionId);

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        conceptIdentified: 'Diferenciação conceitual relevante',
        diagnosis: `Você escolheu a alternativa "${selectedOpt?.text}", mas o gabarito oficial é "${correctOpt?.text}". O erro decorre de uma confusão entre conceitos vizinhos.`,
        reinforcementExplanation: input.explanation || 'O examinador utilizou uma formulação muito semelhante para induzir ao erro.',
        suggestedFlashcard: {
          front: `Como diferenciar o conceito correto (${correctOpt?.text}) da alternativa incorreta?`,
          back: `O ponto correto é "${correctOpt?.text}".`,
          pitfall: 'A banca examinadora costuma trocar a abrangência do conceito.',
        },
        isDemo: true,
      });
    }

    const userPrompt = `
QUESTÃO:
"${input.questionStatement}"

ALTERNATIVA QUE O CANDIDATO MARCOU (INCORRETA):
"${selectedOpt?.id}) ${selectedOpt?.text}"

GABARITO OFICIAL (CORRETA):
"${correctOpt?.id}) ${correctOpt?.text}"

COMENTÁRIO DA BANCA:
"${input.explanation || 'Não informado'}"

MOTIVO DECLARADO PELO ESTUDANTE:
"${input.userReason || 'Confusão conceitual'}"

Retorne estritamente um JSON no schema:
{
  "conceptIdentified": "nome do conceito",
  "diagnosis": "diagnóstico cirúrgico de por que o candidato errou",
  "reinforcementExplanation": "explicação para sanar a dúvida imediatamente",
  "suggestedFlashcard": {
    "front": "pergunta de recuperação ativa para FSRS",
    "back": "resposta concisa",
    "pitfall": "pegadinha a evitar"
  }
}
`;

    const raw = await callGeminiStructured<any>(SYSTEM_PROMPT_ANALYZE_ERROR, userPrompt);
    const parsed = AIAnalyzeErrorResponseSchema.parse(raw);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Erro na API analyze-error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar questão com IA.' },
      { status: 500 }
    );
  }
}
