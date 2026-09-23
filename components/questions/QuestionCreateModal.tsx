'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { questionRepository } from '@/services/firestore/questionRepository';

interface QuestionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function QuestionCreateModal({
  isOpen,
  onClose,
  onCreated,
}: QuestionCreateModalProps) {
  const { user } = useAuth();

  const [statement, setStatement] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  // Metadados
  const [disciplina, setDisciplina] = useState('');
  const [assunto, setAssunto] = useState('');
  const [subassunto, setSubassunto] = useState('');
  const [banca, setBanca] = useState('');
  const [concurso, setConcurso] = useState('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!statement.trim()) {
      setError('O enunciado da questão é obrigatório.');
      return;
    }
    if (options.slice(0, 4).some((o) => !o.trim())) {
      setError('Preencha ao menos as 4 primeiras alternativas (A, B, C, D).');
      return;
    }
    if (!disciplina.trim() || !assunto.trim()) {
      setError('Disciplina e assunto são obrigatórios.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const validOptions = options
        .filter((opt) => opt.trim().length > 0)
        .map((text, idx) => ({
          id: String.fromCharCode(65 + idx),
          text: text.trim(),
        }));

      await questionRepository.create({
        ownerId: user.uid,
        statement: statement.trim(),
        options: validOptions,
        correctOptionId: String.fromCharCode(65 + correctIndex),
        explanation: explanation.trim() || 'Gabarito oficial da banca examinadora.',
        metadata: {
          disciplina: disciplina.trim(),
          assunto: assunto.trim(),
          subassunto: subassunto.trim() || undefined,
          banca: banca.trim() || undefined,
          concurso: concurso.trim() || undefined,
          ano: Number(ano) || undefined,
          difficulty,
          tags: ['manual'],
        },
        isFavorite: false,
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar questão. Verifique os dados informados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Nova Questão"
      description="Adicione questões ao seu banco para treinar e alimentar o Caderno de Erros."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 1. Enunciado */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Enunciado da Questão *
          </label>
          <textarea
            rows={4}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Cole aqui o texto da questão com instruções e afirmações..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            required
          />
        </div>

        {/* 2. Alternativas A-E */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Alternativas (Marque o gabarito correto)
          </label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctGabarito"
                checked={correctIndex === idx}
                onChange={() => setCorrectIndex(idx)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
                title="Gabarito correto"
              />
              <span className="text-xs font-bold text-slate-400 w-4 font-mono">
                {String.fromCharCode(65 + idx)})
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Texto da alternativa ${String.fromCharCode(65 + idx)}`}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* 3. Explicação / Comentário */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Comentário do Gabarito & Explicação Teórica
          </label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explicação do porquê a alternativa está certa ou errada..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
          />
        </div>

        {/* 4. Metadados */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
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
            label="Banca Examinadora"
            placeholder="Ex: FCC, Cebraspe"
            value={banca}
            onChange={(e) => setBanca(e.target.value)}
          />
          <Input
            label="Concurso / Órgão"
            placeholder="Ex: TJCE"
            value={concurso}
            onChange={(e) => setConcurso(e.target.value)}
          />
          <Input
            label="Ano"
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value, 10))}
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Dificuldade
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            >
              <option value="easy">Fácil</option>
              <option value="medium">Média</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
        </div>

        {/* Botões do Rodapé */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="font-bold text-xs">
            Salvar Questão
          </Button>
        </div>
      </form>
    </Modal>
  );
}
