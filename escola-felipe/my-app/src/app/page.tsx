"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar para a página de login quando a página raiz for carregada
    router.replace('/login');
  }, [router]);
  
  return (
    // Página de carregamento temporária enquanto o redirecionamento acontece
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecionando...</div>
    </div>
  );
}