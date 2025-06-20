'use client';
import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
// Importações removidas pois não estamos mais usando Firebase Authentication
// Importe seu hook de sincronização de dados
import { useDataSync } from "@/hooks/useDataSync"; // <--- Importando useDataSync
// Importações dos seus outros serviços (podem ser usados DENTRO do useDataSync ou serviços chamados por ele)
// import { getStudents, addStudent, updateStudent, deleteStudent } from "@/services/studentService";
// import { getYoutubeLinks, getVideoPermissions, updateVideoPermissions } from "@/services/videoService";
// import { useSyncService } from "@/services/syncService"; // Se syncService for diferente de useDataSync
// Importando as interfaces do seu hook/types
import { Aluno, Video } from "@/hooks/types"; // <--- Adjusted path to use @/ alias
// Interfaces adicionais (se não estiverem em hooks/types)
interface Module {
  id: number;
  title: string;
  videos: Video[]; // Assumindo que sua interface Video inclui id, title, duration, thumbnail, level
}
interface Notificacao {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificacaoState {
  tipo: 'success' | 'error' | 'info' | 'warning';
  mensagem: string;
  visivel: boolean;
}

interface ConfirmacaoState {
  message: string;
  onConfirm: () => void;
}
// Assumindo que você tem uma lista estática de módulos/vídeos em algum lugar
// Esta lista pode vir do seu useDataSync ou de outro service/fonte
import { modules as staticModules } from '@/data/modules'; // <--- Exemplo de lista estática

const AdminPage: React.FC = () => {
  const router = useRouter();

  // --- Estados de Autenticação e Autorização ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Estados de Dados (Gerenciados pelo useDataSync) ---
  // Use o hook useDataSync para acessar e manipular os dados da aplicação
  const {
    alunos,
    adicionarAluno,
    atualizarAluno,
    removerAluno,
    videos,
    videosLiberados,
    setPermissoesVideosAluno,
    loading: dataLoading,
    error: dataError,
  } = useDataSync();

  // --- Estados Locais do Componente ---
  // Removido loadingData local, pois o useDataSync gerencia o estado dos dados
  const [error, setError] = useState<string | null>(null); // Erros específicos da UI ou ações manuais
  const [abaAtiva, setAbaAtiva] = useState('alunos'); // 'alunos', 'videos', 'estatisticas'

  // Estados para filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroModulo, setFiltroModulo] = useState<number | ''>('');

  // Estados para modais
  const [modalAberto, setModalAberto] = useState(false); // Modal Adicionar
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false); // Modal Editar
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null); // Aluno sendo adicionado ou editado

  // Estados para o modal de liberação de vídeos
  const [modalLiberarVideosAberto, setModalLiberarVideosAberto] = useState(false);
  const [alunoSelecionadoVideos, setAlunoSelecionadoVideos] = useState<Aluno | null>(null);
  // O estado das permissões no modal virá do videosLiberados do useDataSync,
  // mas precisa de um estado temporário para edicao antes de salvar
  const [videosLiberadosTemp, setVideosLiberadosTemp] = useState<number[]>([]);

  // Lista de módulos e vídeos disponíveis (pode vir do useDataSync ou ser estática)
  const [modulosDisponiveis, setModulosDisponiveis] = useState<Module[]>(staticModules); // Usando a lista estática por enquanto

  // Estados para notificações e confirmação
  const [notificacao, setNotificacao] = useState<Notificacao | null>(null);
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState | null>(null);
  
  // Estado para controlar visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // --- Efeitos ---
  // Efeito principal para lidar com a autenticação via localStorage
  useEffect(() => {
    const checkAuth = () => {
      // Verifica se está no ambiente do navegador
      if (typeof window === 'undefined') {
        return;
      }
      
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const isAdminUser = localStorage.getItem('isAdmin') === 'true';

      if (!isLoggedIn || !isAdminUser) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        router.push('/login');
        return;
      }

      setIsAdmin(true);
      setAuthLoading(false);
    };

    checkAuth();

    // Adiciona listener para mudanças no localStorage
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [router]);

  // Efeito para exibir erros do useDataSync como notificação
  useEffect(() => {
    if (dataError) {
      setError(dataError);
      setNotificacao({ type: 'error', message: dataError });
    }
  }, [dataError]);


  // Efeito para limpar notificações após um tempo
  useEffect(() => {
    if (notificacao) {
      const timer = setTimeout(() => {
        setNotificacao(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificacao]);

  // --- Funções de Manipulação de UI ---
  const fecharModais = () => {
    setModalAberto(false);
    setModalEdicaoAberto(false);
    setModalLiberarVideosAberto(false);
    setAlunoEmEdicao(null);
    setAlunoSelecionadoVideos(null);
    setVideosLiberadosTemp([]); // Limpa o estado temporário
    setConfirmacao(null);
    setMostrarSenha(false); // Reset do estado da senha
  };

  const abrirModalAdicionar = () => {
    const novoAluno: Aluno = {
      id: '', // ID será gerado na função adicionarAluno
      name: '',
      email: '',
      login: '',
      password: '',
      modulo: 1,
      telefone: '',
      endereco: '',
      dataNascimento: '',
      nomePaiMae: '',
      dataInicioCurso: '',
      telefoneResponsavel: '',
      role: 'student',
      videosLiberados: []
    };
    setAlunoEmEdicao(novoAluno);
    setModalAberto(true);
  };

  const abrirModalEdicao = (aluno: Aluno) => {
    // Crie uma cópia do aluno para evitar modificar o estado global diretamente
    setAlunoEmEdicao({...aluno});
    setModalEdicaoAberto(true);
  };

  const abrirModalLiberarVideos = (aluno: Aluno) => {
    setAlunoSelecionadoVideos(aluno);
    // Carrega as permissões atuais do aluno para o estado temporário do modal
    // Use o ID do aluno para buscar as permissões no objeto videosLiberados
    setVideosLiberadosTemp(videosLiberados[aluno.id] || []);
    setModalLiberarVideosAberto(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlunoEmEdicao((prevState: Aluno | null) => {
      if (!prevState) return null;
      // Converte para número se o campo for 'modulo'
      const newValue = name === 'modulo' ? Number(value) : value;
      return { ...prevState, [name]: newValue };
    });
  };

  const handleVideoCheckboxChange = (videoId: number) => {
    setVideosLiberadosTemp(prev => {
      const isSelected = prev.includes(videoId);
      return isSelected
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId];
    });
  };

  // --- Funções de Ação (Usando funções do useDataSync) ---
  const handleAdicionarAluno = async () => {
    if (!alunoEmEdicao) return;
    
    // Validação dos campos obrigatórios
    if (!alunoEmEdicao.name || !alunoEmEdicao.login || !alunoEmEdicao.password || !alunoEmEdicao.telefone) {
      setNotificacao({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios!' });
      return;
    }
    
    // Validação de senha duplicada
    const senhaJaExiste = alunos.some(aluno => aluno.password === alunoEmEdicao.password);
    if (senhaJaExiste) {
      setNotificacao({ type: 'error', message: 'Senha já cadastrada! Por favor, escolha uma senha diferente.' });
      return;
    }
    
    // Não precisamos de loadingData local, o useDataSync gerencia o estado dos dados
    setError(null); // Limpa erro local antes da ação
    try {
      // Chama a função adicionarAluno do useDataSync
      // O useDataSync deve lidar com a persistência (Firestore, etc.) e a atualização do estado global
      await adicionarAluno(alunoEmEdicao); // Assumindo que adicionarAluno é assíncrono se persistir dados
      setNotificacao({ type: 'success', message: 'Aluno adicionado com sucesso!' });
      fecharModais();
    } catch (err: any) {
      console.error("Erro ao adicionar aluno:", err);
      // Não sobrescreve o erro do useDataSync se ele já estiver definido
      if (!dataError) {
         setError(err.message || "Erro ao adicionar aluno.");
         setNotificacao({ type: 'error', message: err.message || "Erro ao adicionar aluno." });
      }
    }
  };

  const handleSalvarEdicaoAluno = async () => {
    if (!alunoEmEdicao || !alunoEmEdicao.id) return;
    
    // Validação de senha duplicada (excluindo o próprio aluno)
    const senhaJaExiste = alunos.some(aluno => 
      aluno.id !== alunoEmEdicao.id && aluno.password === alunoEmEdicao.password
    );
    if (senhaJaExiste) {
      setNotificacao({ type: 'error', message: 'Senha já cadastrada! Por favor, escolha uma senha diferente.' });
      return;
    }
    
    // Não precisamos de loadingData local
    setError(null); // Limpa erro local antes da ação
    try {
      // Chama a função atualizarAluno do useDataSync
      // O useDataSync deve lidar com a persistência (Firestore, etc.) e a atualização do estado global
      await atualizarAluno(alunoEmEdicao.id, alunoEmEdicao); // Assuming atualizarAluno requires id and data
      setNotificacao({ type: 'success', message: 'Aluno atualizado com sucesso!' });
      fecharModais();
    } catch (err: any) {
      console.error("Erro ao salvar edição do aluno:", err);
       if (!dataError) {
         setError(err.message || "Erro ao salvar edição do aluno.");
         setNotificacao({ type: 'error', message: err.message || "Erro ao salvar edição do aluno." });
      }
    }
  };

  const handleRemoverAluno = (alunoId: string) => { // ID do aluno deve ser string se for Firestore ID
    setConfirmacao({
      message: `Tem certeza que deseja remover o aluno com ID ${alunoId}?`,
      onConfirm: async () => {
        // Não precisamos de loadingData local
        setError(null); // Limpa erro local antes da ação
        try {
          // Chama a função removerAluno do useDataSync
          // O useDataSync deve lidar com a persistência e atualização do estado global
          await removerAluno(alunoId); // Assumindo que removerAluno é assíncrono
          setNotificacao({ type: 'success', message: 'Aluno removido com sucesso!' });
          fecharModais(); // Fechar modal de confirmação após sucesso
        } catch (err: any) {
          console.error("Erro ao remover aluno:", err);
           if (!dataError) {
             setError(err.message || "Erro ao remover aluno.");
             setNotificacao({ type: 'error', message: err.message || "Erro ao remover aluno." });
          }
          fecharModais(); // Fechar modal de confirmação mesmo com erro
        }
      }
    });
  };

  const handleSaveVideosLiberados = async () => {
    if (!alunoSelecionadoVideos?.id) return;
    // Não precisamos de loadingData local
    setError(null); // Limpa erro local antes da ação
    try {
      // Chama a função setPermissoesVideosAluno do useDataSync
      // O useDataSync deve lidar com a persistência e atualização do estado global
      await setPermissoesVideosAluno(alunoSelecionadoVideos.id, videosLiberadosTemp); // Assumindo que é assíncrono
      setNotificacao({ type: 'success', message: `Permissões de vídeo salvas para ${alunoSelecionadoVideos.name}!` });
      fecharModais();
    } catch (err: any) {
      console.error("Erro ao salvar permissões de vídeo:", err);
       if (!dataError) {
         setError(err.message || "Erro ao salvar permissões de vídeo.");
         setNotificacao({ type: 'error', message: err.message || "Erro ao salvar permissões de vídeo." });
      }
    }
  };

  // --- Renderização do Formulário de Aluno (Função Completa) ---
  // Use useCallback para memorizar esta função e evitar recriações desnecessárias
  const renderAlunoForm = useCallback(() => {
    if (!alunoEmEdicao) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome Completo */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome Completo<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            id="name"
            value={alunoEmEdicao.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Email e Login na mesma linha */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={alunoEmEdicao.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="login" className="block text-sm font-medium text-gray-400 mb-1">Login<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="login"
            id="login"
            value={alunoEmEdicao.login}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Campo de senha para todos os alunos */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Senha<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              name="password"
              id="password"
              value={alunoEmEdicao.password || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {mostrarSenha ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-400 mb-1">Telefone<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="telefone"
            id="telefone"
            value={alunoEmEdicao.telefone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Módulo */}
        <div className={!alunoEmEdicao.id ? "col-span-2" : "col-span-1"}>
          <label htmlFor="modulo" className="block text-sm font-medium text-gray-400 mb-1">Módulo</label>
          <select
            name="modulo"
            id="modulo"
            value={alunoEmEdicao.modulo}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="1">Módulo 1: Começar</option>
            <option value="2">Módulo 2: Intermediário</option>
            <option value="3">Módulo 3: Avançado</option>
          </select>
        </div>

        {/* Endereço ocupando toda a largura */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-400 mb-1">Endereço</label>
          <input
            type="text"
            name="endereco"
            id="endereco"
            value={alunoEmEdicao.endereco}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Data de Nascimento e Nome do Pai/Mãe na mesma linha */}
        <div>
          <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-400 mb-1">Data de Nascimento</label>
          <input
            type="date"
            name="dataNascimento"
            id="dataNascimento"
            value={alunoEmEdicao.dataNascimento}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="nomePaiMae" className="block text-sm font-medium text-gray-400 mb-1">Nome do Pai/Mãe</label>
          <input
            type="text"
            name="nomePaiMae"
            id="nomePaiMae"
            value={alunoEmEdicao.nomePaiMae}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Data de Início do Curso e Telefone do Responsável na mesma linha */}
        <div>
          <label htmlFor="dataInicioCurso" className="block text-sm font-medium text-gray-400 mb-1">Data de Início do Curso</label>
          <input
            type="date"
            name="dataInicioCurso"
            id="dataInicioCurso"
            value={alunoEmEdicao.dataInicioCurso}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="telefoneResponsavel" className="block text-sm font-medium text-gray-400 mb-1">Telefone do Responsável</label>
          <input
            type="text"
            name="telefoneResponsavel"
            id="telefoneResponsavel"
            value={alunoEmEdicao.telefoneResponsavel}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        {/* Role (Provavelmente 'student' por padrão, mas pode ser editável se necessário) */}
        {/*
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">Role</label>
          <select
            name="role"
            id="role"
            value={alunoEmEdicao.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            required
          >
            <option value="student">Student</option>
             <option value="admin">Admin</option> // Cuidado ao permitir a criação de admins
          </select>
        </div>
        */}
      </div>
    );
  }, [alunoEmEdicao, handleInputChange, modulosDisponiveis]); // Dependências do useCallback

  // --- Filtragem de Alunos ---
  const alunosFiltrados = useMemo(() => {
    let filtered = alunos;

    if (filtroNome) {
      filtered = filtered.filter(aluno =>
        aluno.name.toLowerCase().includes(filtroNome.toLowerCase()) ||
        (aluno.email?.toLowerCase() || '').includes(filtroNome.toLowerCase()) ||
        (aluno.login && aluno.login.toLowerCase().includes(filtroNome.toLowerCase())) // Inclui login no filtro
      );
    }

    if (filtroModulo !== '') {
      filtered = filtered.filter(aluno => aluno.modulo === filtroModulo);
    }

    return filtered;
  }, [alunos, filtroNome, filtroModulo]); // Dependências do useMemo

  // --- Renderização Principal ---
  // Mostra um loader enquanto a autenticação ou a verificação de role está acontecendo
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Carregando autenticação...</p> {/* Ou um spinner */}
      </div>
    );
  }

  // Se não for admin após o carregamento, não renderiza o conteúdo do painel
  if (!isAdmin) {
    // O useEffect já deve ter redirecionado, mas este é um fallback
    return null;
  }

  // Mostra um loader enquanto os dados estão carregando
  if (dataLoading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Carregando dados do painel...</p> {/* Ou um spinner */}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Cabeçalho com botões de navegação */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/videos')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Voltar para Vídeos
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('isAdmin');
              router.push('/login');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === 'alunos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setAbaAtiva('alunos')}
          >
            Gerenciar Alunos
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === 'videos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setAbaAtiva('videos')}
          >
            Gerenciar Vídeos
          </button>
           <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === 'estatisticas'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setAbaAtiva('estatisticas')}
          >
            Estatísticas
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === 'alunos' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Gerenciar Alunos</h2>
          {/* Filtros e Botão Adicionar */}
          <div className="flex flex-col md:flex-row items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Filtrar por nome, email ou login..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="w-full md:w-auto flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(Number(e.target.value) || '')}
              className="w-full md:w-auto px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todos os Módulos</option>
              {modulosDisponiveis.map(mod => (
                <option key={mod.id} value={mod.id}>{mod.title}</option>
              ))}
            </select>
            <button
              onClick={abrirModalAdicionar}
              className="w-full md:w-auto ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Adicionar Aluno
            </button>
          </div>
          {/* Tabela de Alunos */}
          <div className="overflow-x-auto bg-gray-800 rounded-md shadow-lg">
            {/* Adicione uma verificação se alunosFiltrados está vazio */}
            {alunosFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum aluno encontrado com os filtros aplicados.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {/* Ajuste as colunas conforme os dados que você quer mostrar */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Módulo</th>
                     {/* Adicione mais colunas se necessário (Telefone, Login, etc.) */}
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.sequentialId || aluno.id}</td> {/* Mostra sequentialId se existir */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{aluno.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.modulo}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.login}</td> {/* Mostrando login */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => abrirModalEdicao(aluno)}
                          className="text-orange-500 hover:text-orange-600 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => abrirModalLiberarVideos(aluno)}
                          className="text-blue-500 hover:text-blue-600 mr-3"
                        >
                          Vídeos
                        </button>
                        <button
                          onClick={() => handleRemoverAluno(aluno.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba de Vídeos (Exemplo Básico) */}
      {abaAtiva === 'videos' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Gerenciar Vídeos</h2>
          <p className="text-gray-400">Conteúdo para gerenciar vídeos ainda não implementado.</p>
          {/* Aqui você listaria os vídeos, teria botões para adicionar/editar/remover vídeos, etc. */}
          {/* Você usaria as funções adicionarVideo, atualizarVideo, removerVideo do useDataSync aqui */}
          {/* Exemplo básico de listagem de vídeos disponíveis: */}
          <div className="space-y-4 mt-6">
              {modulosDisponiveis.map(modulo => (
                <div key={modulo.id} className="border border-gray-700 rounded-md p-4">
                  <h4 className="text-lg font-medium text-white mb-3">{modulo.title}</h4>
                  <ul className="list-disc list-inside text-gray-300">
                     {modulo.videos.map(video => (
                        <li key={video.id}>
                           {video.title} (ID: {video.id}, Duração: {video.duration}, Nível: {video.level})
                        </li>
                     ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba de Estatísticas (Exemplo Básico) */}
       {abaAtiva === 'estatisticas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Estatísticas</h2>
          <p className="text-gray-400">Conteúdo para estatísticas ainda não implementado.</p>
          {/* Aqui você mostraria gráficos, contagens, etc. */}
           <div className="mt-6">
             <p>Total de Alunos: {alunos.length}</p>
             {/* Adicione outras estatísticas relevantes */}
           </div>
        </div>
      )}


      {/* Notificação Flutuante */}
      {notificacao && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-md shadow-lg text-white ${
            notificacao.type === 'success' ? 'bg-green-600' :
            notificacao.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}
        >
          {notificacao.message}
        </div>
      )}

      {/* Modal Adicionar Aluno */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"> {/* Adicionado max-h e overflow */}
            <h3 className="text-xl font-semibold mb-4 text-white">Adicionar Novo Aluno</h3>
            {/* Mensagem de erro para senha duplicada */}
            {error && error.includes('senha já cadastrada') && (
              <div className="mb-4 p-3 bg-red-600 border border-red-500 rounded-md">
                <p className="text-white text-sm font-medium">{error}</p>
              </div>
            )}
            {renderAlunoForm()} {/* Chama a função para renderizar o formulário */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={fecharModais}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarAluno}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Aluno */}
      {modalEdicaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"> {/* Adicionado max-h e overflow */}
            <h3 className="text-xl font-semibold mb-4 text-white">Editar Aluno</h3>
            {/* Mensagem de erro para senha duplicada */}
            {error && error.includes('senha já cadastrada') && (
              <div className="mb-4 p-3 bg-red-600 border border-red-500 rounded-md">
                <p className="text-white text-sm font-medium">{error}</p>
              </div>
            )}
            {renderAlunoForm()} {/* Reutiliza o mesmo formulário */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={fecharModais}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicaoAluno}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {confirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold mb-4 text-white">Confirmação</h3>
            <p className="text-gray-300 mb-6">{confirmacao.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={fecharModais}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmacao.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Liberação de Vídeos */}
      {modalLiberarVideosAberto && alunoSelecionadoVideos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Liberar Vídeos para: {alunoSelecionadoVideos.name}
            </h3>
            <p className="text-gray-400 mb-6">Selecione os vídeos que este aluno pode assistir.</p>
            {/* Lista de Módulos e Vídeos */}
            <div className="space-y-6">
              {modulosDisponiveis.map(modulo => (
                <div key={modulo.id} className="border border-gray-700 rounded-md p-4">
                  <h4 className="text-lg font-medium text-white mb-3">{modulo.title}</h4>
                  <div className="space-y-3">
                    {modulo.videos.map(video => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                        <div className="flex items-center space-x-3">
                          {/* Checkbox Personalizado */}
                          <div
                            onClick={() => handleVideoCheckboxChange(video.id)}
                            className={`w-4 h-4 border-2 rounded cursor-pointer flex items-center justify-center ${
                                videosLiberadosTemp.includes(video.id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-400'
                            }`}
                          >
                            {videosLiberadosTemp.includes(video.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {/* Título e Duração do Vídeo */}
                          <div>
                            <p className="text-white font-medium">{video.title}</p>
                            <p className="text-gray-400 text-sm">Duração: {video.duration}</p>
                          </div>
                        </div>
                        {/* Status */}
                        <div className="flex items-center">
                          {/* Badge de Status (baseado no estado temporário) */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            videosLiberadosTemp.includes(video.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}>
                            {videosLiberadosTemp.includes(video.id) ? 'Liberado' : 'Bloqueado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={fecharModais}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Fechar
              </button>
              <button
                onClick={handleSaveVideosLiberados}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
