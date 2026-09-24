'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Flame, LogOut, User, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Lado Esquerdo: Botão mobile e objetivo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {profile?.targetExam && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Foco:</span>
            <Badge variant="default" className="text-xs">
              {profile.targetExam}
              {profile.targetRole ? ` — ${profile.targetRole}` : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Lado Direito: Streak, XP e Usuário */}
      <div className="flex items-center gap-3">
        {/* Streak Pill clicável */}
        <Link
          href="/conquistas"
          title="Ver histórico de ofensiva e conquistas"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold hover:scale-105 transition-transform"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{profile?.streak?.current || 0} dias</span>
        </Link>

        {/* Nível / XP clicável */}
        <Link
          href="/conquistas"
          title="Ver nível e insígnias"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:scale-105 transition-transform"
        >
          <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Nível {profile?.level || 1}</span>
          <span className="text-[10px] text-blue-400">({profile?.xp || 0} XP)</span>
        </Link>

        {/* Perfil & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold overflow-hidden">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
            {profile?.displayName || user?.email?.split('@')[0] || 'Estudante'}
          </span>
          <button
            type="button"
            onClick={logout}
            title="Sair da conta"
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
