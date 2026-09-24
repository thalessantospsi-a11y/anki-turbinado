'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Layers,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  GraduationCap,
  FileCheck2,
  CalendarCheck,
  Trophy,
  BarChart3,
  History,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/baralhos', label: 'Meus Baralhos', icon: Layers },
  { href: '/revisao', label: 'Revisão (FSRS)', icon: RotateCcw, highlight: true },
  { href: '/questoes', label: 'Questões', icon: HelpCircle },
  { href: '/caderno-erros', label: 'Caderno de Erros', icon: AlertTriangle },
  { href: '/modo-professor', label: 'Modo Professor (IA)', icon: GraduationCap },
  { href: '/simulados', label: 'Simulados & Prova', icon: FileCheck2 },
  { href: '/planejamento', label: 'Planejamento & Metas', icon: CalendarCheck },
  { href: '/conquistas', label: 'Conquistas & Nível', icon: Trophy },
  { href: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { href: '/historico', label: 'Histórico de Revisões', icon: History },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Container da Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header da Sidebar */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-blue-500/30">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                ANKI TURBINADO
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                FSRS + Questões + IA
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  item.highlight && !isActive && 'text-blue-500 font-semibold'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Ciclo Contínuo
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Revisões em dia mantêm a retenção FSRS acima de 90%.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
