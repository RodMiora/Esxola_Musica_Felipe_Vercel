// @ts-ignore
import { createClient } from 'redis';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Cliente Redis
let redisClient: any = null;

// Inicializa o cliente Redis
const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });
    
    await redisClient.connect();
  }
  return redisClient;
};

// Chaves para o Redis store
const KEYS = {
  ALUNOS: 'escola:alunos',
  VIDEOS: 'escola:videos',
  VIDEOS_LIBERADOS: 'escola:videos_liberados',
  LAST_UPDATED: 'escola:last_updated'
} as const;

export class DataService {
  // ========== ALUNOS ==========
  static async getAlunos(): Promise<Aluno[]> {
    try {
      const client = await getRedisClient();
      const alunos = await client.get(KEYS.ALUNOS);
      return alunos ? JSON.parse(alunos) : [];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.set(KEYS.ALUNOS, JSON.stringify(alunos));
      await client.set(KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
      console.error('Erro ao salvar alunos:', error);
      throw error;
    }
  }

  static async adicionarAluno(novoAluno: Omit<Aluno, 'id'>): Promise<Aluno> {
    try {
      const alunos = await this.getAlunos();
      
      // Gera o próximo ID sequencial
      const proximoId = alunos.length > 0 ? 
        (Math.max(...alunos.map(a => parseInt(a.id) || 0)) + 1) : 1;
      const novoId = proximoId.toString().padStart(2, '0');
      
      const alunoCompleto: Aluno = {
        ...novoAluno,
        id: novoId,
        name: novoAluno.nome || novoAluno.name || '',
        password: novoAluno.password || '',
        role: 'student',
        videosLiberados: []
      };
      
      const novosAlunos = [...alunos, alunoCompleto];
      await this.saveAlunos(novosAlunos);
      
      return alunoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }
  }

  static async atualizarAluno(alunoId: string, novosDados: Partial<Aluno>): Promise<Aluno> {
    try {
      const alunos = await this.getAlunos();
      let alunoAtualizado: Aluno | null = null;
      const alunosAtualizados = alunos.map(a => {
        if (a.id === alunoId) {
          alunoAtualizado = { ...a, ...novosDados };
          return alunoAtualizado;
        }
        return a;
      });
      
      if (!alunoAtualizado) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      await this.saveAlunos(alunosAtualizados);
      return alunoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  }

  static async removerAluno(alunoId: string): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunosFiltrados = alunos.filter(a => a.id !== alunoId);
      
      // Reorganiza os IDs sequencialmente
      const alunosReorganizados = alunosFiltrados.map((aluno, index) => ({
        ...aluno,
        id: (index + 1).toString().padStart(2, '0')
      }));
      
      await this.saveAlunos(alunosReorganizados);
      
      // Remove permissões do aluno removido
      const videosLiberados = await this.getVideosLiberados();
      delete videosLiberados[alunoId];
      await this.saveVideosLiberados(videosLiberados);
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      throw error;
    }
  }

  // ========== VIDEOS ==========
  static async getVideos(): Promise<Video[]> {
    try {
      const client = await getRedisClient();
      const videos = await client.get(KEYS.VIDEOS);
      return videos ? JSON.parse(videos) : [];
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.set(KEYS.VIDEOS, JSON.stringify(videos));
      await client.set(KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
      console.error('Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(novoVideo: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      const novosVideos = [...videos, novoVideo];
      await this.saveVideos(novosVideos);
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      throw error;
    }
  }

  static async atualizarVideo(videoAtualizado: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      const videosAtualizados = videos.map(v => 
        v.id === videoAtualizado.id ? videoAtualizado : v
      );
      await this.saveVideos(videosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  static async removerVideo(videoId: number): Promise<void> {
    try {
      const videos = await this.getVideos();
      const videosAtualizados = videos.filter(v => v.id !== videoId);
      await this.saveVideos(videosAtualizados);
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      throw error;
    }
  }

  // ========== VIDEOS LIBERADOS ==========
  static async getVideosLiberados(): Promise<VideosLiberados> {
    try {
      const client = await getRedisClient();
      const videosLiberados = await client.get(KEYS.VIDEOS_LIBERADOS);
      return videosLiberados ? JSON.parse(videosLiberados) : {};
    } catch (error) {
      console.error('Erro ao buscar vídeos liberados:', error);
      return {};
    }
  }

  static async saveVideosLiberados(videosLiberados: VideosLiberados): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.set(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videosLiberados));
      await client.set(KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
      console.error('Erro ao salvar vídeos liberados:', error);
      throw error;
    }
  }

  static async liberarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      if (!videosLiberados[alunoId]) {
        videosLiberados[alunoId] = [];
      }
      if (!videosLiberados[alunoId].includes(videoId)) {
        videosLiberados[alunoId].push(videoId);
        await this.saveVideosLiberados(videosLiberados);
      }
    } catch (error) {
      console.error('Erro ao liberar vídeo:', error);
      throw error;
    }
  }

  static async revogarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      if (videosLiberados[alunoId]) {
        videosLiberados[alunoId] = videosLiberados[alunoId].filter(id => id !== videoId);
        await this.saveVideosLiberados(videosLiberados);
      }
    } catch (error) {
      console.error('Erro ao revogar vídeo:', error);
      throw error;
    }
  }

  static async setPermissoesVideosAluno(alunoId: string, videoIds: number[]): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      videosLiberados[alunoId] = videoIds;
      await this.saveVideosLiberados(videosLiberados);
    } catch (error) {
      console.error('Erro ao definir permissões:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<number> {
    try {
      const client = await getRedisClient();
      const timestamp = await client.get(KEYS.LAST_UPDATED);
      return timestamp ? parseInt(timestamp) : 0;
    } catch (error) {
      console.error('Erro ao buscar última atualização:', error);
      return 0;
    }
  }

  // Migração de dados do localStorage para KV (executar uma vez)
  static async migrateFromLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Verifica se já existe dados no KV
      const existingAlunos = await this.getAlunos();
      if (existingAlunos.length > 0) {
        console.log('Dados já existem no KV, pulando migração');
        return;
      }

      // Migra alunos
      const localAlunos = localStorage.getItem('alunos');
      if (localAlunos) {
        const alunos = JSON.parse(localAlunos);
        await this.saveAlunos(alunos);
        console.log('Alunos migrados para KV');
      }

      // Migra vídeos
      const localVideos = localStorage.getItem('videos');
      if (localVideos) {
        const videos = JSON.parse(localVideos);
        await this.saveVideos(videos);
        console.log('Vídeos migrados para KV');
      }

      // Migra vídeos liberados
      const localVideosLiberados = localStorage.getItem('videosLiberados');
      if (localVideosLiberados) {
        const videosLiberados = JSON.parse(localVideosLiberados);
        await this.saveVideosLiberados(videosLiberados);
        console.log('Vídeos liberados migrados para KV');
      }

      console.log('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração:', error);
    }
  }
}