"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Equalizer from '@/components/Equalizer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login bem-sucedido
    router.push('/videos');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Barra superior */}
      <div className="fixed top-0 left-0 w-full bg-gray-800 text-gray-100 p-2 text-right">
        Escola de Música
      </div>
      
      {/* Logotipo */}
      <div className="mb-8 flex flex-col items-center">
        <Equalizer />
        <h1 className="text-4xl text-center font-pacifico text-gray-100">
          Escola de música
        </h1>
      </div>

      {/* Formulário de Login */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md border border-gray-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Lembrar-me</span>
            </label>
            
            <a href="#" className="text-sm text-orange-400 hover:text-orange-300">
              Esqueceu sua senha?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors duration-200"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}