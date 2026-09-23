'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface DocumentUploaderProps {
  onDocumentExtracted: (docData: {
    fileName: string;
    totalPages: number;
    pages: { pageNumber: number; text: string }[];
    fullText: string;
  }) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export function DocumentUploader({
  onDocumentExtracted,
  isLoading,
  setIsLoading,
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    const validExtensions = ['.pdf', '.txt', '.md'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMsg('Envie apenas arquivos PDF, TXT ou Markdown (.md).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('O tamanho do arquivo não pode ultrapassar 15 MB.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parser/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao extrair texto do documento');
      }

      const data = await res.json();
      onDocumentExtracted(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao processar arquivo.');
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Arraste e solte sua apostila, PDF ou documento aqui
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Formatos suportados: <strong className="text-slate-700 dark:text-slate-300">PDF, TXT, Markdown</strong> (até 15MB).
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isLoading}
            className="text-xs font-semibold"
          >
            Selecionar Arquivo no Computador
          </Button>
        </div>
      </div>
    </div>
  );
}
