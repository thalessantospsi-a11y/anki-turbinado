'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Deck, Card } from '@/types';
import { deckRepository } from '@/services/firestore/deckRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { CardEditor } from '@/components/cards/CardEditor';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function NewCardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [existingCards, setExistingCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [successCount, setSuccessCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!deckId) return;
    setLoading(true);
    try {
      const [deckData, cardsData] = await Promise.all([
        deckRepository.getById(deckId),
        cardRepository.listByDeck(deckId),
      ]);
      setDeck(deckData);
      setExistingCards(cardsData);
    } catch (err) {
      console.error('Erro ao carregar dados para criação de cartão:', err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCard = async (cardData: any) => {
    if (!user || !deck) return;

    const nowIso = new Date().toISOString();
    const initialFSRS = {
      due: nowIso,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 0 as const, // 0 = New
    };

    // Criação do Cartão Principal
    const createdCard = await cardRepository.create({
      ownerId: user.uid,
      deckId: deck.id,
      cardType: cardData.cardType,
      content: cardData.content,
      metadata: cardData.metadata,
      fsrs: initialFSRS,
    });

    let additionalCards = 1;

    // Se for Cartão Reverso, gera automaticamente o cartão inverso
    if (cardData.cardType === 'reversed') {
      await cardRepository.create({
        ownerId: user.uid,
        deckId: deck.id,
        cardType: 'basic',
        content: {
          ...cardData.content,
          front: cardData.content.back,
          back: cardData.content.front,
        },
        metadata: {
          ...cardData.metadata,
          tags: [...cardData.metadata.tags, 'reverso'],
        },
        fsrs: initialFSRS,
      });
      additionalCards = 2;
    }

    // Atualiza contadores do baralho
    await deckRepository.updateCardCounts(deck.id, {
      ...deck.cardCounts,
      new: deck.cardCounts.new + additionalCards,
      total: deck.cardCounts.total + additionalCards,
    });

    setSuccessCount((prev) => prev + additionalCards);
    setExistingCards((prev) => [createdCard, ...prev]);
  };

  if (loading) {
    return <LoadingState message="Carregando editor de cartões..." />;
  }

  if (!deck) {
    return (
      <EmptyState
        title="Baralho não encontrado"
        description="Não foi possível identificar o baralho para vincular o novo cartão."
        action={
          <Link href="/baralhos">
            <Button variant="outline">Voltar para Baralhos</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Barra Superior com Navegação e Contador de Inserções */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <Link href={`/baralhos/${deck.id}`}>
            <Button variant="ghost" size="sm" className="text-xs -ml-2 text-slate-500 mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para {deck.title}
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Adicionar Flashcard ao Baralho
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {deck.hierarchy.disciplina} › {deck.hierarchy.assunto}
            {deck.hierarchy.subassunto ? ` › ${deck.hierarchy.subassunto}` : ''}
          </p>
        </div>

        {successCount > 0 && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            ✓ {successCount} cartão(ões) adicionado(s) nesta sessão
          </div>
        )}
      </div>

      {/* Editor Completo com Live Preview */}
      <CardEditor
        existingCards={existingCards}
        deckMetadata={{
          deckId: deck.id,
          disciplina: deck.hierarchy.disciplina,
          assunto: deck.hierarchy.assunto,
          subassunto: deck.hierarchy.subassunto,
          concurso: deck.hierarchy.concurso,
          banca: deck.hierarchy.banca,
        }}
        onSave={handleSaveCard}
        onCancel={() => router.push(`/baralhos/${deck.id}`)}
      />
    </div>
  );
}
