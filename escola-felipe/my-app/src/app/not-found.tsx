"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar para a página principal após um breve atraso
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl mb-4">Página não encontrada</h1>
        <p className="mb-4">Redirecionando para a página inicial...</p>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className="bg-orange-500 h-full w-1/2 animate-pulse"></div>
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="mt-6 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white transition-colors"
        >
          Ir para página inicial
        </button>
      </div>
    </div>
  );
}
