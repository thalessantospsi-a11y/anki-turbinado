'use client';

import React from 'react';
import Link from 'next/link';
import { Deck } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Plus,
  MoreVertical,
  Layers,
  Archive,
  Trash2,
  Copy,
  Edit,
  FolderTree,
} from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onEdit: (deck: Deck) => void;
  onDuplicate: (deck: Deck) => void;
  onArchive: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

function DeckCardComponent({
  deck,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: DeckCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const dueCount = deck.cardCounts.review;
  const newCount = deck.cardCounts.new;
  const learningCount = deck.cardCounts.learning + deck.cardCounts.relearning;
  const totalCount = deck.cardCounts.total;

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-900/60 relative group">
      <CardContent className="p-5 space-y-4">
        {/* Cabeçalho do Card: Hierarquia e Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {deck.hierarchy.concurso && (
              <Badge variant="purple" className="text-[10px]">
                {deck.hierarchy.concurso}
              </Badge>
            )}
            {deck.hierarchy.banca && (
              <Badge variant="secondary" className="text-[10px]">
                {deck.hierarchy.banca}
              </Badge>
            )}
            <Badge variant="default" className="text-[10px]">
              {deck.hierarchy.disciplina}
            </Badge>
          </div>

          {/* Menu Dropdown de Opções */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(deck);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    Editar Baralho
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(deck);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive(deck);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                    {deck.isArchived ? 'Desarquivar' : 'Arquivar'}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(deck.id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Título e Detalhes */}
        <div className="space-y-1">
          <Link href={`/baralhos/${deck.id}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
              {deck.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <FolderTree className="w-3.5 h-3.5 text-slate-400" />
            <span>{deck.hierarchy.assunto}</span>
            {deck.hierarchy.subassunto && (
              <>
                <span>›</span>
                <span className="truncate">{deck.hierarchy.subassunto}</span>
              </>
            )}
          </div>
          {deck.description && (
            <p className="text-xs text-slate-500 line-clamp-2 pt-1">
              {deck.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {deck.tags && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deck.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Contadores FSRS em Grade */}
        <div className="grid grid-cols-4 gap-1 text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px]">
          <div>
            <span className="block font-bold text-blue-600 dark:text-blue-400">{newCount}</span>
            <span className="text-[10px] text-slate-400">Novos</span>
          </div>
          <div>
            <span className="block font-bold text-amber-600 dark:text-amber-400">{learningCount}</span>
            <span className="text-[10px] text-slate-400">Aprendendo</span>
          </div>
          <div>
            <span className="block font-bold text-emerald-600 dark:text-emerald-400">{dueCount}</span>
            <span className="text-[10px] text-slate-400">A Revisar</span>
          </div>
          <div>
            <span className="block font-bold text-slate-700 dark:text-slate-300">{totalCount}</span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 pt-1">
          <Link href={`/revisao?deckId=${deck.id}`} className="flex-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-semibold gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Estudar ({dueCount + newCount})
            </Button>
          </Link>
          <Link href={`/baralhos/${deck.id}?novo=true`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2.5"
              title="Adicionar Flashcard"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const DeckCard = React.memo(DeckCardComponent);
