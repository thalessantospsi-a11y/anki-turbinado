'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Question, Deck } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deckRepository } from '@/services/firestore/deckRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConvertToCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  attemptId?: string;
}

export function ConvertToCardModal({
  isOpen,
  onClose,
  question,
  attemptId,
}: ConvertToCardModalProps) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [cardFormat, setCardFormat] = useState<'basic' | 'cloze' | 'pitfall'>('basic');

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [pitfall, setPitfall] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    deckRepository.listByOwner(user.uid).then((list) => {
      setDecks(list);
      // Seleciona preferencialmente um baralho com a mesma disciplina
      const matching = list.find(
        (d) => d.hierarchy.disciplina.toLowerCase() === question.metadata.disciplina.toLowerCase()
      );
      if (matching) setSelectedDeckId(matching.id);
      else if (list.length > 0) setSelectedDeckId(list[0].id);
    });

    const correctOption = question.options.find((o) => o.id === question.correctOptionId);
    const correctText = correctOption ? correctOption.text : '';

    if (cardFormat === 'basic') {
      setFront(question.statement);
      setBack(`${correctText}\n\nExplicação: ${question.explanation}`);
    } else if (cardFormat === 'cloze') {
      setFront(
        `${question.statement.slice(0, 160)}... Gabarito: {{c1::${correctText}}}`
      );
      setBack('');
    } else {
      setFront(`Qual é a pegadinha cobrada nesta questão de ${question.metadata.assunto}?`);
      setBack(`Gabarito: ${correctText}\n\nExplicação: ${question.explanation}`);
      setPitfall(
        `A banca ${question.metadata.banca || 'examinadora'} tenta induzir o candidato ao erro alterando os conceitos do enunciado.`
      );
    }
  }, [user, isOpen, question, cardFormat]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDeckId) return;

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();

      const createdCard = await cardRepository.create({
        ownerId: user.uid,
        deckId: selectedDeckId,
        cardType: cardFormat === 'cloze' ? 'cloze' : 'basic',
        content: {
          front: front.trim(),
          back: cardFormat === 'cloze' ? front.trim() : back.trim(),
          explanation: question.explanation,
          pitfall: pitfall.trim() || undefined,
          source: {
            title: `Questão ${question.metadata.banca || ''} ${question.metadata.ano || ''}`,
            pageOrSection: question.metadata.concurso,
          },
        },
        metadata: {
          disciplina: question.metadata.disciplina,
          assunto: question.metadata.assunto,
          subassunto: question.metadata.subassunto,
          concurso: question.metadata.concurso,
          banca: question.metadata.banca,
          ano: question.metadata.ano,
          tags: ['origem-questao', ...question.metadata.tags],
          isSuspended: false,
          isArchived: false,
          relatedQuestionId: question.id,
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
      });

      // Se originado de um erro, vincula o id do cartão à tentativa no Caderno de Erros
      if (attemptId) {
        await attemptRepository.updateErrorDetails(attemptId, {
          reason: 'confundi_conceitos',
          generatedCardId: createdCard.id,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao converter questão em flashcard:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transformar Questão em Flashcard FSRS"
      description="Reforce este conceito no ciclo de repetição espaçada para nunca mais errar."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4 pt-2">
        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Cartão criado e inserido no ciclo FSRS!
          </div>
        )}

        {/* 1. Seleção do Baralho de Destino */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Baralho de Destino *
          </label>
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            required
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.hierarchy.disciplina})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Formato do Cartão */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Formato do Cartão de Reforço
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'basic', label: 'Conceito Básico' },
              { id: 'cloze', label: 'Lacuna (Cloze)' },
              { id: 'pitfall', label: 'Foco na Pegadinha' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCardFormat(f.id as any)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  cardFormat === f.id
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Edição da Frente e Verso */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {cardFormat === 'cloze' ? 'Texto com Lacuna {{c1::...}}' : 'Frente (Pergunta)'}
          </label>
          <textarea
            rows={3}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            required
          />
        </div>

        {cardFormat !== 'cloze' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Verso (Resposta e Explicação)
            </label>
            <textarea
              rows={3}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
              required
            />
          </div>
        )}

        {cardFormat === 'pitfall' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Pegadinha de Banca
            </label>
            <textarea
              rows={2}
              value={pitfall}
              onChange={(e) => setPitfall(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        )}

        {/* Rodapé do Modal */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold text-xs gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Salvar no FSRS
          </Button>
        </div>
      </form>
    </Modal>
  );
}
