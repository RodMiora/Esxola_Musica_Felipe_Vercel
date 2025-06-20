// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'; // Importe User do firebase/auth
import { auth } from '@/firebase/config'; // <--- Ajuste o caminho para o seu arquivo de configuração do Firebase

// Defina uma interface para o usuário, se precisar adicionar mais campos no futuro
// Por enquanto, usamos o tipo User do Firebase
type AuthUser = FirebaseUser | null;

interface AuthState {
  user: AuthUser;
  loading: boolean;
  error: Error | null; // Opcional: para lidar com erros de autenticação
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Opcional

  useEffect(() => {
    // onAuthStateChanged é a função do Firebase que escuta mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Define o usuário (será null se não houver ninguém logado)
      setLoading(false); // Terminou de carregar o estado inicial
      setError(null); // Limpa qualquer erro anterior
    }, (authError) => {
      // Lida com erros durante a observação do estado
      console.error("Erro na observação de autenticação:", authError);
      setError(authError);
      setLoading(false); // Termina o carregamento mesmo com erro
    });

    // Cleanup function: para de escutar mudanças quando o componente que usa o hook for desmontado
    return () => unsubscribe();
  }, []); // O array de dependências vazio [] garante que este efeito rode apenas uma vez na montagem

  return { user, loading, error };
};
