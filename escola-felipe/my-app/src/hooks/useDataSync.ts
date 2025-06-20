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

// ============================================================================
// INTERFACE DO RETORNO DO HOOK useDataSync
// Define o que o hook retorna, incluindo loading e error
// ============================================================================
interface DataSyncState {
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  adicionarAluno: (novoAluno: Aluno) => void; // Assumindo que é síncrono para localStorage
  atualizarAluno: (alunoId: string, novosDados: Partial<Aluno>) => void; // Assumindo síncrono
  removerAluno: (alunoId: string) => void; // Assumindo síncrono

  videos: Video[];
  setVideos: Dispatch<SetStateAction<Video[]>>;
  adicionarVideo: (novoVideo: Video) => void; // Assumindo síncrono
  atualizarVideo: (videoAtualizado: Video) => void; // Assumindo síncrono
  removerVideo: (videoId: number) => void; // Assumindo síncrono

  videosLiberados: VideosLiberados;
  setPermissoesVideosAluno: (alunoId: string, videoIds: number[]) => void; // Assumindo síncrono
  liberarVideoParaAluno: (alunoId: string, videoId: number) => void; // Assumindo síncrono
  revogarVideoParaAluno: (alunoId: string, videoId: number) => void; // Assumindo síncrono
  getVideosLiberadosDoAluno: (alunoId: string) => number[];

  loading: boolean; // <-- ADICIONADO
  error: string | null; // <-- ADICIONADO
}

