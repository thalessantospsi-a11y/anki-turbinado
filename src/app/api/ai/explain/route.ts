import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured, isGeminiConfigured } from '@/services/gemini/geminiClient';
import { SYSTEM_PROMPT_EXPLAIN } from '@/services/gemini/prompts';
import { z } from 'zod';

const ExplainRequestSchema = z.object({
  concept: z.string().min(2),
  style: z.enum(['simple', 'exam', 'technical', 'analogy', 'pitfall']).default('simple'),
  context: z.string().optional(),
});

const ExplainResponseSchema = z.object({
  explanation: z.string(),
  keyTakeaway: z.string(),
  samplePitfall: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = ExplainRequestSchema.parse(body);

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        explanation: `[Demonstração] O conceito de "${input.concept}" no estilo "${input.style}" foca nos pontos centrais sem ambiguidades conceituais.`,
        keyTakeaway: 'Ponto-chave: memorizar a regra geral e não confundir com as exceções da banca.',
        samplePitfall: 'Atenção aos termos restritivos como "sempre", "apenas" e "vedado".',
        isDemo: true,
      });
    }

    const userPrompt = `
Explique o conceito a seguir estritamente no estilo: ${input.style}.
CONCEITO: "${input.concept}"
CONTEXTO ADICIONAL: "${input.context || 'Estudo para concursos e exames'}"

Retorne estritamente um JSON com:
- "explanation": texto explicativo claro e estruturado.
- "keyTakeaway": frase curta de síntese para memorização.
- "samplePitfall": como examinadores costumam armar pegadinhas sobre isso.
`;

    const raw = await callGeminiStructured<any>(SYSTEM_PROMPT_EXPLAIN, userPrompt);
    const parsed = ExplainResponseSchema.parse(raw);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Erro na API explain:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar explicação com IA.' },
      { status: 500 }
    );
  }
}
