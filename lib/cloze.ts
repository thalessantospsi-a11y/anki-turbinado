/**
 * Utilitários para parsing e renderização de Cloze Deletion padrão Anki:
 * Exemplo: {{c1::termo}} ou {{c1::termo::dica}}
 */

const CLOZE_REGEX = /\{\{c(\d+)::([^:]+?)(?:::([^:]+?))?\}\}/g;

export interface ClozeItem {
  index: number;
  text: string;
  hint?: string;
}

export function extractClozeIndices(rawText: string): number[] {
  const indices = new Set<number>();
  let match: RegExpExecArray | null;

  const regex = new RegExp(CLOZE_REGEX);
  while ((match = regex.exec(rawText)) !== null) {
    indices.add(parseInt(match[1], 10));
  }

  return Array.from(indices).sort((a, b) => a - b);
}

export function renderClozeFront(rawText: string, activeIndex: number): string {
  return rawText.replace(CLOZE_REGEX, (fullMatch, indexStr, answer, hint) => {
    const idx = parseInt(indexStr, 10);
    if (idx === activeIndex) {
      return hint ? `[${hint}]` : '[...]';
    }
    // Outros clozes aparecem com seu texto normal durante a revisão deste índice
    return answer;
  });
}

export function renderClozeBack(
  rawText: string,
  activeIndex: number
): { formattedText: string; activeAnswers: string[] } {
  const activeAnswers: string[] = [];

  const formattedText = rawText.replace(
    CLOZE_REGEX,
    (fullMatch, indexStr, answer) => {
      const idx = parseInt(indexStr, 10);
      if (idx === activeIndex) {
        activeAnswers.push(answer);
        return `<span class="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-700">${answer}</span>`;
      }
      return answer;
    }
  );

  return { formattedText, activeAnswers };
}
