'use client';

import React, { useState, useEffect } from 'react';
import { Deck, DeckHierarchy } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Tag as TagIcon } from 'lucide-react';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deckData: {
    title: string;
    description?: string;
    hierarchy: DeckHierarchy;
    tags: string[];
  }) => Promise<void>;
  initialDeck?: Deck | null;
}

export function DeckModal({
  isOpen,
  onClose,
  onSave,
  initialDeck,
}: DeckModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [concurso, setConcurso] = useState('');
  const [banca, setBanca] = useState('');
  const [cargo, setCargo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [assunto, setAssunto] = useState('');
  const [subassunto, setSubassunto] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description || '');
      setConcurso(initialDeck.hierarchy.concurso || '');
      setBanca(initialDeck.hierarchy.banca || '');
      setCargo(initialDeck.hierarchy.cargo || '');
      setDisciplina(initialDeck.hierarchy.disciplina);
      setAssunto(initialDeck.hierarchy.assunto);
      setSubassunto(initialDeck.hierarchy.subassunto || '');
      setTags(initialDeck.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setConcurso('');
      setBanca('');
      setCargo('');
      setDisciplina('');
      setAssunto('');
      setSubassunto('');
      setTags([]);
    }
    setError('');
  }, [initialDeck, isOpen]);

  const handleAddTag = () => {
    const formatted = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (formatted && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título do baralho é obrigatório.');
      return;
    }
    if (!disciplina.trim()) {
      setError('A disciplina é obrigatória para a estruturação dos estudos.');
      return;
    }
    if (!assunto.trim()) {
      setError('O assunto é obrigatório para o rastreamento de retenção.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        hierarchy: {
          concurso: concurso.trim() || undefined,
          banca: banca.trim() || undefined,
          cargo: cargo.trim() || undefined,
          disciplina: disciplina.trim(),
          assunto: assunto.trim(),
          subassunto: subassunto.trim() || undefined,
        },
        tags,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível salvar o baralho. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialDeck ? 'Editar Baralho' : 'Novo Baralho de Estudos'}
      description="Configure a hierarquia temática para organização de revisão e modo concurso."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Informações Básicas */}
        <div className="space-y-3">
          <Input
            label="Título do Baralho *"
            placeholder="Ex: Psicologia — Avaliação Psicológica TJCE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descrição (Opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={2}
              placeholder="Objetivos do baralho, referências bibliográficas, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Seção Modo Concurso / Hierarquia */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Hierarquia do Conteúdo (Modo Concurso)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Input
              label="Concurso / Órgão"
              placeholder="Ex: TJCE, MPU"
              value={concurso}
              onChange={(e) => setConcurso(e.target.value)}
            />
            <Input
              label="Banca Examinadora"
              placeholder="Ex: FCC, Cebraspe, FGV"
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
            />
            <Input
              label="Cargo"
              placeholder="Ex: Analista Judiciário"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Input
              label="Disciplina *"
              placeholder="Ex: Psicologia"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              required
            />
            <Input
              label="Assunto *"
              placeholder="Ex: Avaliação Psicológica"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              required
            />
            <Input
              label="Subassunto"
              placeholder="Ex: Testes Psicológicos"
              value={subassunto}
              onChange={(e) => setSubassunto(e.target.value)}
            />
          </div>
        </div>

        {/* Seção Tags */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tags Relacionadas
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">
                #
              </span>
              <input
                type="text"
                placeholder="Adicionar tag e teclar Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="w-full pl-7 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
            >
              Adicionar
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-400 hover:text-blue-700 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botões do Rodapé */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialDeck ? 'Salvar Alterações' : 'Criar Baralho'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
