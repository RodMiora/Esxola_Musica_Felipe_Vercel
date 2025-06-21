// src/hooks/useDataSync.ts
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
// Importa os tipos do seu arquivo central
// O caminho './types' está correto SE types.ts estiver na mesma pasta (src/hooks)
import {
  Aluno,
  Video,
  Turma, // Importado, mas não usado no código atual
  VideosLiberados,
  NotificationData, // Importado, mas não usado no código atual
  ConfirmacaoState, // Importado, mas não usado no código atual
  Notificacao, // Importado, mas não usado no código atual
  Module, // Importado, mas não usado no código atual
  AlunosDict // Importado, mas não usado no código atual
} from './types'; // <-- Mantenha './types' se types.ts estiver em src/hooks

// Importa o DataService para usar Vercel KV
import { DataService } from '../services/dataService';

// ============================================================================
// INTERFACE DO RETORNO DO HOOK useDataSync
// Define o que o hook retorna, incluindo loading e error
// ============================================================================
interface DataSyncState {
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  adicionarAluno: (novoAluno: Omit<Aluno, 'id'>) => Promise<void>; // Agora é async para Vercel KV
  atualizarAluno: (alunoId: string, novosDados: Partial<Aluno>) => Promise<void>; // Agora é async
  removerAluno: (alunoId: string) => Promise<void>; // Agora é async

  videos: Video[];
  setVideos: Dispatch<SetStateAction<Video[]>>;
  adicionarVideo: (novoVideo: Video) => Promise<void>; // Agora é async
  atualizarVideo: (videoAtualizado: Video) => Promise<void>; // Agora é async
  removerVideo: (videoId: number) => Promise<void>; // Agora é async

  videosLiberados: VideosLiberados;
  setPermissoesVideosAluno: (alunoId: string, videoIds: number[]) => Promise<void>; // Agora é async
  liberarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>; // Agora é async
  revogarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>; // Agora é async
  getVideosLiberadosDoAluno: (alunoId: string) => number[];

  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>; // Nova função para forçar atualização
}

// ============================================================================
// HOOK useDataSync
// ============================================================================
export function useDataSync(): DataSyncState {
  // Estados para armazenar os dados
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLiberados, setVideosLiberados] = useState<VideosLiberados>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar todos os dados do Vercel KV
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [alunosData, videosData, videosLiberadosData] = await Promise.all([
        DataService.getAlunos(),
        DataService.getVideos(),
        DataService.getVideosLiberados()
      ]);
      
      setAlunos(alunosData);
      setVideos(videosData);
      setVideosLiberados(videosLiberadosData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para forçar atualização dos dados
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Carrega dados iniciais quando o componente monta
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Migração automática do localStorage para Vercel KV (executar uma vez)
  useEffect(() => {
    const migrateData = async () => {
      try {
        await DataService.migrateFromLocalStorage();
      } catch (error) {
        console.error('Erro na migração:', error);
      }
    };
    
    migrateData();
  }, []);

  // === FUNÇÕES CRUD E PERMISSÕES ===
  // Agora todas as funções são async e usam o DataService do Vercel KV

  // ========== ALUNOS ==========
  const adicionarAluno = useCallback(async (novoAluno: Omit<Aluno, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.adicionarAluno(novoAluno);
      await refreshData(); // Recarrega os dados após adicionar
    } catch (err: any) {
      console.error('Erro ao adicionar aluno:', err);
      setError(err.message || 'Erro ao adicionar aluno');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const atualizarAluno = useCallback(async (alunoId: string, novosDados: Partial<Aluno>) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.atualizarAluno(alunoId, novosDados);
      await refreshData(); // Recarrega os dados após atualizar
    } catch (err: any) {
      console.error('Erro ao atualizar aluno:', err);
      setError(err.message || 'Erro ao atualizar aluno');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const removerAluno = useCallback(async (alunoId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.removerAluno(alunoId);
      await refreshData(); // Recarrega os dados após remover
    } catch (err: any) {
      console.error('Erro ao remover aluno:', err);
      setError(err.message || 'Erro ao remover aluno');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);
  // ========== VÍDEOS ==========
  const adicionarVideo = useCallback(async (novoVideo: Video) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.adicionarVideo(novoVideo);
      await refreshData(); // Recarrega os dados após adicionar
    } catch (err: any) {
      console.error('Erro ao adicionar vídeo:', err);
      setError(err.message || 'Erro ao adicionar vídeo');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const atualizarVideo = useCallback(async (videoAtualizado: Video) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.atualizarVideo(videoAtualizado.id, videoAtualizado);
      await refreshData(); // Recarrega os dados após atualizar
    } catch (err: any) {
      console.error('Erro ao atualizar vídeo:', err);
      setError(err.message || 'Erro ao atualizar vídeo');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const removerVideo = useCallback(async (videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.removerVideo(videoId);
      await refreshData(); // Recarrega os dados após remover
    } catch (err: any) {
      console.error('Erro ao remover vídeo:', err);
      setError(err.message || 'Erro ao remover vídeo');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);
  // ========== PERMISSÕES (LIBERAÇÃO DE VÍDEOS POR ALUNO) ==========
  // Retorna array de videoIds liberados para o aluno
  const getVideosLiberadosDoAluno = useCallback((alunoId: string): number[] => {
    return videosLiberados[alunoId] || [];
  }, [videosLiberados]);

  // Marca array de vídeos liberados para esse aluno (overwrite)
  const setPermissoesVideosAluno = useCallback(async (alunoId: string, videoIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.setPermissoesVideosAluno(alunoId, videoIds);
      await refreshData(); // Recarrega os dados após atualizar
    } catch (err: any) {
      console.error('Erro ao definir permissões:', err);
      setError(err.message || 'Erro ao definir permissões');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Libera UM vídeo para UM aluno
  const liberarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.liberarVideoParaAluno(alunoId, videoId);
      await refreshData(); // Recarrega os dados após atualizar
    } catch (err: any) {
      console.error('Erro ao liberar vídeo:', err);
      setError(err.message || 'Erro ao liberar vídeo');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Revoga UM vídeo de UM aluno
  const revogarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await DataService.revogarVideoParaAluno(alunoId, videoId);
      await refreshData(); // Recarrega os dados após atualizar
    } catch (err: any) {
      console.error('Erro ao revogar vídeo:', err);
      setError(err.message || 'Erro ao revogar vídeo');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);
  // =========================
  // === RETORNOS DO HOOK ====
  // =========================
  return {
    alunos,
    setAlunos,
    adicionarAluno,
    atualizarAluno,
    removerAluno,
    videos,
    setVideos,
    adicionarVideo,
    atualizarVideo,
    removerVideo,
    videosLiberados,
    setPermissoesVideosAluno,
    liberarVideoParaAluno,
    revogarVideoParaAluno,
    getVideosLiberadosDoAluno,
    loading,
    error,
    refreshData, // <-- ADICIONAR esta linha
  };
}
