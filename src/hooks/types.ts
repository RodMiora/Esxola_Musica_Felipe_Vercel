// src/hooks/types.ts   

// Representa um aluno do sistema
export interface Aluno {
  id: string; // IDs de banco de dados (como Firestore) são frequentemente strings
  sequentialId?: number; // Para o ID sequencial exibido/gerado
  name: string; // Corresponde ao uso no AdminPage
  nome?: string; // Mantido do original, se for usado em outro lugar
  email?: string;
  login: string; // Para o campo de login/usuário
  password?: string; // Para o campo de senha
  turmaId?: number;
  status?: string; // Exemplo: 'ativo' | 'inativo'
  modulo: number; // ID ou número do módulo atual do aluno
  progresso?: number; // Porcentagem de progresso ou similar
  telefone?: string;
  endereco?: string;
  dataNascimento?: string; // formato string 'YYYY-MM-DD'
  dataInicioCurso?: string; // formato string 'YYYY-MM-DD'
  nomePaiMae?: string; // Nome do responsável
  telefoneResponsavel?: string;
  role: 'admin' | 'student'; // Para verificação de permissão
  videosLiberados: number[]; // Array de IDs de vídeos liberados
}

// Representa um vídeo do curso/plataforma
export interface Video {
  id: number;
  title: string; // Título do vídeo em inglês
  titulo?: string; // Título do vídeo em português
  duration: string; // Duração do vídeo em inglês
  duracao?: string; // Duração do vídeo em português
  thumbnail: string;
  level: string; // Ex: 'iniciante' | 'intermediário' | 'avançado'
  modulo?: number; // ID do módulo a que pertence
  liberado?: boolean; // Indica se o vídeo está liberado para o aluno
}

// Representa uma turma (módulo do painel)
export interface Turma {
  id: number;
  title: string;
  videos: Video[];
}

// Dicionários de busca
export type AlunosDict = { [id: string]: Aluno }
export type VideosDict = { [id: string]: Video }
export type TurmasDict = { [id: string]: Turma }

// Status possível de aluno
export type AlunoStatus = 'ativo' | 'inativo'

// Estrutura para atualização parcial de aluno
export interface AtualizacaoAluno {
  alunoId: string;
  novosDados: Partial<Aluno>;
}

// Estrutura para atualização parcial de vídeo
export interface AtualizacaoVideo {
  videoId: number;
  novosDados: Partial<Video>;
}

// Tipos usados em useState
export type AlunosState = Aluno[];
export type VideosState = Video[];
export type TurmasState = Turma[];

// Tipos auxiliares para notificações e modais
export interface NotificationData {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// Handlers de ações comuns em notificações/modais
export type NotificationCloseHandler = () => void;
export type NotificationConfirmHandler = () => void;
export type NotificationCancelHandler = () => void;

// Props de componentes que usam notificações
export interface NotificationProps {
  notification: NotificationData;
  isOpen: boolean;
  onClose: NotificationCloseHandler;
  onConfirm?: NotificationConfirmHandler;
  onCancel?: NotificationCancelHandler;
}

// Interface para módulos
export interface Module {
  id: number;
  title: string;
  videos: Video[];
}

export interface ConfirmacaoState {
  message: string;
  onConfirm: () => void;
}

// Renomeando NotificationData para Notificacao
export type Notificacao = NotificationData;

// Tipo para o objeto de permissões de vídeos por aluno
export type VideosLiberados = Record<string, number[]>;