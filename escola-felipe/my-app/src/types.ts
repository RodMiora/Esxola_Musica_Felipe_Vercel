// src/types.ts

// Representa um aluno do sistema
export interface Aluno {
  id: number
  nome: string
  email?: string
  turmaId?: number
  status?: string // Exemplo: 'ativo' | 'inativo'
  modulo?: number // ID ou número do módulo atual do aluno
  progresso?: number // Porcentagem de progresso ou similar
}

// Representa um vídeo do curso/plataforma
export interface Video {
  id: number
  title: string // Título do vídeo em inglês (padronize se possível)
  titulo?: string // Título do vídeo em português (caso use em algum lugar)
  duration: string // Duração do vídeo em inglês (padronize se possível)
  duracao?: string // Duração do vídeo em português (caso use em algum lugar)
  thumbnail: string
  level: string // Ex: 'iniciante' | 'intermediário' | 'avançado'
  modulo?: number // ID do módulo a que pertence
  liberado?: boolean // Indica se o vídeo está liberado para o aluno
}

// Representa uma turma (módulo do painel)
export interface Turma {
  id: number
  title: string
  videos: Video[]
  // Se quiser, adicione alunos: Aluno[] ou outros campos
}

// Dicionários de busca
export type AlunosDict = { [id: string]: Aluno }
export type VideosDict = { [id: string]: Video }
export type TurmasDict = { [id: string]: Turma }

// Status possível de aluno
export type AlunoStatus = 'ativo' | 'inativo'

// Estrutura para atualização parcial de aluno
export interface AtualizacaoAluno {
  alunoId: number
  novosDados: Partial<Aluno>
}

// Estrutura para atualização parcial de vídeo
export interface AtualizacaoVideo {
  videoId: number
  novosDados: Partial<Video>
}

// Tipos usados em useState
export type AlunosState = Aluno[]
export type VideosState = Video[]
export type TurmasState = Turma[]

// Tipos auxiliares para notificações e modais (conforme erros e padrão React)
export interface NotificationData {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
}

// Handlers de ações comuns em notificações/modais
export type NotificationCloseHandler = () => void
export type NotificationConfirmHandler = () => void
export type NotificationCancelHandler = () => void

// Se precisar de type para props de componentes que usam notificações:
export interface NotificationProps {
  notification: NotificationData
  isOpen: boolean
  onClose: NotificationCloseHandler
  onConfirm?: NotificationConfirmHandler
  onCancel?: NotificationCancelHandler
}
