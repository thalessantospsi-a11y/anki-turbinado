'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Check, CheckSquare, Square } from 'lucide-react';

interface PdfTopicSelectorProps {
  documentData: {
    fileName: string;
    totalPages: number;
    pages: { pageNumber: number; text: string }[];
    fullText: string;
  };
  onGenerateCards: (params: {
    selectedText: string;
    quantity: number;
    sourceTitle: string;
    pageReference: string;
  }) => void;
  isGenerating: boolean;
}

export function PdfTopicSelector({
  documentData,
  onGenerateCards,
  isGenerating,
}: PdfTopicSelectorProps) {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(
    new Set(documentData.pages.map((p) => p.pageNumber))
  );
  const [quantity, setQuantity] = useState(10);

  const togglePage = (pageNumber: number) => {
    const next = new Set(selectedPages);
    if (next.has(pageNumber)) next.delete(pageNumber);
    else next.add(pageNumber);
    setSelectedPages(next);
  };

  const selectAll = () => {
    setSelectedPages(new Set(documentData.pages.map((p) => p.pageNumber)));
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleGenerate = () => {
    const pagesToInclude = documentData.pages.filter((p) =>
      selectedPages.has(p.pageNumber)
    );
    const combinedText = pagesToInclude
      .map((p) => `[Página ${p.pageNumber}]\n${p.text}`)
      .join('\n\n');

    const pageRef =
      pagesToInclude.length === 1
        ? `Página ${pagesToInclude[0].pageNumber}`
        : `Páginas ${Array.from(selectedPages).sort((a, b) => a - b).join(', ')}`;

    onGenerateCards({
      selectedText: combinedText,
      quantity,
      sourceTitle: documentData.fileName,
      pageReference: pageRef,
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold">{documentData.fileName}</CardTitle>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {documentData.totalPages} seção(ões)/página(s) extraídas com sucesso.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="text-xs"
            >
              Marcar Todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="text-xs"
            >
              Desmarcar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Lista de Páginas/Capítulos com Checkbox */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Selecione as páginas ou seções para conversão:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {documentData.pages.map((p) => {
              const isChecked = selectedPages.has(p.pageNumber);

              return (
                <div
                  key={p.pageNumber}
                  onClick={() => togglePage(p.pageNumber)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Página {p.pageNumber}
                    </span>
                    <p className="text-slate-500 text-[11px] line-clamp-2">
                      {p.text.slice(0, 140)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantidade de Flashcards a Gerar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Quantidade de Flashcards Atômicos:
            </span>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantity(qty)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    quantity === qty
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {qty} cards
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={selectedPages.size === 0 || isGenerating}
            isLoading={isGenerating}
            onClick={handleGenerate}
            className="font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 px-6 py-2.5"
          >
            <Sparkles className="w-4 h-4" />
            Gerar {quantity} Flashcards FSRS do PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
