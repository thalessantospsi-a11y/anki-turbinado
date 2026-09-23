'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';

const BOTTOM_NAV_ITEMS = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/revisao', label: 'Revisar', icon: RotateCcw, highlight: true },
  { href: '/baralhos', label: 'Baralhos', icon: Layers },
  { href: '/questoes', label: 'Questões', icon: HelpCircle },
  { href: '/caderno-erros', label: 'Erros', icon: AlertTriangle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2 safe-area-pb">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all',
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <div
              className={clsx(
                'p-1 rounded-lg transition-transform',
                item.highlight && isActive && 'bg-blue-50 dark:bg-blue-950/60'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
