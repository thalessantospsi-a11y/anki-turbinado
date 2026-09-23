import { Card } from '@/types';

export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

export function checkCardDuplication(
  newFrontText: string,
  existingCards: Card[]
): { isDuplicate: boolean; similarity: number; matchedCard?: Card } {
  const normalizedNew = normalizeText(newFrontText);
  if (!normalizedNew || normalizedNew.length < 5) {
    return { isDuplicate: false, similarity: 0 };
  }

  const newTokens = new Set(normalizedNew.split(/\s+/).filter((t) => t.length > 2));
  if (newTokens.size === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  let highestSim = 0;
  let mostSimilarCard: Card | undefined;

  for (const card of existingCards) {
    const cardFront = normalizeText(card.content.front);
    if (cardFront === normalizedNew) {
      return { isDuplicate: true, similarity: 1, matchedCard: card };
    }

    const cardTokens = new Set(cardFront.split(/\s+/).filter((t) => t.length > 2));
    if (cardTokens.size === 0) continue;

    // Coeficiente de similaridade de Jaccard sobre palavras relevantes
    let intersection = 0;
    newTokens.forEach((token) => {
      if (cardTokens.has(token)) intersection++;
    });

    const union = new Set([...newTokens, ...cardTokens]).size;
    const similarity = intersection / union;

    if (similarity > highestSim) {
      highestSim = similarity;
      mostSimilarCard = card;
    }
  }

  return {
    isDuplicate: highestSim >= 0.75,
    similarity: highestSim,
    matchedCard: mostSimilarCard,
  };
}
