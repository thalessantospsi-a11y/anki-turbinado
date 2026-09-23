'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardType, CardContent, CardMetadata, Card } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardPreview } from './CardPreview';
import { checkCardDuplication } from '@/lib/duplicateCheck';
import {
  Code,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CardEditorProps {
  initialCard?: Card | null;
  existingCards?: Card[];
  deckMetadata: {
    deckId: string;
    disciplina: string;
    assunto: string;
    subassunto?: string;
    concurso?: string;
    banca?: string;
  };
  onSave: (cardData: {
    cardType: CardType;
    content: CardContent;
    metadata: CardMetadata;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function CardEditor({
  initialCard,
  existingCards = [],
  deckMetadata,
  onSave,
  onCancel,
}: CardEditorProps) {
  const [cardType, setCardType] = useState<CardType>(initialCard?.cardType || 'basic');

  // Conteúdo
  const [front, setFront] = useState(initialCard?.content.front || '');
  const [back, setBack] = useState(initialCard?.content.back || '');
  const [options, setOptions] = useState<string[]>(
    initialCard?.content.options || ['', '', '', '']
  );
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    initialCard?.content.correctOptionIndex ?? 0
  );
  const [explanation, setExplanation] = useState(initialCard?.content.explanation || '');
  const [example, setExample] = useState(initialCard?.content.example || '');
  const [pitfall, setPitfall] = useState(initialCard?.content.pitfall || '');
  const [sourceTitle, setSourceTitle] = useState(initialCard?.content.source?.title || '');
  const [sourceRef, setSourceRef] = useState(initialCard?.content.source?.pageOrSection || '');

  // Metadados
  const [tags, setTags] = useState<string[]>(initialCard?.metadata.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Verificação de Duplicação
  const dupCheck = checkCardDuplication(front, existingCards);

  // Inserção de Cloze {{c1::...}} na seleção de texto
  const handleInsertCloze = () => {
    const textarea = frontTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = front.substring(start, end) || 'termo_chave';

    // Determina o próximo número de cloze disponível
    const currentMatches = front.match(/\{\{c(\d+)::/g) || [];
    const nextIndex = currentMatches.length + 1;

    const replacement = `{{c${nextIndex}::${selected}}}`;
    const newFront = front.substring(0, start) + replacement + front.substring(end);
    setFront(newFront);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length > 2) {
      const next = options.filter((_, i) => i !== idx);
      setOptions(next);
      if (correctOptionIndex >= next.length) {
        setCorrectOptionIndex(0);
      }
    }
  };

  const handleOptionChange = (idx: number, text: string) => {
    const next = [...options];
    next[idx] = text;
    setOptions(next);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim()) {
      setErrorMsg('A frente do cartão é obrigatória.');
      return;
    }

    if (cardType === 'cloze' && !front.includes('{{c')) {
      setErrorMsg('Cartões do tipo Cloze exigem ao menos uma lacuna no formato {{c1::termo}}.');
      return;
    }

    if (cardType === 'basic' && !back.trim()) {
      setErrorMsg('A resposta (verso) é obrigatória para cartões básicos.');
      return;
    }

    if (cardType === 'multiple_choice' && options.some((opt) => !opt.trim())) {
      setErrorMsg('Todas as alternativas de múltipla escolha devem ser preenchidas.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      await onSave({
        cardType,
        content: {
          front: front.trim(),
          back: cardType === 'cloze' ? front.trim() : back.trim(),
          options: cardType === 'multiple_choice' ? options : undefined,
          correctOptionIndex:
            cardType === 'multiple_choice' || cardType === 'true_false'
              ? correctOptionIndex
              : undefined,
          explanation: explanation.trim() || undefined,
          example: example.trim() || undefined,
          pitfall: pitfall.trim() || undefined,
          source: sourceTitle.trim()
            ? {
                title: sourceTitle.trim(),
                pageOrSection: sourceRef.trim() || undefined,
              }
            : undefined,
        },
        metadata: {
          disciplina: deckMetadata.disciplina,
          assunto: deckMetadata.assunto,
          subassunto: deckMetadata.subassunto,
          concurso: deckMetadata.concurso,
          banca: deckMetadata.banca,
          tags,
          isSuspended: false,
          isArchived: false,
        },
      });

      // Limpa os campos para criar o próximo
      if (!initialCard) {
        setFront('');
        setBack('');
        setExplanation('');
        setPitfall('');
        setExample('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao salvar o cartão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const previewContent: CardContent = {
    front,
    back,
    options,
    correctOptionIndex,
    explanation,
    example,
    pitfall,
    source: sourceTitle ? { title: sourceTitle, pageOrSection: sourceRef } : undefined,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Coluna do Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Alerta de Possível Duplicação */}
        {dupCheck.isDuplicate && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Cartão Semelhante Encontrado ({Math.round(dupCheck.similarity * 100)}%)</p>
              <p className="text-[11px] mt-0.5">
                Já existe um cartão similar: <span className="font-semibold italic">&quot;{dupCheck.matchedCard?.content.front}&quot;</span>.
              </p>
            </div>
          </div>
        )}

        {/* 1. Seleção do Tipo de Cartão */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tipo de Cartão
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'basic', label: 'Básico (Frente/Verso)' },
              { id: 'reversed', label: 'Cartão Reverso' },
              { id: 'cloze', label: 'Omissão de Lacuna (Cloze)' },
              { id: 'multiple_choice', label: 'Múltipla Escolha' },
              { id: 'true_false', label: 'Certo ou Errado (V/F)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCardType(t.id as CardType)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  cardType === t.id
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Campo Frente / Enunciado */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {cardType === 'cloze' ? 'Texto com Lacunas (Cloze) *' : 'Frente (Pergunta ou Conceito) *'}
            </label>
            {cardType === 'cloze' && (
              <button
                type="button"
                onClick={handleInsertCloze}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
              >
                <Code className="w-3 h-3" />
                Inserir Lacuna {`{{c1::...}}`}
              </button>
            )}
          </div>
          <textarea
            ref={frontTextareaRef}
            rows={4}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder={
              cardType === 'cloze'
                ? 'Ex: O princípio da {{c1::legalidade}} estabelece que ninguém será obrigado a fazer...'
                : 'Qual é o conceito de validade de conteúdo em psicometria?'
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            required
          />
        </div>

        {/* 3. Campo Verso / Resposta (Quando aplicável) */}
        {cardType !== 'cloze' && cardType !== 'multiple_choice' && cardType !== 'true_false' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Verso (Resposta) *
            </label>
            <textarea
              rows={4}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Refere-se ao grau em que os itens do teste representam o domínio do construto avaliado."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        )}

        {/* 4. Alternativas de Múltipla Escolha */}
        {cardType === 'multiple_choice' && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Alternativas (Selecione a correta)
            </label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctOptionIndex === idx}
                  onChange={() => setCorrectOptionIndex(idx)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Marcar como alternativa correta"
                />
                <span className="text-xs font-bold text-slate-400 w-4">
                  {String.fromCharCode(65 + idx)})
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                  className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddOption}
                className="text-xs text-blue-600"
              >
                + Adicionar Alternativa
              </Button>
            )}
          </div>
        )}

        {/* 5. Certo ou Errado */}
        {cardType === 'true_false' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Gabarito da Afirmação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="tf"
                  checked={correctOptionIndex === 0}
                  onChange={() => setCorrectOptionIndex(0)}
                  className="w-4 h-4 text-blue-600"
                />
                Verdadeiro / Certo
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="tf"
                  checked={correctOptionIndex === 1}
                  onChange={() => setCorrectOptionIndex(1)}
                  className="w-4 h-4 text-blue-600"
                />
                Falso / Errado
              </label>
            </div>
          </div>
        )}

        {/* 6. Campos Pedagógicos Avançados (Pegadinha, Explicação, Fonte) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <span>Campos Didáticos & Pegadinha de Banca</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-3">
              {/* Pegadinha de Banca */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pegadinha de Banca (Como o examinador tenta confundir você)
                </label>
                <textarea
                  rows={2}
                  value={pitfall}
                  onChange={(e) => setPitfall(e.target.value)}
                  placeholder="Ex: A banca costuma trocar validade de construto por validade de critério."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Explicação Didática */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  Explicação Teórica Completa
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explique o porquê da resposta..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Exemplo Prático */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Exemplo de Aplicação
                </label>
                <textarea
                  rows={2}
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="Ex: Um teste de matemática que inclui questões de leitura complexa prejudica a validade de conteúdo."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Fonte e Artigo */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Fonte / Bibliografia"
                  placeholder="Ex: Manual de Psicometria"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                />
                <Input
                  label="Página / Artigo de Lei"
                  placeholder="Ex: Cap. 4 ou Art. 5º, II"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* 7. Tags do Cartão */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tags de Estudo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
              + Tag
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" isLoading={isLoading} className="font-semibold">
            {initialCard ? 'Atualizar Cartão' : 'Salvar e Adicionar Outro'}
          </Button>
        </div>
      </form>

      {/* Coluna da Pré-visualização em Tempo Real */}
      <div className="sticky top-20 space-y-4">
        <CardPreview
          cardType={cardType}
          content={previewContent}
          metadata={deckMetadata}
        />
      </div>
    </div>
  );
}
