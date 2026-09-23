'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, BookOpen, Clock } from 'lucide-react';

interface MaterialInputAreaProps {
  content: string;
  onChangeContent: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const SAMPLE_TEXT = `
A validade de um teste psicológico refere-se ao grau em que as evidências e a teoria sustentam as interpretações dos escores dos testes para os usos propostos. Não se trata de uma propriedade intrínseca do teste em si, mas sim das inferências feitas a partir de seus resultados.
A validade de conteúdo avalia se os itens do teste representam adequadamente o domínio do construto a ser medido. É comumente aferida por juízes especialistas na área.
Já a validade de critério investiga a relação entre os escores do teste e um critério externo relevante, podendo ser concorrente (medida simultânea) ou preditiva (desempenho futuro).
Bancas examinadoras como FCC e Cebraspe frequentemente tentam induzir o candidato ao erro trocando os conceitos de validade de conteúdo e validade de critério, ou afirmando equivocadamente que a validade é um índice fixo e imutável do instrumento.
`;

export function MaterialInputArea({
  content,
  onChangeContent,
  onAnalyze,
  isLoading,
}: MaterialInputAreaProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const estimatedReadTime = Math.max(1, Math.round(wordCount / 180));
  const estimatedTokens = Math.round(charCount / 4);

  const handleLoadSample = () => {
    onChangeContent(SAMPLE_TEXT.trim());
  };

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Material de Estudo</CardTitle>
              <CardDescription>
                Cole capítulos de apostilas, artigos de lei, resumos ou anotações para análise.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
          >
            Carregar Texto Exemplo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <textarea
          rows={7}
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="Cole aqui o texto ou conteúdo que você deseja que o Professor IA analise..."
          className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{wordCount} palavras</span>
            <span>•</span>
            <span>~{estimatedReadTime} min de leitura</span>
            <span>•</span>
            <span className="text-slate-500">~{estimatedTokens} tokens</span>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={charCount < 20 || isLoading}
            isLoading={isLoading}
            onClick={onAnalyze}
            className="font-bold text-xs gap-1.5 shadow-md shadow-blue-500/10"
          >
            <Sparkles className="w-4 h-4" />
            Analisar com Professor IA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
