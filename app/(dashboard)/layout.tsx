'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
        {/* Sidebar Principal (Desktop fixo e Mobile slide-over) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo Principal com compensação da Sidebar desktop (w-64) */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>

          {/* Navegação Inferior Mobile */}
          <BottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
