"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { modules as allModulesData } from '../../data/modules';

// Componente de notificação
const NotificationContainer = ({ notification, onClose }: { notification: { type: 'success' | 'error', message: string } | null, onClose: () => void }) => {
  if (!notification) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white`}>
      <div className="flex items-center justify-between">
        <span>{notification.message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

// Componente de diálogo de confirmação
const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-white">Carregando painel...</p>
    </div>
  </div>
);

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("alunos");
  const [loading, setLoading] = useState(true);
  
  // Estado para notificações
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Estado para diálogo de confirmação
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Estados para filtros e busca
  const [filtroAluno, setFiltroAluno] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estado para o modal de liberação de vídeos
  const [mostrarModalVideos, setMostrarModalVideos] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [videosLiberados, setVideosLiberados] = useState<{[key: string]: number[]}>({});
  
  // Estado para armazenar os títulos personalizados dos vídeos
  const [videoTitles, setVideoTitles] = useState<{[key: number]: string}>({});
  
  // Estado para armazenar todos os vídeos formatados para o modal de liberação
  const [allVideosForModal, setAllVideosForModal] = useState<any[]>([]);
  
  // Inicializar com arrays vazios em vez de dados simulados
  const [alunos, setAlunos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  // Função para mostrar notificações
  const mostrarNotificacao = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Função para mostrar diálogo de confirmação
  const mostrarConfirmacao = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  // Função para salvar no localStorage com tratamento de erro
  const salvarNoLocalStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      mostrarNotificacao('error', `Erro ao salvar ${key}`);
    }
  }, [mostrarNotificacao]);

  // Função para log de auditoria
  const logAcao = useCallback((acao: string, detalhes: any) => {
    const log = {
      timestamp: new Date().toISOString(),
      acao,
      detalhes,
      usuario: 'admin'
    };
    
    try {
      const logs = JSON.parse(localStorage.getItem('logsAuditoria') || '[]');
      logs.push(log);
      localStorage.setItem('logsAuditoria', JSON.stringify(logs));
    } catch (error) {
      console.error('Erro ao salvar log de auditoria:', error);
    }
  }, []);

  // Função para validar email
  const validarEmail = useCallback((email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  // Alunos filtrados com useMemo para otimização
  const alunosFiltrados = useMemo(() => {
    return alunos.filter(aluno => {
      const matchNome = aluno.nome.toLowerCase().includes(filtroAluno.toLowerCase());
      const matchModulo = filtroModulo === 'todos' || aluno.modulo === filtroModulo;
      return matchNome && matchModulo;
    });
  }, [alunos, filtroAluno, filtroModulo]);

  // Alunos paginados
  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return alunosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [alunosFiltrados, paginaAtual, itensPorPagina]);

  // Estatísticas com useMemo
  const estatisticas = useMemo(() => ({
    totalAlunos: alunos.length,
    totalVideos: videos.length,
    videosLiberados: videos.filter(v => v.liberado).length,
    progressoMedio: alunos.length > 0 ? alunos.reduce((acc, aluno) => acc + aluno.progresso, 0) / alunos.length : 0
  }), [alunos, videos]);

  // Total de páginas
  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);

  // Carregar dados do localStorage
  useEffect(() => {
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(isAdminUser);
    
    const savedAlunos = localStorage.getItem('alunos');
    const savedVideos = localStorage.getItem('videos');
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    const savedVideoTitles = localStorage.getItem('videoTitles');
    
    const dadosPadraoAlunos = [
      { id: 1, nome: "João Silva", email: "joao@exemplo.com", modulo: "Módulo 1", progresso: 60, login: "joao", senha: "123456", telefone: "(11) 99999-9999", endereco: "Rua A, 123", dataNascimento: "1990-01-01", nomePaiMae: "Maria Silva", telefoneResponsavel: "(11) 88888-8888", dataInicioCurso: "2024-01-01" },
      { id: 2, nome: "Maria Oliveira", email: "maria@exemplo.com", modulo: "Módulo 2", progresso: 45, login: "maria", senha: "123456", telefone: "(11) 77777-7777", endereco: "Rua B, 456", dataNascimento: "1985-05-15", nomePaiMae: "José Oliveira", telefoneResponsavel: "(11) 66666-6666", dataInicioCurso: "2024-02-01" },
      { id: 3, nome: "Pedro Santos", email: "pedro@exemplo.com", modulo: "Módulo 1", progresso: 30, login: "pedro", senha: "123456", telefone: "(11) 55555-5555", endereco: "Rua C, 789", dataNascimento: "1992-10-20", nomePaiMae: "Ana Santos", telefoneResponsavel: "(11) 44444-4444", dataInicioCurso: "2024-03-01" },
      { id: 4, nome: "Ana Costa", email: "ana@exemplo.com", modulo: "Módulo 3", progresso: 75, login: "ana", senha: "123456", telefone: "(11) 33333-3333", endereco: "Rua D, 101", dataNascimento: "1988-12-05", nomePaiMae: "Carlos Costa", telefoneResponsavel: "(11) 22222-2222", dataInicioCurso: "2024-04-01" },
      { id: 5, nome: "Lucas Ferreira", email: "lucas@exemplo.com", modulo: "Módulo 2", progresso: 50, login: "lucas", senha: "123456", telefone: "(11) 11111-1111", endereco: "Rua E, 202", dataNascimento: "1995-03-30", nomePaiMae: "Lucia Ferreira", telefoneResponsavel: "(11) 99999-0000", dataInicioCurso: "2024-05-01" },
    ];
    
    const dadosPadraoVideos = [
      { id: 101, titulo: "Partes do violão", modulo: "Módulo 1", visualizacoes: 245, duracao: "12:30", liberado: true },
      { id: 102, titulo: "Tipos de violão", modulo: "Módulo 1", visualizacoes: 198, duracao: "10:15", liberado: true },
      { id: 201, titulo: "Postura correta", modulo: "Módulo 2", visualizacoes: 176, duracao: "14:20", liberado: false },
      { id: 301, titulo: "Acordes maiores", modulo: "Módulo 3", visualizacoes: 210, duracao: "18:45", liberado: false },
      { id: 401, titulo: "Batidas básicas", modulo: "Módulo 4", visualizacoes: 189, duracao: "15:30", liberado: false },
    ];

    if (savedAlunos) {
      setAlunos(JSON.parse(savedAlunos));
    } else {
      setAlunos(dadosPadraoAlunos);
      salvarNoLocalStorage('alunos', dadosPadraoAlunos);
    }

    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      setVideos(dadosPadraoVideos);
      salvarNoLocalStorage('videos', dadosPadraoVideos);
    }

    if (savedVideosLiberados) {
      setVideosLiberados(JSON.parse(savedVideosLiberados));
    } else {
      setVideosLiberados({});
      salvarNoLocalStorage('videosLiberados', {});
    }

    if (savedVideoTitles) {
      try {
        setVideoTitles(JSON.parse(savedVideoTitles));
      } catch (error) {
        console.error('Erro ao carregar títulos personalizados:', error);
        setVideoTitles({});
      }
    }

    setLoading(false);

    if (!isAdminUser) {
      router.push('/videos');
    }
  }, [router, salvarNoLocalStorage]);

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    if (alunos.length > 0) {
      salvarNoLocalStorage('alunos', alunos);
    }
  }, [alunos, salvarNoLocalStorage]);

  useEffect(() => {
    if (videos.length > 0) {
      salvarNoLocalStorage('videos', videos);
    }
  }, [videos, salvarNoLocalStorage]);

  useEffect(() => {
    if (Object.keys(videosLiberados).length > 0) {
      salvarNoLocalStorage('videosLiberados', videosLiberados);
    }
  }, [videosLiberados, salvarNoLocalStorage]);

  // Estados para gerenciamento de alunos
  const [editandoAlunoId, setEditandoAlunoId] = useState<number | null>(null);
  const [novoAluno, setNovoAluno] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState({
    id: 0,
    nome: "",
    email: "",
    modulo: "Módulo 1",
    progresso: 0,
    endereco: "",
    telefone: "",
    dataNascimento: "",
    nomePaiMae: "",
    telefoneResponsavel: "",
    dataInicioCurso: new Date().toISOString().split('T')[0],
    login: "",
    senha: ""
  });

  // Estado para erros do formulário
  const [formErrors, setFormErrors] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    login: "",
    senha: "",
    email: ""
  });

  // Função de validação melhorada
  const validarFormulario = useCallback(() => {
    const errors: any = {};
    
    if (!alunoEmEdicao.nome.trim()) errors.nome = "campo obrigatório";
    if (!alunoEmEdicao.telefone.trim()) errors.telefone = "campo obrigatório";
    if (!alunoEmEdicao.endereco.trim()) errors.endereco = "campo obrigatório";
    if (!alunoEmEdicao.login.trim()) errors.login = "campo obrigatório";
    if (!alunoEmEdicao.senha.trim()) errors.senha = "campo obrigatório";
    if (alunoEmEdicao.email && !validarEmail(alunoEmEdicao.email)) {
      errors.email = "email inválido";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [alunoEmEdicao, validarEmail]);

  // Funções para gerenciar alunos
  const adicionarAluno = useCallback(() => {
    const novoId = Math.max(...alunos.map(a => a.id), 0) + 1;
    setAlunoEmEdicao({
      id: novoId,
      nome: "",
      email: "",
      modulo: "Módulo 1",
      progresso: 0,
      endereco: "",
      telefone: "",
      dataNascimento: "",
      nomePaiMae: "",
      telefoneResponsavel: "",
      dataInicioCurso: new Date().toISOString().split('T')[0],
      login: "",
      senha: ""
    });
    setFormErrors({
      nome: "",
      telefone: "",
      endereco: "",
      login: "",
      senha: "",
      email: ""
    });
    setNovoAluno(true);
  }, [alunos]);

  const editarAluno = useCallback((id: number) => {
    const aluno = alunos.find(a => a.id === id);
    if (aluno) {
      setAlunoEmEdicao({
        ...aluno,
        endereco: aluno.endereco || "",
        telefone: aluno.telefone || "",
        dataNascimento: aluno.dataNascimento || "",
        nomePaiMae: aluno.nomePaiMae || "",
        telefoneResponsavel: aluno.telefoneResponsavel || "",
        dataInicioCurso: aluno.dataInicioCurso || new Date().toISOString().split('T')[0],
        login: aluno.login || "",
        senha: aluno.senha || ""
      });
      setFormErrors({
        nome: "",
        telefone: "",
        endereco: "",
        login: "",
        senha: "",
        email: ""
      });
      setEditandoAlunoId(id);
    }
  }, [alunos]);

  const salvarAluno = useCallback(() => {
    if (!validarFormulario()) {
      mostrarNotificacao('error', 'Por favor, corrija os erros no formulário');
      return;
    }

    // Verificar se o login já existe
    const loginExistente = alunos.some(
      aluno => aluno.id !== alunoEmEdicao.id && aluno.login === alunoEmEdicao.login
    );
    
    if (loginExistente) {
      mostrarNotificacao('error', 'Este nome de login já está em uso. Por favor, escolha outro.');
      return;
    }

    const alunoCompleto = {
      ...alunoEmEdicao,
      progresso: parseInt(alunoEmEdicao.progresso.toString()) || 0
    };

    if (novoAluno) {
      setAlunos([...alunos, alunoCompleto]);
      logAcao('Aluno adicionado', { nome: alunoCompleto.nome, id: alunoCompleto.id });
      mostrarNotificacao('success', 'Aluno adicionado com sucesso!');
      setNovoAluno(false);
    } else {
      setAlunos(alunos.map(aluno =>
        aluno.id === alunoCompleto.id ? alunoCompleto : aluno
      ));
      logAcao('Aluno editado', { nome: alunoCompleto.nome, id: alunoCompleto.id });
      mostrarNotificacao('success', 'Aluno atualizado com sucesso!');
      setEditandoAlunoId(null);
    }

    setAlunoEmEdicao({
      id: 0,
      nome: "",
      email: "",
      modulo: "Módulo 1",
      progresso: 0,
      endereco: "",
      telefone: "",
      dataNascimento: "",
      nomePaiMae: "",
      telefoneResponsavel: "",
      dataInicioCurso: "",
      login: "",
      senha: ""
    });

    setFormErrors({
      nome: "",
      telefone: "",
      endereco: "",
      login: "",
      senha: "",
      email: ""
    });
  }, [alunoEmEdicao, alunos, novoAluno, validarFormulario, mostrarNotificacao, logAcao]);

  const cancelarEdicao = useCallback(() => {
    setEditandoAlunoId(null);
    setNovoAluno(false);
    setAlunoEmEdicao({
      id: 0,
      nome: "",
      email: "",
      modulo: "Módulo 1",
      progresso: 0,
      endereco: "",
      telefone: "",
      dataNascimento: "",
      nomePaiMae: "",
      telefoneResponsavel: "",
      dataInicioCurso: "",
      login: "",
      senha: ""
    });
    setFormErrors({
      nome: "",
      telefone: "",
      endereco: "",
      login: "",
      senha: "",
      email: ""
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAlunoEmEdicao(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando o usuário começar a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  }, [formErrors]);

  const removerAlunoComConfirmacao = useCallback((id: number) => {
    const aluno = alunos.find(a => a.id === id);
    if (aluno) {
      mostrarConfirmacao(
        'Remover Aluno',
        `Tem certeza que deseja remover o aluno ${aluno.nome}?`,
        () => {
          setAlunos(alunos.filter(a => a.id !== id));
          logAcao('Aluno removido', { nome: aluno.nome, id: aluno.id });
          mostrarNotificacao('success', 'Aluno removido com sucesso!');
        }
      );
    }
  }, [alunos, mostrarConfirmacao, logAcao, mostrarNotificacao]);

  // Funções para gerenciar vídeos
  const adicionarVideo = useCallback(() => {
    const novoId = Math.max(...videos.map(v => v.id), 0) + 1;
    const novoVideo = {
      id: novoId,
      titulo: "Novo Vídeo",
      modulo: "Módulo 1",
      visualizacoes: 0,
      duracao: "00:00",
      liberado: false
    };
    setVideos([...videos, novoVideo]);
    logAcao('Vídeo adicionado', { titulo: novoVideo.titulo, id: novoVideo.id });
    mostrarNotificacao('success', 'Vídeo adicionado com sucesso!');
  }, [videos, logAcao, mostrarNotificacao]);

  const removerVideoComConfirmacao = useCallback((id: number) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      mostrarConfirmacao(
        'Remover Vídeo',
        `Tem certeza que deseja remover o vídeo "${video.titulo}"?`,
        () => {
          setVideos(videos.filter(v => v.id !== id));
          logAcao('Vídeo removido', { titulo: video.titulo, id: video.id });
          mostrarNotificacao('success', 'Vídeo removido com sucesso!');
        }
      );
    }
  }, [videos, mostrarConfirmacao, logAcao, mostrarNotificacao]);

  const toggleVideoLiberado = useCallback((id: number) => {
    setVideos(videos.map(video =>
      video.id === id ? { ...video, liberado: !video.liberado } : video
    ));
    const video = videos.find(v => v.id === id);
    if (video) {
      const acao = video.liberado ? 'Vídeo bloqueado' : 'Vídeo liberado';
      logAcao(acao, { titulo: video.titulo, id: video.id });
      mostrarNotificacao('success', `Vídeo ${video.liberado ? 'bloqueado' : 'liberado'} com sucesso!`);
    }
  }, [videos, logAcao, mostrarNotificacao]);

  // Função para exportar dados
  const exportarDados = useCallback(() => {
    const dados = { 
      alunos, 
      videos, 
      videosLiberados, 
      videoTitles,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-curso-violao-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarNotificacao('success', 'Dados exportados com sucesso!');
  }, [alunos, videos, videosLiberados, videoTitles, mostrarNotificacao]);

  // Função para abrir o modal de liberação de vídeos
  const abrirModalLiberarVideos = useCallback((aluno: any) => {
    const savedVideoTitles = localStorage.getItem('videoTitles');
    let currentVideoTitles = {};
    if (savedVideoTitles) {
      try {
        currentVideoTitles = JSON.parse(savedVideoTitles);
        setVideoTitles(currentVideoTitles);
      } catch (error) {
        console.error('Erro ao carregar títulos personalizados:', error);
      }
    }

    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    if (savedVideosLiberados) {
      try {
        const videosLiberadosData = JSON.parse(savedVideosLiberados);
        setVideosLiberados(videosLiberadosData);
      } catch (error) {
        console.error('Erro ao carregar permissões de vídeos:', error);
      }
    } else {
      setVideosLiberados({});
    }

    const allVideosFromModules = allModulesData.flatMap(module =>
      module.videos.map(video => ({
        id: video.id,
        titulo: (currentVideoTitles as {[key: number]: string})[video.id] || video.title,
        modulo: module.title,
        duracao: video.duration,
      }))
    );

    setAllVideosForModal(allVideosFromModules);
    setAlunoSelecionado(aluno);
    setMostrarModalVideos(true);
  }, []);

  // Função para fechar o modal de liberação de vídeos
  const fecharModalLiberarVideos = useCallback(() => {
    salvarNoLocalStorage('videosLiberados', videosLiberados);
    setMostrarModalVideos(false);
    setAlunoSelecionado(null);
    mostrarNotificacao('success', 'Permissões de vídeos salvas com sucesso!');
  }, [videosLiberados, salvarNoLocalStorage, mostrarNotificacao]);

  // Função para verificar se um vídeo está liberado para um aluno
  const isVideoLiberado = useCallback((alunoId: number, videoId: number) => {
    const alunoIdStr = alunoId.toString();
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    if (savedVideosLiberados) {
      try {
        const videosLiberadosData = JSON.parse(savedVideosLiberados);
        return videosLiberadosData[alunoIdStr]?.includes(videoId) || false;
      } catch (error) {
        console.error('Erro ao verificar permissões de vídeos:', error);
        return false;
      }
    }
    return videosLiberados[alunoIdStr]?.includes(videoId) || false;
  }, [videosLiberados]);

  // Função para alternar a liberação de um vídeo para um aluno
  const toggleVideoLiberadoParaAluno = useCallback((alunoId: number, videoId: number) => {
    const alunoIdStr = alunoId.toString();
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    let currentVideosLiberados = {};
    if (savedVideosLiberados) {
      try {
        currentVideosLiberados = JSON.parse(savedVideosLiberados);
      } catch (error) {
        console.error('Erro ao carregar permissões de vídeos:', error);
      }
    }

    const alunoVideos = (currentVideosLiberados as {[key: string]: number[]})[alunoIdStr] || [];
    const videoIndex = alunoVideos.indexOf(videoId);
    
    if (videoIndex === -1) {
      const novoEstado = {
        ...currentVideosLiberados,
        [alunoIdStr]: [...alunoVideos, videoId]
      };
      setVideosLiberados(novoEstado);
      salvarNoLocalStorage('videosLiberados', novoEstado);
    } else {
      const novosVideos = [...alunoVideos];
      novosVideos.splice(videoIndex, 1);
      const novoEstado = {
        ...currentVideosLiberados,
        [alunoIdStr]: novosVideos
      };
      setVideosLiberados(novoEstado);
      salvarNoLocalStorage('videosLiberados', novoEstado);
    }
  }, [salvarNoLocalStorage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NotificationContainer 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <div className="flex space-x-4">
            <button
              onClick={exportarDados}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Exportar Dados
            </button>
            <button
              onClick={() => router.push('/videos')}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Voltar aos Vídeos
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {['alunos', 'videos', 'estatisticas'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'alunos' ? 'Gerenciar Alunos' : 
               tab === 'videos' ? 'Gerenciar Vídeos' : 'Estatísticas'}
            </button>
          ))}
        </div>

        {/* Conteúdo da tab Alunos */}
        {activeTab === 'alunos' && (
          <div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
              <h2 className="text-2xl font-bold">Lista de Alunos</h2>
              
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={filtroAluno}
                  onChange={(e) => setFiltroAluno(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="todos">Todos os Módulos</option>
                  {['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'].map((modulo) => (
                    <option key={modulo} value={modulo}>{modulo}</option>
                  ))}
                </select>
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                  onClick={adicionarAluno}
                >
                  Adicionar Aluno
                </button>
              </div>
            </div>

            {/* Tabela de Alunos - Responsiva */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Módulo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Progresso</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {alunosPaginados.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{aluno.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.modulo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${aluno.progresso}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{aluno.progresso}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-500 hover:text-blue-400"
                              onClick={() => editarAluno(aluno.id)}
                            >
                              Editar
                            </button>
                            <button
                              className="text-green-500 hover:text-green-400"
                              onClick={() => abrirModalLiberarVideos(aluno)}
                            >
                              Vídeos
                            </button>
                            <button
                              className="text-red-500 hover:text-red-400"
                              onClick={() => removerAlunoComConfirmacao(aluno.id)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-600">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, alunosFiltrados.length)} de {alunosFiltrados.length} resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                          disabled={paginaAtual === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setPaginaAtual(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === paginaAtual
                                ? 'z-10 bg-orange-600 border-orange-600 text-white'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                          disabled={paginaAtual === totalPaginas}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulário de Edição/Adição */}
            {(editandoAlunoId !== null || novoAluno) && (
              <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">
                  {novoAluno ? 'Adicionar Novo Aluno' : 'Editar Aluno'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nome"
                        value={alunoEmEdicao.nome}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.nome ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {formErrors.nome && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{formErrors.nome}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={alunoEmEdicao.email}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {formErrors.email && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{formErrors.email}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Módulo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Módulo</label>
                    <select
                      name="modulo"
                      value={alunoEmEdicao.modulo}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'].map((modulo) => (
                        <option key={modulo} value={modulo}>{modulo}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Progresso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Progresso (%)</label>
                    <input
                      type="number"
                      name="progresso"
                      min="0"
                      max="100"
                      value={alunoEmEdicao.progresso}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Endereço <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="endereco"
                        value={alunoEmEdicao.endereco}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.endereco ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {formErrors.endereco && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{formErrors.endereco}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="telefone"
                        value={alunoEmEdicao.telefone}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.telefone ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {formErrors.telefone && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{formErrors.telefone}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={alunoEmEdicao.dataNascimento}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Nome do Pai/Mãe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Pai/Mãe</label>
                    <input
                      type="text"
                      name="nomePaiMae"
                      value={alunoEmEdicao.nomePaiMae}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Telefone do Responsável */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefone do Responsável</label>
                    <input
                      type="tel"
                      name="telefoneResponsavel"
                      value={alunoEmEdicao.telefoneResponsavel}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Data de Início do Curso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data de Início do Curso</label>
                    <input
                      type="date"
                      name="dataInicioCurso"
                      value={alunoEmEdicao.dataInicioCurso}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Login */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Login <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="login"
                        value={alunoEmEdicao.login}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.login ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {formErrors.login && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{formErrors.login}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Senha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="senha"
                        value={alunoEmEdicao.senha}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${formErrors.senha ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                      {formErrors.senha && (
                        <span className="text-red-500 text-xs absolute -bottom-5 right-0">{formErrors.senha}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={cancelarEdicao}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={salvarAluno}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da tab Vídeos */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lista de Vídeos</h2>
              <button
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
                onClick={adicionarVideo}
              >
                Adicionar Vídeo
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Título</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Módulo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duração</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{video.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{video.titulo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{video.modulo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{video.duracao}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${video.liberado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {video.liberado ? 'Liberado' : 'Bloqueado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className={`${video.liberado ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                              onClick={() => toggleVideoLiberado(video.id)}
                            >
                              {video.liberado ? 'Bloquear' : 'Liberar'}
                            </button>
                            <button
                              className="text-red-500 hover:text-red-400"
                              onClick={() => removerVideoComConfirmacao(video.id)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da tab Estatísticas */}
        {activeTab === 'estatisticas' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Total de Alunos</h3>
                <p className="text-4xl font-bold text-orange-500">{estatisticas.totalAlunos}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Total de Vídeos</h3>
                <p className="text-4xl font-bold text-orange-500">{estatisticas.totalVideos}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Vídeos Liberados</h3>
                <p className="text-4xl font-bold text-orange-500">{estatisticas.videosLiberados}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Progresso Médio</h3>
                <p className="text-4xl font-bold text-orange-500">{estatisticas.progressoMedio.toFixed(1)}%</p>
              </div>
            </div>

            {/* Distribuição por Módulo */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Distribuição de Alunos por Módulo</h3>
              <div className="space-y-4">
                {['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'].map((modulo) => {
                  const alunosDoModulo = alunos.filter(aluno => aluno.modulo === modulo).length;
                  const porcentagem = estatisticas.totalAlunos > 0 ? (alunosDoModulo / estatisticas.totalAlunos) * 100 : 0;
                  
                  return (
                    <div key={modulo} className="flex items-center">
                      <div className="w-24 text-sm font-medium">{modulo}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${porcentagem}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 w-20 text-right">
                        {alunosDoModulo} ({porcentagem.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Liberação de Vídeos */}
      {mostrarModalVideos && alunoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liberar Vídeos para {alunoSelecionado.nome}</h2>
              <button
                onClick={fecharModalLiberarVideos}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(allVideosForModal.reduce((acc, video) => {
                const modulo = video.modulo || 'Sem Módulo';
                if (!acc[modulo]) {
                  acc[modulo] = [];
                }
                acc[modulo].push(video);
                return acc;
              }, {} as { [key: string]: any[] })).sort(([modA], [modB]) => {
                const numA = parseInt(modA.match(/\d+/)?.[0] || '0');
                const numB = parseInt(modB.match(/\d+/)?.[0] || '0');
                return numA - numB;
              }).map(([modulo, videosDoModulo]) => {
                const videos = videosDoModulo as any[];
                if (videos.length === 0) return null;
                
                return (
                  <div key={modulo} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">{modulo}</h3>
                    <div className="space-y-2">
                      {videos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">{video.titulo}</p>
                            <p className="text-sm text-gray-400">Duração: {video.duracao}</p>
                          </div>
                          <div className="flex items-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-500 focus:ring-orange-500"
                                checked={isVideoLiberado(alunoSelecionado.id, video.id)}
                                onChange={() => toggleVideoLiberadoParaAluno(alunoSelecionado.id, video.id)}
                              />
                              <span className="ml-2 text-sm">
                                {isVideoLiberado(alunoSelecionado.id, video.id) ? "Liberado" : "Bloqueado"}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={fecharModalLiberarVideos}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
