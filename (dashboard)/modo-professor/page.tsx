'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/services/gemini/aiService';
import { deckRepository } from '@/services/firestore/deckRepository';
import { questionRepository } from '@/services/firestore/questionRepository';
import { Deck, AIGeneratedCardItem } from '@/types';
import { MaterialInputArea } from '@/components/teacher/MaterialInputArea';
import { TeacherOptionsGrid } from '@/components/teacher/TeacherOptionsGrid';
import { MaterialStudyViewer } from '@/components/teacher/MaterialStudyViewer';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { PdfTopicSelector } from '@/components/documents/PdfTopicSelector';
import { AIGeneratedReviewModal } from '@/components/ai/AIGeneratedReviewModal';
import { LoadingState } from '@/components/ui/loading-state';
import { Tabs } from '@/components/ui/tabs';
import { GraduationCap, Sparkles, CheckCircle2, FileUp, FileText } from 'lucide-react';

export default function TeacherModePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');

  // Modo Texto
  const [content, setContent] = useState('');
  const [topics, setTopics] = useState<{ title: string; summary: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modo PDF
  const [documentData, setDocumentData] = useState<{
    fileName: string;
    totalPages: number;
    pages: { pageNumber: number; text: string }[];
    fullText: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPdfCards, setIsGeneratingPdfCards] = useState(false);

  // Trilha de Estudo Selecionada
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<any>(null);
  const [isGeneratingTrack, setIsGeneratingTrack] = useState(false);

  // Integração com Flashcards e Baralhos
  const [decks, setDecks] = useState<Deck[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<AIGeneratedCardItem[]>([]);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      deckRepository.listByOwner(user.uid).then(setDecks);
    }
  }, [user]);

  // Passo 1: Analisar Conteúdo e Extrair Tópicos
  const handleAnalyzeContent = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setActiveTrack(null);
    setTrackData(null);
    try {
      const res = await aiService.executeTeacherAction(content, 'analyze_topics');
      setTopics(res.topics || []);
    } catch (err) {
      console.error('Erro na análise de tópicos pelo Professor IA:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Passo 2: Executar Trilha de Estudo Selecionada
  const handleSelectTrack = async (trackId: string) => {
    setActiveTrack(trackId);
    setIsGeneratingTrack(true);
    setTrackData(null);

    try {
      if (trackId === 'flashcards') {
        const res = await aiService.generateFlashcards({
          content,
          quantity: 8,
          cardTypes: ['basic', 'cloze'],
        });
        setGeneratedFlashcards(res.cards || []);
        setIsCardsModalOpen(true);
        setIsGeneratingTrack(false);
        return;
      }

      const res = await aiService.executeTeacherAction(content, trackId as any);
      setTrackData(res);
    } catch (err) {
      console.error('Erro ao gerar trilha de estudo:', err);
    } finally {
      setIsGeneratingTrack(false);
    }
  };

  // Geração de Flashcards a partir de Páginas Selecionadas do PDF (Seção 20 e 54)
  const handleGenerateCardsFromPdf = async (params: {
    selectedText: string;
    quantity: number;
    sourceTitle: string;
    pageReference: string;
  }) => {
    setIsGeneratingPdfCards(true);
    try {
      const res = await aiService.generateFlashcards({
        content: params.selectedText,
        sourceTitle: `${params.sourceTitle} (${params.pageReference})`,
        quantity: params.quantity,
        cardTypes: ['basic', 'cloze'],
      });

      setGeneratedFlashcards(res.cards || []);
      setIsCardsModalOpen(true);
    } catch (err) {
      console.error('Erro ao gerar cards do PDF:', err);
    } finally {
      setIsGeneratingPdfCards(false);
    }
  };

  // Salvar Questões no Banco
  const handleSaveQuestionsToBank = async (questions: any[]) => {
    if (!user || questions.length === 0) return;
    try {
      await questionRepository.batchCreate(
        questions.map((q) => ({
          ownerId: user.uid,
          statement: q.statement,
          options: q.options,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          metadata: {
            disciplina: 'Geral',
            assunto: topics[0]?.title || 'Modo Professor',
            difficulty: q.difficulty || 'medium',
            tags: ['modo-professor', 'ia-gerado'],
          },
          isFavorite: false,
        }))
      );
      setSavedNotification(`${questions.length} questões salvas no seu Banco de Questões!`);
      setTimeout(() => setSavedNotification(null), 4000);
    } catch (err) {
      console.error('Erro ao salvar questões no banco:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          Modo Professor & Extração de PDFs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Insira textos ou envie apostilas em PDF para extrair tópicos e gerar flashcards FSRS com citação de fonte.
        </p>
      </div>

      {savedNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedNotification}
        </div>
      )}

      {/* Abas: Colar Conteúdo vs Upload de PDF/Apostila */}
      <Tabs
        tabs={[
          { id: 'text', label: 'Colar Conteúdo / Resumo', icon: <FileText className="w-4 h-4" /> },
          { id: 'pdf', label: 'Upload de PDF ou Apostila', icon: <FileUp className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* ABA 1: CONTEÚDO COLADO */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <MaterialInputArea
            content={content}
            onChangeContent={setContent}
            onAnalyze={handleAnalyzeContent}
            isLoading={isAnalyzing}
          />

          {content.length >= 20 && (
            <TeacherOptionsGrid
              topics={topics}
              activeTrack={activeTrack}
              onSelectTrack={handleSelectTrack}
              isLoading={isGeneratingTrack}
            />
          )}

          {isGeneratingTrack && (
            <LoadingState message="O Professor IA está gerando sua trilha de estudo personalizada..." />
          )}

          {!isGeneratingTrack && trackData && activeTrack && (
            <MaterialStudyViewer
              track={activeTrack}
              data={trackData}
              onSaveQuestions={handleSaveQuestionsToBank}
            />
          )}
        </div>
      )}

      {/* ABA 2: UPLOAD DE PDF OU APOSTILA */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          <DocumentUploader
            onDocumentExtracted={(data) => setDocumentData(data)}
            isLoading={isUploading}
            setIsLoading={setIsUploading}
          />

          {documentData && (
            <PdfTopicSelector
              documentData={documentData}
              onGenerateCards={handleGenerateCardsFromPdf}
              isGenerating={isGeneratingPdfCards}
            />
          )}
        </div>
      )}

      {/* Modal de Curadoria Obrigatória para Flashcards (Seção 55) */}
      <AIGeneratedReviewModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        cards={generatedFlashcards}
        decks={decks}
        onSavedSuccess={(count) => {
          setSavedNotification(`${count} flashcards adicionados ao seu ciclo FSRS com sucesso!`);
          setTimeout(() => setSavedNotification(null), 4000);
        }}
      />
    </div>
  );
}
