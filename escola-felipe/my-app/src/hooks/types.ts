// src/types.ts

// Representa um aluno do sistema
export interface Aluno {
  id: string; // Mudança sugerida: IDs de banco de dados (como Firestore) são frequentemente strings. Se o seu backend usa number, mantenha number.
  sequentialId?: number; // Adicionado: Para o ID sequencial exibido/gerado
  name: string; // Adicionado: Corresponde ao uso no AdminPage (substitui 'nome' ou coexiste se ambos forem necessários)
  nome?: string; // Mantido do seu original, se for usado em outro lugar. Se 'name' for o padrão, pode remover 'nome'.
  email?: string;
  login: string; // Adicionado: Para o campo de login/usuário
  password?: string; // Adicionado: Para o campo de senha (CUIDADO com segurança no frontend!)
  turmaId?: number;
  status?: string; // Exemplo: 'ativo' | 'inativo'
  modulo: number; // ID ou número do módulo atual do aluno (Mantido, mas garantindo que seja number)
  progresso?: number; // Porcentagem de progresso ou similar
  telefone?: string; // Adicionado
  endereco?: string; // Adicionado
  dataNascimento?: string; // Adicionado (formato string 'YYYY-MM-DD')
  dataInicioCurso?: string; // Adicionado (formato string 'YYYY-MM-DD')
  nomePaiMae?: string; // Adicionado (Nome do responsável)
  telefoneResponsavel?: string; // Adicionado
  role: 'admin' | 'student'; // Adicionado: Para verificação de permissão
  videosLiberados: number[]; // Adicionado: Array de IDs de vídeos liberados
  // Adicione outras propriedades do aluno se existirem
}

// Representa um vídeo do curso/plataforma
export interface Video {
  id: number;
  title: string; // Título do vídeo em inglês (padronize se possível)
  titulo?: string; // Título do vídeo em português (caso use em algum lugar)
  duration: string; // Duração do vídeo em inglês (padronize se possível)
  duracao?: string; // Duração do vídeo em português (caso use em algum lugar)
  thumbnail: string;
  level: string; // Ex: 'iniciante' | 'intermediário' | 'avançado'
  modulo?: number; // ID do módulo a que pertence
  liberado?: boolean; // Indica se o vídeo está liberado para o aluno (pode ser redundante com videosLiberados no Aluno)
}

// Representa uma turma (módulo do painel)
export interface Turma {
  id: number;
  title: string;
  videos: Video[];
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
  alunoId: number; // Se o ID do aluno for number
  // alunoId: string; // Se o ID do aluno for string
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

// Tipos auxiliares para notificações e modais (conforme erros e padrão React)
export interface NotificationData {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// Handlers de ações comuns em notificações/modais
export type NotificationCloseHandler = () => void;
export type NotificationConfirmHandler = () => void;
export type NotificationCancelHandler = () => void;

// Se precisar de type para props de componentes que usam notificações:
export interface NotificationProps {
  notification: NotificationData;
  isOpen: boolean;
  onClose: NotificationCloseHandler;
  onConfirm?: NotificationConfirmHandler;
  onCancel?: NotificationCancelHandler;
}

// Adicione as interfaces que usei no AdminPage se não estiverem aqui:
export interface Module { // Parece que Turma e Module são a mesma coisa? Considere unificar.
    id: number;
    title: string;
    videos: Video[];
}

export interface ConfirmacaoState {
    message: string;
    onConfirm: () => void;
}

// Renomeando NotificationData para Notificacao se o AdminPage usar Notificacao
export type Notificacao = NotificationData;

// ========================================================================
// ESTA É A LINHA QUE PRECISA ESTAR AQUI E EXPORTADA!
// Tipo para o objeto de permissões de vídeos por aluno: { [alunoId (string)]: [array de ids de videos liberados (number[])] }
export type VideosLiberados = Record<string, number[]>;
