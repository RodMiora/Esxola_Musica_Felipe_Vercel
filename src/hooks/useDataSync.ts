import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { DataService } from '../services/dataService';
import {
  Aluno,
  Video,
  VideosLiberados,
} from './types';

interface DataSyncState {
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  adicionarAluno: (novoAluno: Omit<Aluno, 'id'>) => Promise<void>;
  atualizarAluno: (alunoId: string, novosDados: Partial<Aluno>) => Promise<void>;
  removerAluno: (alunoId: string) => Promise<void>;

  videos: Video[];
  setVideos: Dispatch<SetStateAction<Video[]>>;
  adicionarVideo: (novoVideo: Video) => Promise<void>;
  atualizarVideo: (videoAtualizado: Video) => Promise<void>;
  removerVideo: (videoId: number) => Promise<void>;

  videosLiberados: VideosLiberados;
  setPermissoesVideosAluno: (alunoId: string, videoIds: number[]) => Promise<void>;
  liberarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>;
  revogarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>;
  getVideosLiberadosDoAluno: (alunoId: string) => number[];

  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useDataSync(): DataSyncState {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLiberados, setVideosLiberados] = useState<VideosLiberados>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar todos os dados
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

  // Carrega dados na inicialização
  useEffect(() => {
    loadData();
    
    // Executa migração se necessário (apenas uma vez)
    DataService.migrateFromLocalStorage();
  }, [loadData]);

  // Função para atualizar dados manualmente
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // ========== ALUNOS ==========
  const adicionarAluno = useCallback(async (novoAluno: Omit<Aluno, 'id'>) => {
    try {
      setError(null);
      const alunoAdicionado = await DataService.adicionarAluno(novoAluno);
      setAlunos(prev => [...prev, alunoAdicionado]);
    } catch (err: any) {
      console.error('Erro ao adicionar aluno:', err);
      setError(err.message || 'Erro ao adicionar aluno');
    }
  }, []);

  const atualizarAluno = useCallback(async (alunoId: string, novosDados: Partial<Aluno>) => {
    try {
      setError(null);
      const alunoAtualizado = await DataService.atualizarAluno(alunoId, novosDados);
      setAlunos(prev => prev.map(aluno => 
        aluno.id === alunoId ? alunoAtualizado : aluno
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar aluno:', err);
      setError(err.message || 'Erro ao atualizar aluno');
    }
  }, []);

  const removerAluno = useCallback(async (alunoId: string) => {
    try {
      setError(null);
      await DataService.removerAluno(alunoId);
      setAlunos(prev => prev.filter(aluno => aluno.id !== alunoId));
      // Remove também as permissões de vídeo do aluno
      setVideosLiberados(prev => {
        const updated = { ...prev };
        delete updated[alunoId];
        return updated;
      });
    } catch (err: any) {
      console.error('Erro ao remover aluno:', err);
      setError(err.message || 'Erro ao remover aluno');
    }
  }, []);

  // ========== VÍDEOS ==========
  const adicionarVideo = useCallback(async (novoVideo: Video) => {
    try {
      setError(null);
      await DataService.adicionarVideo(novoVideo);
      setVideos(prev => [...prev, novoVideo]);
    } catch (err: any) {
      console.error('Erro ao adicionar vídeo:', err);
      setError(err.message || 'Erro ao adicionar vídeo');
    }
  }, []);

  const atualizarVideo = useCallback(async (videoAtualizado: Video) => {
    try {
      setError(null);
      await DataService.atualizarVideo(videoAtualizado);
      setVideos(prev => prev.map(video => 
        video.id === videoAtualizado.id ? videoAtualizado : video
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar vídeo:', err);
      setError(err.message || 'Erro ao atualizar vídeo');
    }
  }, []);

  const removerVideo = useCallback(async (videoId: number) => {
    try {
      setError(null);
      await DataService.removerVideo(videoId);
      setVideos(prev => prev.filter(video => video.id !== videoId));
      // Remove o vídeo das permissões de todos os alunos
      setVideosLiberados(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(alunoId => {
          updated[alunoId] = updated[alunoId].filter(id => id !== videoId);
        });
        return updated;
      });
    } catch (err: any) {
      console.error('Erro ao remover vídeo:', err);
      setError(err.message || 'Erro ao remover vídeo');
    }
  }, []);

  // ========== VÍDEOS LIBERADOS ==========
  const setPermissoesVideosAluno = useCallback(async (alunoId: string, videoIds: number[]) => {
    try {
      setError(null);
      await DataService.setPermissoesVideosAluno(alunoId, videoIds);
      setVideosLiberados(prev => ({
        ...prev,
        [alunoId]: videoIds
      }));
    } catch (err: any) {
      console.error('Erro ao definir permissões de vídeos:', err);
      setError(err.message || 'Erro ao definir permissões de vídeos');
    }
  }, []);

  const liberarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setError(null);
      await DataService.liberarVideoParaAluno(alunoId, videoId);
      setVideosLiberados(prev => {
        const videosAtuais = prev[alunoId] || [];
        if (!videosAtuais.includes(videoId)) {
          return {
            ...prev,
            [alunoId]: [...videosAtuais, videoId]
          };
        }
        return prev;
      });
    } catch (err: any) {
      console.error('Erro ao liberar vídeo:', err);
      setError(err.message || 'Erro ao liberar vídeo');
    }
  }, []);

  const revogarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setError(null);
      await DataService.revogarVideoParaAluno(alunoId, videoId);
      setVideosLiberados(prev => ({
        ...prev,
        [alunoId]: (prev[alunoId] || []).filter(id => id !== videoId)
      }));
    } catch (err: any) {
      console.error('Erro ao revogar vídeo:', err);
      setError(err.message || 'Erro ao revogar vídeo');
    }
  }, []);

  const getVideosLiberadosDoAluno = useCallback((alunoId: string): number[] => {
    return videosLiberados[alunoId] || [];
  }, [videosLiberados]);

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
    refreshData
  };
}