import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured, isGeminiConfigured } from '@/services/gemini/geminiClient';
import { SYSTEM_PROMPT_EXPLAIN } from '@/services/gemini/prompts';
import { z } from 'zod';

const TeacherRequestSchema = z.object({
  content: z.string().min(20, 'Conteúdo deve ter ao menos 20 caracteres'),
  action: z.enum(['analyze_topics', 'summary', 'mindmap', 'questions', 'pitfalls']),
  options: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = TeacherRequestSchema.parse(body);

    if (!isGeminiConfigured()) {
      if (input.action === 'analyze_topics') {
        return NextResponse.json({
          topics: [
            { title: 'Fundamentos e Conceitos Centrais', summary: 'Regras basilares e definições operacionais.' },
            { title: 'Exceções e Restrições de Prova', summary: 'Casos particulares comumente cobrados em bancas.' },
            { title: 'Aplicações Práticas e Jurisprudência', summary: 'Como o conteúdo é articulado em casos reais.' },
          ],
          estimatedReadMinutes: Math.max(1, Math.round(input.content.split(/\s+/).length / 150)),
          isDemo: true,
        });
      }

      if (input.action === 'summary') {
        return NextResponse.json({
          title: 'Resumo Estruturado do Conteúdo',
          bulletPoints: [
            'O material apresenta definições conceituais com foco em regras gerais.',
            'As exceções representam o principal foco de armadilhas de examinadores.',
            'A memorização deve priorizar termos que delimitam o alcance da regra.',
          ],
          keyTakeaways: [
            'Regra geral: aplicação universal salvo disposição em contrário.',
            'Exceções estritas exigem previsão expressa.',
          ],
          isDemo: true,
        });
      }

      if (input.action === 'mindmap') {
        return NextResponse.json({
          centralTopic: 'Tópico Central Analisado',
          branches: [
            { name: 'Definições', subbranches: ['Conceito Primário', 'Requisitos Legais', 'Finalidade'] },
            { name: 'Classificação', subbranches: ['Espécie A', 'Espécie B', 'Critérios de Distinção'] },
            { name: 'Armadilhas de Prova', subbranches: ['Troca de Prazos', 'Inversão de Sujeitos'] },
          ],
          isDemo: true,
        });
      }

      if (input.action === 'pitfalls') {
        return NextResponse.json({
          pitfalls: [
            {
              topic: 'Inversão Conceitual',
              whatExaminerDoes: 'A banca troca a definição do instituto A pelo instituto B mantendo o restante do texto correto.',
              howToNotFall: 'Verifique se o sujeito da oração realmente corresponde ao efeito atribuído.',
            },
            {
              topic: 'Generalizações Indevidas',
              whatExaminerDoes: 'Adiciona palavras como "sempre", "em qualquer hipótese" ou "indelegável".',
              howToNotFall: 'Desconfie de afirmações 100% categóricas em questões de ciências humanas e jurídicas.',
            },
          ],
          isDemo: true,
        });
      }

      if (input.action === 'questions') {
        return NextResponse.json({
          questions: [
            {
              statement: `Em relação ao conteúdo abordado no material, assinale a alternativa que expressa a regra correta:`,
              options: [
                { id: 'A', text: 'A regra aplica-se irrestritamente sem qualquer exceção legal.' },
                { id: 'B', text: 'O instituto depende de requisitos formais expressos para sua validade.' },
                { id: 'C', text: 'Apenas órgãos de cúpula podem adotar a referida orientação.' },
                { id: 'D', text: 'É dispensada a fundamentação prévia nas decisões correlatas.' },
              ],
              correctOptionId: 'B',
              explanation: 'A alternativa B está correta pois requisitos formais expressos são indispensáveis à validade do ato.',
              difficulty: 'medium',
            },
          ],
          isDemo: true,
        });
      }
    }

    // Chamadas reais com Gemini
    let prompt = '';
    let systemInstruction = SYSTEM_PROMPT_EXPLAIN;

    if (input.action === 'analyze_topics') {
      prompt = `
Analise o texto a seguir e identifique entre 3 a 7 tópicos centrais com breve síntese.
Retorne estritamente um JSON no schema:
{
  "topics": [
    { "title": "Nome do Tópico", "summary": "Breve síntese de 1 a 2 linhas" }
  ],
  "estimatedReadMinutes": 5
}

MATERIAL:
"""
${input.content}
"""
`;
    } else if (input.action === 'summary') {
      prompt = `
Gere um resumo estruturado de alto rendimento para concursos a partir do texto fornecido.
Retorne estritamente um JSON no schema:
{
  "title": "Título do Resumo",
  "bulletPoints": ["tópico 1", "tópico 2", "tópico 3"],
  "keyTakeaways": ["ponto memorável 1", "ponto memorável 2"]
}

MATERIAL:
"""
${input.content}
"""
`;
    } else if (input.action === 'mindmap') {
      prompt = `
Transforme o texto a seguir em um mapa mental conceitual textual hierárquico.
Retorne estritamente um JSON no schema:
{
  "centralTopic": "Tema Central",
  "branches": [
    { "name": "Ramificação 1", "subbranches": ["Subtópico A", "Subtópico B"] }
  ]
}

MATERIAL:
"""
${input.content}
"""
`;
    } else if (input.action === 'pitfalls') {
      prompt = `
Identifique no material as principais pegadinhas, trocas de termos ou sutilezas conceituais que bancas examinadoras usam para induzir ao erro.
Retorne estritamente um JSON no schema:
{
  "pitfalls": [
    {
      "topic": "Assunto da Pegadinha",
      "whatExaminerDoes": "Como o examinador formula a armadilha",
      "howToNotFall": "Dica cirúrgica para não errar"
    }
  ]
}

MATERIAL:
"""
${input.content}
"""
`;
    } else if (input.action === 'questions') {
      prompt = `
A partir do material a seguir, crie de 2 a 5 questões inéditas no estilo de concurso público (múltipla escolha com 4 ou 5 alternativas).
Nunca crie alternativas fáceis ou infantis.
Retorne estritamente um JSON no schema:
{
  "questions": [
    {
      "statement": "Enunciado claro e contextualizado",
      "options": [
        { "id": "A", "text": "texto da alternativa A" },
        { "id": "B", "text": "texto da alternativa B" },
        { "id": "C", "text": "texto da alternativa C" },
        { "id": "D", "text": "texto da alternativa D" }
      ],
      "correctOptionId": "B",
      "explanation": "Comentário completo justificando a correta e apontando o erro das outras.",
      "difficulty": "medium"
    }
  ]
}

MATERIAL:
"""
${input.content}
"""
`;
    }

    const raw = await callGeminiStructured<any>(systemInstruction, prompt);
    return NextResponse.json(raw);
  } catch (error: any) {
    console.error('Erro no Modo Professor API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar conteúdo no Modo Professor.' },
      { status: 500 }
    );
  }
}
