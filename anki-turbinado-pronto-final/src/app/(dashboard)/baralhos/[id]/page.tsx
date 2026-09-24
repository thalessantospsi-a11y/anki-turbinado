'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Deck, Card as Flashcard } from '@/types';
import { deckRepository } from '@/services/firestore/deckRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  ArrowLeft,
  Play,
  Plus,
  RotateCcw,
  Clock,
  CheckCircle2,
  Trash2,
  EyeOff,
  Eye,
  Tag,
  FolderTree,
} from 'lucide-react';

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<'all' | 'due' | 'new' | 'suspended'>('all');

  const loadDeckAndCards = useCallback(async () => {
    if (!deckId) return;
    setLoading(true);
    try {
      const [deckData, cardsData] = await Promise.all([
        deckRepository.getById(deckId),
        cardRepository.listByDeck(deckId),
      ]);
      setDeck(deckData);
      setCards(cardsData);
    } catch (err) {
      console.error('Erro ao carregar detalhes do baralho:', err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeckAndCards();
  }, [loadDeckAndCards]);

  const handleToggleSuspend = async (card: Flashcard) => {
    const isSuspended = !card.metadata.isSuspended;
    await cardRepository.update(card.id, {
      metadata: {
        ...card.metadata,
        isSuspended,
      },
    });
    await loadDeckAndCards();
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Deseja excluir este cartão permanentemente?')) {
      await cardRepository.delete(cardId);
      await loadDeckAndCards();
    }
  };

  const filteredCards = cards.filter((c) => {
    const isDue = new Date(c.fsrs.due).getTime() <= Date.now();
    if (filterState === 'due') return isDue && !c.metadata.isSuspended;
    if (filterState === 'new') return c.fsrs.state === 0 && !c.metadata.isSuspended;
    if (filterState === 'suspended') return c.metadata.isSuspended;
    return true;
  });

  const dueCount = cards.filter(
    (c) => new Date(c.fsrs.due).getTime() <= Date.now() && !c.metadata.isSuspended
  ).length;

  if (loading) {
    return <LoadingState message="Carregando cartões do baralho..." />;
  }

  if (!deck) {
    return (
      <EmptyState
        title="Baralho não encontrado"
        description="O baralho solicitado não existe ou foi excluído."
        action={
          <Link href="/baralhos">
            <Button variant="outline">Voltar para Baralhos</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Botão de Retorno e Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/baralhos">
          <Button variant="ghost" size="sm" className="text-xs -ml-2 text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Baralhos
          </Button>
        </Link>
      </div>

      {/* Painel de Cabeçalho do Baralho */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Hierarquia de Concurso */}
            <div className="flex flex-wrap items-center gap-1.5">
              {deck.hierarchy.concurso && (
                <Badge variant="purple" className="text-xs">
                  {deck.hierarchy.concurso}
                </Badge>
              )}
              {deck.hierarchy.banca && (
                <Badge variant="secondary" className="text-xs">
                  {deck.hierarchy.banca}
                </Badge>
              )}
              {deck.hierarchy.cargo && (
                <Badge variant="outline" className="text-xs">
                  {deck.hierarchy.cargo}
                </Badge>
              )}
              <Badge variant="default" className="text-xs">
                {deck.hierarchy.disciplina}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {deck.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FolderTree className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{deck.hierarchy.assunto}</span>
              {deck.hierarchy.subassunto && (
                <>
                  <span>›</span>
                  <span>{deck.hierarchy.subassunto}</span>
                </>
              )}
            </div>

            {deck.description && (
              <p className="text-xs text-slate-500 max-w-2xl pt-1">
                {deck.description}
              </p>
            )}
          </div>

          {/* Botões de Ação do Baralho */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 min-w-[220px]">
            <Link href={`/revisao?deckId=${deck.id}`} className="flex-1">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold shadow-md shadow-blue-500/20 gap-2"
                disabled={dueCount === 0 && cards.length === 0}
              >
                <Play className="w-4 h-4 fill-current" />
                Estudar ({dueCount})
              </Button>
            </Link>

            <Link href={`/baralhos/${deck.id}/novo-cartao`}>
              <Button variant="outline" size="md" className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Cartão
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumo de Estados FSRS do Baralho */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <span className="text-slate-500 block text-[11px]">Novos Cartões</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {cards.filter((c) => c.fsrs.state === 0).length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-slate-500 block text-[11px]">A Revisar Hoje</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {dueCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
            <span className="text-slate-500 block text-[11px]">Em Aprendizado</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {cards.filter((c) => c.fsrs.state === 1 || c.fsrs.state === 3).length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block text-[11px]">Total no Baralho</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Lista e Filtros de Cartões */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Cartões do Baralho ({filteredCards.length})
          </h2>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterState('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterState === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Todos ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('due')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterState === 'due'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Devidos ({dueCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('new')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterState === 'new'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Novos
            </button>
            <button
              type="button"
              onClick={() => setFilterState('suspended')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterState === 'suspended'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Suspensos
            </button>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="Nenhum cartão neste filtro"
            description="Adicione novos cartões para começar a alimentar o agendamento FSRS deste baralho."
            action={
              <Link href={`/baralhos/${deck.id}/novo-cartao`}>
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Criar Primeiro Cartão
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => {
              const isDue = new Date(card.fsrs.due).getTime() <= Date.now();

              return (
                <Card
                  key={card.id}
                  className={`p-4 transition-all ${
                    card.metadata.isSuspended
                      ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {card.cardType}
                        </Badge>
                        {isDue && !card.metadata.isSuspended && (
                          <Badge variant="success" className="text-[10px]">
                            Devido para Revisão
                          </Badge>
                        )}
                        {card.metadata.isSuspended && (
                          <Badge variant="warning" className="text-[10px]">
                            Suspenso
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {card.content.front}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {card.content.back}
                        </p>
                      </div>

                      {card.content.pitfall && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                          <span className="font-bold">⚠️ Pegadinha:</span> {card.content.pitfall}
                        </div>
                      )}
                    </div>

                    {/* Metadados FSRS e Ações */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <div className="text-right">
                        <span>Estabilidade: {card.fsrs.stability.toFixed(1)}d</span>
                        <span className="block text-[10px]">
                          Lapsos: {card.fsrs.lapses} • Reps: {card.fsrs.reps}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(card)}
                          title={card.metadata.isSuspended ? 'Reativar cartão' : 'Suspender cartão'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {card.metadata.isSuspended ? (
                            <Eye className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          title="Excluir cartão"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
