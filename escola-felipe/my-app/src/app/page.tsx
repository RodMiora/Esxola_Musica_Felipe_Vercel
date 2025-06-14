"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        // Se estiver logado, redirecionar para a página de vídeos
        router.replace('/videos');
      } else {
        // Se não estiver logado, redirecionar para a página de login
        router.replace('/login');
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      // Em caso de erro, redirecionar para login
      router.replace('/login');
    } finally {
      // Marca como carregado após verificação
      setIsLoading(false);
    }
  }, [router]);

  return (
    // Página de carregamento temporária enquanto o redirecionamento acontece
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center">
          <div className="text-white text-xl mb-4">Redirecionando...</div>
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
