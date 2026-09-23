'use client';

import React, { useState } from 'react';
import { AIGeneratedCardItem, Deck } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cardRepository } from '@/services/firestore/cardRepository';
import { deckRepository } from '@/services/firestore/deckRepository';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Check, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

interface AIGeneratedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: AIGeneratedCardItem[];
  decks: Deck[];
  defaultDeckId?: string;
  onSavedSuccess?: (count: number) => void;
}

export function AIGeneratedReviewModal({
  isOpen,
  onClose,
  cards: initialCards,
  decks,
  defaultDeckId,
  onSavedSuccess,
}: AIGeneratedReviewModalProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<AIGeneratedCardItem[]>(initialCards);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(initialCards.map((_, i) => i))
  );
  const [targetDeckId, setTargetDeckId] = useState(defaultDeckId || (decks[0]?.id ?? ''));
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Sincroniza cards quando abrir
  React.useEffect(() => {
    setCards(initialCards);
    setSelectedIndices(new Set(initialCards.map((_, i) => i)));
    if (defaultDeckId) setTargetDeckId(defaultDeckId);
  }, [initialCards, defaultDeckId]);

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleUpdateCard = (index: number, front: string, back: string) => {
    const next = [...cards];
    next[index] = { ...next[index], front, back };
    setCards(next);
    setEditingIndex(null);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
    const nextSelected = new Set<number>();
    selectedIndices.forEach((idx) => {
      if (idx < index) nextSelected.add(idx);
      else if (idx > index) nextSelected.add(idx - 1);
    });
    setSelectedIndices(nextSelected);
  };

  const handleApproveAll = async () => {
    if (!user || !targetDeckId) return;

    const cardsToSave = cards.filter((_, idx) => selectedIndices.has(idx));
    if (cardsToSave.length === 0) return;

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const targetDeck = decks.find((d) => d.id === targetDeckId);

      await cardRepository.batchCreate(
        cardsToSave.map((c) => ({
          ownerId: user.uid,
          deckId: targetDeckId,
          cardType: c.cardType,
          content: {
            front: c.front,
            back: c.back,
            explanation: c.explanation,
            example: c.example,
            pitfall: c.pitfall,
          },
          metadata: {
            disciplina: c.disciplina || targetDeck?.hierarchy.disciplina || 'Geral',
            assunto: c.assunto || targetDeck?.hierarchy.assunto || 'Tópico Geral',
            tags: ['ia-gerado', ...c.tags],
            isSuspended: false,
            isArchived: false,
          },
          fsrs: {
            due: nowIso,
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

      if (targetDeck) {
        await deckRepository.updateCardCounts(targetDeck.id, {
          ...targetDeck.cardCounts,
          new: targetDeck.cardCounts.new + cardsToSave.length,
          total: targetDeck.cardCounts.total + cardsToSave.length,
        });
      }

      onSavedSuccess?.(cardsToSave.length);
      onClose();
    } catch (err) {
      console.error('Erro ao aprovar e salvar cartões gerados pela IA:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisão de Conteúdo Gerado por IA"
      description="Valide, edite ou descarte os flashcards antes de inseri-los no seu ciclo de repetição espaçada."
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-2">
        {/* Seletor de Baralho */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            Salvar os cartões aprovados no baralho:
          </label>
          <select
            value={targetDeckId}
            onChange={(e) => setTargetDeckId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.hierarchy.disciplina})
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Cartões com Curadoria (Aprovar / Editar / Descartar) */}
        <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {cards.map((card, idx) => {
            const isSelected = selectedIndices.has(idx);
            const isEditing = editingIndex === idx;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-300 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(idx)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      #{idx + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {card.cardType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Editar conteúdo deste cartão"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Descartar este cartão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Cartão */}
                {isEditing ? (
                  <div className="space-y-2 mt-3 text-xs">
                    <input
                      type="text"
                      defaultValue={card.front}
                      id={`edit-front-${idx}`}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <textarea
                      rows={2}
                      defaultValue={card.back}
                      id={`edit-back-${idx}`}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          const f = (document.getElementById(`edit-front-${idx}`) as HTMLInputElement)?.value;
                          const b = (document.getElementById(`edit-back-${idx}`) as HTMLTextAreaElement)?.value;
                          handleUpdateCard(idx, f, b);
                        }}
                      >
                        Salvar Edição
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {card.front}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {card.back}
                    </p>
                    {card.pitfall && (
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 block pt-1">
                        ⚠️ Pegadinha: {card.pitfall}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé com Contador de Aprovados e Botão de Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-semibold">
            {selectedIndices.size} de {cards.length} cartões selecionados para inclusão
          </span>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Descartar Todos
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleApproveAll}
              isLoading={isSaving}
              disabled={selectedIndices.size === 0}
              className="font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar e Inserir no FSRS ({selectedIndices.size})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