// ============================================================================
// HOOK useDataSync
// ============================================================================
export function useDataSync(): DataSyncState { // <-- Adicionado tipo de retorno
  // Função auxiliar para carregar e converter dados do localStorage
  // Ajustada para lidar com Aluno.id como string e videosLiberados com chaves string
  const loadAndConvertData = useCallback(<T>(key: string, defaultValue: T): T => {
    // Verifica se está no ambiente do navegador
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    try {
      const parsedData = JSON.parse(data);
      if (key === 'alunos' && Array.isArray(parsedData)) {
        // Não converte aluno.id para number, pois o type é string.
        // Apenas garante que a estrutura corresponde ao tipo Aluno[].
        // Pode adicionar validação básica aqui se necessário.
        return parsedData as T; // Assume que os IDs já são strings no storage
      }
      if (key === 'videos' && Array.isArray(parsedData)) {
          // Converte video.id para number conforme a interface Video
        return parsedData.map(item => ({
          ...item,
          id: Number(item.id) // Garante que o ID do vídeo é number
        })) as T;
      }
      if (key === 'videosLiberados' && typeof parsedData === 'object' && parsedData !== null) {
        // Converte *apenas* os valores (videoIds) para number.
        // As chaves (alunoId) permanecem strings conforme Record<string, number[]>.
        const converted: VideosLiberados = {};
        // Itera sobre as chaves (que são strings do localStorage)
        for (const alunoIdString in parsedData) {
          const videoIds = (parsedData as any)[alunoIdString]; // Cast temporário para acessar propriedade
          if (Array.isArray(videoIds)) {
              // Converte cada videoId dentro do array para number
            converted[alunoIdString] = videoIds
             .filter((id: any) => typeof id === 'number' || (typeof id === 'string' && !isNaN(Number(id)))) // Filtra valores não numéricos ou strings convertíveis
             .map((id: any) => Number(id)); // Converte para number
          } else {
              // Lida com caso inesperado onde o valor não é um array
              converted[alunoIdString] = [];
          }
        }
        return converted as T;
      }
      // Retorna dados parseados sem conversão específica se a chave não for reconhecida
      return parsedData as T;
    } catch (error) {
      console.error(`Erro ao carregar/parsear dados para a chave "${key}":`, error);
      // Em caso de erro ao carregar, retorna o valor padrão
      return defaultValue;
    }
  }, []);

  // ALUNOS STATE - Carrega (IDs são strings)
  const [alunos, setAlunos] = useState<Aluno[]>(() =>
    loadAndConvertData('alunos', [])
  );
  // VÍDEOS STATE - Carrega (IDs são numbers)
  const [videos, setVideos] = useState<Video[]>(() =>
    loadAndConvertData('videos', [])
  );
  // PERMISSÕES DE VÍDEOS LIBERADOS POR ALUNO - Carrega (Chaves são strings, valores são number[])
  const [videosLiberados, setVideosLiberados] = useState<VideosLiberados>(() =>
    loadAndConvertData('videosLiberados', {})
  );

  // === ESTADOS DE LOADING E ERROR ===
  // ADICIONADOS: Estado para indicar se os dados estão sendo carregados (inicialmente true)
  const [loading, setLoading] = useState<boolean>(true);
  // ADICIONADO: Estado para armazenar mensagens de erro
  const [error, setError] = useState<string | null>(null);

  // Dummy updater só para forçar re-render em storage externo
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // === SINCRONIZAÇÃO LOCALSTORAGE<->STATE ===
  // Efeito para salvar estados no localStorage sempre que mudam
  useEffect(() => {
    // Verifica se está no ambiente do navegador
    if (typeof window === 'undefined') {
      return;
    }
    
    // Salva alunos (IDs string)
    localStorage.setItem('alunos', JSON.stringify(alunos));
    // Salva videos (IDs number)
    localStorage.setItem('videos', JSON.stringify(videos));
    // Salva videosLiberados (Chaves string, valores number[])
    localStorage.setItem('videosLiberados', JSON.stringify(videosLiberados));
    // Como as operações são síncronas, podemos definir loading como false aqui
    // após a primeira carga ou após qualquer mudança síncrona refletida no storage.
    // No entanto, o loading principal deve ser controlado pelo useEffect de carga inicial.
  }, [alunos, videos, videosLiberados]); // Dependências para salvar no storage

  // Efeito para sincronizar com mudanças externas no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setLastSync(Date.now()); // Atualiza dummy state para forçar re-carga
    };
    window.addEventListener('storage', handleStorageChange);

    // === LÓGICA DE CARGA INICIAL ===
    // ADICIONADO: Define loading como true antes de carregar
    setLoading(true);
    // ADICIONADO: Limpa erros anteriores
    setError(null);
    try {
       // Recarrega dados na montagem inicial e em cada mudança de lastSync
       const alunosCarregados: Aluno[] = loadAndConvertData('alunos', []);
       
       // Migra IDs existentes para formato sequencial se necessário
       const alunosMigrados: Aluno[] = alunosCarregados.map((aluno: Aluno, index: number) => {
         const novoId = (index + 1).toString().padStart(2, '0');
         return { ...aluno, id: novoId };
       });
       
       setAlunos(alunosMigrados);
       setVideos(loadAndConvertData('videos', []));
       
       // Migra videosLiberados para usar os novos IDs
       const videosLiberadosCarregados: VideosLiberados = loadAndConvertData('videosLiberados', {});
       const videosLiberadosMigrados: VideosLiberados = {};
       
       alunosMigrados.forEach((aluno: Aluno, index: number) => {
         const novoId = (index + 1).toString().padStart(2, '0');
         const idAntigo: string | undefined = alunosCarregados[index]?.id;
         if (idAntigo && videosLiberadosCarregados[idAntigo]) {
           videosLiberadosMigrados[novoId] = videosLiberadosCarregados[idAntigo];
         }
       });
       
       setVideosLiberados(videosLiberadosMigrados);
       // ADICIONADO: Define loading como false após carregar com sucesso
       setLoading(false);
    } catch (err: any) {
       console.error("Erro durante a carga inicial do localStorage:", err);
       // ADICIONADO: Define o erro se ocorrer
       setError(err.message || "Erro ao carregar dados iniciais.");
       // ADICIONADO: Define loading como false mesmo em caso de erro
       setLoading(false);
    }


    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAndConvertData, lastSync]); // Dependência em loadAndConvertData e lastSync

  // === FUNÇÕES CRUD E PERMISSÕES ===
  // As funções abaixo (adicionar, atualizar, remover, setPermissoes)
  // nesta implementação *síncrona* baseada em localStorage não precisam de loading/error
  // internos, pois a atualização é imediata. O loading/error do hook
  // reflete primariamente o estado da carga *inicial* dos dados.
  // Se você migrar para um backend (Firestore, API), essas funções
  // precisarão se tornar async e gerenciar loading/error individualmente ou via um estado global.

  // ========== ALUNOS ==========
  const adicionarAluno = useCallback((novoAluno: Omit<Aluno, 'id'> & { senha?: string }) => {
    setAlunos((prev: Aluno[]) => {
      // Gera o próximo ID sequencial
      const proximoId = prev.length > 0 ? (Math.max(...prev.map(a => parseInt(a.id) || 0)) + 1) : 1;
      const novoId = proximoId.toString().padStart(2, '0'); // Formato: 01, 02, 03...
      
      // Cria o aluno com ID sequencial
      const alunoCompleto: Aluno = {
        ...novoAluno,
        id: novoId,
        name: novoAluno.nome || novoAluno.name || '',
        password: novoAluno.senha || novoAluno.password || '',
        role: 'student',
        videosLiberados: []
      };
      
      return [...prev, alunoCompleto];
    });
  }, []);
  // alunoId agora é string
  const atualizarAluno = useCallback((alunoId: string, novosDados: Partial<Aluno>) => {
    setAlunos((prev: Aluno[]) =>
      prev.map((a: Aluno) =>
        // Comparação agora é entre strings
        a.id === alunoId ? { ...a, ...novosDados } : a
      )
    );
  }, []);
  // alunoId agora é string
  const removerAluno = useCallback((alunoId: string) => {
    setAlunos((prev: Aluno[]) => {
      // Remove o aluno
      const alunosFiltrados = prev.filter((a: Aluno) => a.id !== alunoId);
      
      // Reorganiza os IDs sequencialmente
      const alunosReorganizados = alunosFiltrados.map((aluno, index) => ({
        ...aluno,
        id: (index + 1).toString().padStart(2, '0') // 01, 02, 03...
      }));
      
      return alunosReorganizados;
    });
    
    setVideosLiberados((prev: VideosLiberados) => {
      // Remove as permissões para este aluno e reorganiza as chaves
      const novo: VideosLiberados = {};
      const alunosAtualizados = alunos.filter(a => a.id !== alunoId);
      
      // Reorganiza as permissões com os novos IDs
      alunosAtualizados.forEach((aluno, index) => {
        const novoId = (index + 1).toString().padStart(2, '0');
        const idAntigo = aluno.id;
        if (prev[idAntigo]) {
          novo[novoId] = prev[idAntigo];
        }
      });
      
      return novo;
    });
  }, [alunos]);
  // ========== VÍDEOS ==========
  const adicionarVideo = useCallback((novoVideo: Video) => {
      // novoVideo.id já deve ser number conforme a interface Video
    setVideos((prev: Video[]) => [...prev, novoVideo]);
  }, []);
  const atualizarVideo = useCallback((videoAtualizado: Video) => {
      // videoAtualizado.id já deve ser number
    setVideos((prev: Video[]) =>
      prev.map((v: Video) =>
        // Comparação é entre numbers
        v.id === videoAtualizado.id ? { ...v, ...videoAtualizado } : v
      )
    );
  }, []);
  const removerVideo = useCallback((videoId: number) => {
    // videoId é number
    setVideos((prev: Video[]) => prev.filter((v: Video) =>
        // Comparação é entre numbers
        v.id !== videoId
    ));
    setVideosLiberados((prev: VideosLiberados) => {
      // Remove o videoId dos arrays de permissões de todos os alunos
      const novo: VideosLiberados = {};
      // Itera sobre as chaves (IDs de aluno, que agora são strings)
      for (const alunoIdString in prev) {
        const videosDoAluno = prev[alunoIdString] || []; // videosDoAluno é number[]
        // Filtra o videoId (number) do array de numbers
        // CORREÇÃO TS7006: Tipagem explícita para 'vid'
        novo[alunoIdString] = videosDoAluno.filter((vid: number) => vid !== videoId);
      }
      return novo;
    });
  }, []);
  // ========== PERMISSÕES (LIBERAÇÃO DE VÍDEOS POR ALUNO) ==========
  // Retorna array de videoIds liberados para o aluno
  // alunoId é string
  const getVideosLiberadosDoAluno = useCallback((alunoId: string): number[] => {
    // alunoId é string, acesso direto ao objeto com chave string
    return videosLiberados[alunoId] || [];
  }, [videosLiberados]);
  // Marca array de vídeos liberados para esse aluno (overwrite)
  // alunoId é string, videoIds são number[]
  const setPermissoesVideosAluno = useCallback((alunoId: string, videoIds: number[]) => {
    // alunoId é string, videoIds são number[], acesso direto ao objeto com chave string
    setVideosLiberados((prev: VideosLiberados) => ({
      ...prev,
      [alunoId]: videoIds // videoIds já são numbers
    }));
  }, []);
  // Libera UM vídeo para UM aluno
  // alunoId é string, videoId é number
  const liberarVideoParaAluno = useCallback((alunoId: string, videoId: number) => {
    // alunoId é string, videoId é number
    setVideosLiberados((prev: VideosLiberados) => {
      const videosAtuais = prev[alunoId] || []; // number[]
      const jaTem = videosAtuais.includes(videoId); // Comparação number com number
      if (jaTem) return prev;
      return {
        ...prev,
        [alunoId]: [...videosAtuais, videoId] // Adiciona videoId (number)
      };
    });
  }, []);
  // Revoga UM vídeo de UM aluno
  // alunoId é string, videoId é number
  const revogarVideoParaAluno = useCallback((alunoId: string, videoId: number) => {
    // alunoId é string, videoId é number
    setVideosLiberados((prev: VideosLiberados) => {
      const videosAtuais = prev[alunoId] || []; // number[]
      // Filtra videoId (number) do array de numbers
      // CORREÇÃO TS7006: Tipagem explícita para 'id'
      return {
        ...prev,
        [alunoId]: videosAtuais.filter((id: number) => id !== videoId)
      };
    });
  }, []);
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
    loading, // <-- ADICIONADO ao retorno
    error, // <-- ADICIONADO ao retorno
  };
}
