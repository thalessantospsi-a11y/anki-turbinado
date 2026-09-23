'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      await registerWithEmail(email, password, name);
      router.push('/onboarding');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Senha considerada fraca pelo Firebase.');
      } else {
        setErrorMsg('Falha ao criar conta. Verifique os dados informados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push('/onboarding');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível cadastrar com o Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Crie sua conta
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Dê o primeiro passo para turbinar sua retenção de conteúdo.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full py-2.5 font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        onClick={handleGoogleSignup}
        isLoading={isGoogleLoading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Cadastrar com o Google
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-wider">
          ou preencha com e-mail
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Nome Completo"
          type="text"
          placeholder="Ex: Maria Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirmar Senha"
          type="password"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 mt-2"
          isLoading={isLoading}
        >
          Criar minha conta
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Já possui conta?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
