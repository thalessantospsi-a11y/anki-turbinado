'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Deck } from '@/types';
import { deckRepository } from '@/services/firestore/deckRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { DeckCard } from '@/components/decks/DeckCard';
import { DeckModal } from '@/components/decks/DeckModal';
import { DeckFilterBar } from '@/components/decks/DeckFilterBar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Plus, Upload, Layers } from 'lucide-react';

export default function DecksPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [selectedBanca, setSelectedBanca] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'due' | 'name'>('due');
  const [showArchived, setShowArchived] = useState(false);

  const fetchDecks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await deckRepository.listByOwner(user.uid, {
        isArchived: showArchived,
      });
      setDecks(data);
    } catch (err) {
      console.error('Erro ao buscar baralhos:', err);
    } finally {
      setLoading(false);
    }
  }, [user, showArchived]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Lista única de disciplinas e bancas para os filtros
  const disciplinas = useMemo(() => {
    const set = new Set<string>();
    decks.forEach((d) => {
      if (d.hierarchy.disciplina) set.add(d.hierarchy.disciplina);
    });
    return Array.from(set).sort();
  }, [decks]);

  const bancas = useMemo(() => {
    const set = new Set<string>();
    decks.forEach((d) => {
      if (d.hierarchy.banca) set.add(d.hierarchy.banca);
    });
    return Array.from(set).sort();
  }, [decks]);

  // Aplicação dos filtros e ordenação
  const filteredDecks = useMemo(() => {
    return decks
      .filter((deck) => {
        const matchesSearch =
          search === '' ||
          deck.title.toLowerCase().includes(search.toLowerCase()) ||
          deck.hierarchy.assunto.toLowerCase().includes(search.toLowerCase()) ||
          (deck.hierarchy.concurso &&
            deck.hierarchy.concurso.toLowerCase().includes(search.toLowerCase())) ||
          deck.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        const matchesDisciplina =
          !selectedDisciplina || deck.hierarchy.disciplina === selectedDisciplina;

        const matchesBanca =
          !selectedBanca || deck.hierarchy.banca === selectedBanca;

        return matchesSearch && matchesDisciplina && matchesBanca;
      })
      .sort((a, b) => {
        if (sortBy === 'due') {
          return b.cardCounts.review - a.cardCounts.review;
        }
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [decks, search, selectedDisciplina, selectedBanca, sortBy]);

  // Ações de criação e edição
  const handleSaveDeck = async (deckData: any) => {
    if (!user) return;
    if (editingDeck) {
      await deckRepository.update(editingDeck.id, deckData);
    } else {
      await deckRepository.create({
        ...deckData,
        ownerId: user.uid,
      });
    }
    await fetchDecks();
  };

  const handleDuplicateDeck = async (deck: Deck) => {
    if (!user) return;
    try {
      const newDeck = await deckRepository.create({
        ownerId: user.uid,
        title: `${deck.title} (Cópia)`,
        description: deck.description,
        hierarchy: deck.hierarchy,
        tags: [...deck.tags],
      });

      // Duplica os cartões do baralho
      const originalCards = await cardRepository.listByDeck(deck.id);
      if (originalCards.length > 0) {
        await cardRepository.batchCreate(
          originalCards.map((c) => ({
            ownerId: user.uid,
            deckId: newDeck.id,
            cardType: c.cardType,
            content: c.content,
            metadata: c.metadata,
            fsrs: {
              due: new Date().toISOString(),
              stability: 0,
              difficulty: 0,
              elapsedDays: 0,
              scheduledDays: 0,
              reps: 0,
              lapses: 0,
              state: 0,
            },
          }))
        );
      }
      await fetchDecks();
    } catch (err) {
      console.error('Erro ao duplicar baralho:', err);
    }
  };

  const handleArchiveDeck = async (deck: Deck) => {
    await deckRepository.update(deck.id, { isArchived: !deck.isArchived });
    await fetchDecks();
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm('Deseja realmente excluir este baralho e seus cartões?')) {
      await deckRepository.delete(deckId);
      await fetchDecks();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            Meus Baralhos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize seu conteúdo por concurso, banca, disciplina e assunto para o ciclo FSRS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setEditingDeck(null);
              setIsModalOpen(true);
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Baralho
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <DeckFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedDisciplina={selectedDisciplina}
        onDisciplinaChange={setSelectedDisciplina}
        disciplinas={disciplinas}
        selectedBanca={selectedBanca}
        onBancaChange={setSelectedBanca}
        bancas={bancas}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
      />

      {/* Grid de Baralhos */}
      {loading ? (
        <LoadingState message="Carregando seus baralhos..." />
      ) : filteredDecks.length === 0 ? (
        <EmptyState
          icon="📚"
          title={showArchived ? 'Nenhum baralho arquivado' : 'Nenhum baralho encontrado'}
          description={
            showArchived
              ? 'Você não possui nenhum baralho arquivado no momento.'
              : 'Comece criando seu primeiro baralho de estudos estruturado para concursos.'
          }
          action={
            !showArchived && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingDeck(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Meu Primeiro Baralho
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onEdit={(d) => {
                setEditingDeck(d);
                setIsModalOpen(true);
              }}
              onDuplicate={handleDuplicateDeck}
              onArchive={handleArchiveDeck}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <DeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeck}
        initialDeck={editingDeck}
      />
    </div>
  );
}
