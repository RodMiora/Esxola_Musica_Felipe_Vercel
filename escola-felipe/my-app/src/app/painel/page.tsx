"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { modules as allModulesData } from '../../data/modules'; // Importar os módulos

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("alunos");
  const [loading, setLoading] = useState(true);
  
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
  const [videos, setVideos] = useState<any[]>([]); // Mantido para a aba 'Gerenciar Vídeos'
  
  // Carregar dados do localStorage
  useEffect(() => {
    // Verificar se o usuário é administrador primeiro
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(isAdminUser);
    
    // Carregar dados do localStorage
    const savedAlunos = localStorage.getItem('alunos');
    const savedVideos = localStorage.getItem('videos');
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    const savedVideoTitles = localStorage.getItem('videoTitles');
    
    // Dados padrão para alunos caso não existam no localStorage
    const dadosPadraoAlunos = [
      { id: 1, nome: "João Silva", email: "joao@exemplo.com", modulo: "Módulo 1", progresso: 60, login: "joao", senha: "123456" },
      { id: 2, nome: "Maria Oliveira", email: "maria@exemplo.com", modulo: "Módulo 2", progresso: 45, login: "maria", senha: "123456" },
      { id: 3, nome: "Pedro Santos", email: "pedro@exemplo.com", modulo: "Módulo 1", progresso: 30, login: "pedro", senha: "123456" },
      { id: 4, nome: "Ana Costa", email: "ana@exemplo.com", modulo: "Módulo 3", progresso: 75, login: "ana", senha: "123456" },
      { id: 5, nome: "Lucas Ferreira", email: "lucas@exemplo.com", modulo: "Módulo 2", progresso: 50, login: "lucas", senha: "123456" },
    ];
    
    // Dados padrão para vídeos caso não existam no localStorage
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
      localStorage.setItem('alunos', JSON.stringify(dadosPadraoAlunos));
    }
    
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      setVideos(dadosPadraoVideos);
      localStorage.setItem('videos', JSON.stringify(dadosPadraoVideos));
    }
    
    if (savedVideosLiberados) {
      setVideosLiberados(JSON.parse(savedVideosLiberados));
    } else {
      // Inicializar com um objeto vazio
      setVideosLiberados({});
      localStorage.setItem('videosLiberados', JSON.stringify({}));
    }
    
    // Carregar títulos personalizados dos vídeos
    if (savedVideoTitles) {
      try {
        setVideoTitles(JSON.parse(savedVideoTitles));
      } catch (error) {
        console.error('Erro ao carregar títulos personalizados:', error);
        setVideoTitles({});
      }
    }
    
    setLoading(false);
    
    // Redirecionar se não for administrador
    if (!isAdminUser) {
      router.push('/videos');
    }
  }, [router]);
  
  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    if (alunos.length > 0) {
      localStorage.setItem('alunos', JSON.stringify(alunos));
      console.log('Alunos salvos:', alunos); // Log para debug
    }
  }, [alunos]);
  
  useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem('videos', JSON.stringify(videos));
      console.log('Vídeos salvos:', videos); // Log para debug
    }
  }, [videos]);
  
  // Salvar permissões de vídeos no localStorage quando houver mudanças
  useEffect(() => {
    if (Object.keys(videosLiberados).length > 0) {
      localStorage.setItem('videosLiberados', JSON.stringify(videosLiberados));
      console.log('Permissões de vídeos salvas:', videosLiberados); // Log para debug
    }
  }, [videosLiberados]);
  
  // Adicione os estados para gerenciamento de alunos
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
  
  // Funções para gerenciar alunos
  const adicionarAluno = () => {
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
    setNovoAluno(true);
  };
  
  const editarAluno = (id: number) => {
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
      setEditandoAlunoId(id);
    }
  };
  
  // Adicione este estado para erros do formulário de novo aluno
  const [novoAlunoErrors, setNovoAlunoErrors] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    login: "",
    senha: ""
  });
  
  // Função de validação para o formulário de novo aluno
  const validarNovoAluno = () => {
    const errors: any = {};
    if (!alunoEmEdicao.nome.trim()) errors.nome = "campo obrigatório";
    if (!alunoEmEdicao.telefone.trim()) errors.telefone = "campo obrigatório";
    if (!alunoEmEdicao.endereco.trim()) errors.endereco = "campo obrigatório";
    if (!alunoEmEdicao.login.trim()) errors.login = "campo obrigatório";
    if (!alunoEmEdicao.senha.trim()) errors.senha = "campo obrigatório";
    setNovoAlunoErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Altere a função salvarAluno para usar a validação acima apenas para novoAluno
  const salvarAluno = () => {
    if (novoAluno) {
      if (!validarNovoAluno()) return;
    }
    // Validar campos obrigatórios
    if (!alunoEmEdicao.nome || !alunoEmEdicao.login || !alunoEmEdicao.senha) {
      alert("Por favor, preencha os campos obrigatórios: Nome, Login e Senha");
      return;
    }
    
    // Verificar se o login já existe
    const loginExistente = alunos.some(
      aluno => aluno.id !== alunoEmEdicao.id && aluno.login === alunoEmEdicao.login
    );
    
    if (loginExistente) {
      alert("Este nome de login já está em uso. Por favor, escolha outro.");
      return;
    }
    
    const alunoCompleto = {
      ...alunoEmEdicao,
      progresso: parseInt(alunoEmEdicao.progresso.toString()) || 0
    };
    
    if (novoAluno) {
      setAlunos([...alunos, alunoCompleto]);
      setNovoAluno(false);
    } else {
      setAlunos(alunos.map(aluno =>
        aluno.id === alunoCompleto.id ? alunoCompleto : aluno
      ));
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

    setNovoAlunoErrors({
      nome: "",
      telefone: "",
      endereco: "",
      login: "",
      senha: ""
    });

    alert("Aluno salvo com sucesso!");
  };
  
  const cancelarEdicao = () => {
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
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAlunoEmEdicao({
      ...alunoEmEdicao,
      [name]: value
    });
  };
  
  const removerAluno = (id: number) => {
    setAlunos(alunos.filter(aluno => aluno.id !== id));
  };
  
  // Funções para gerenciar vídeos
  const adicionarVideo = () => {
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
  };
  
  const removerVideo = (id: number) => {
    setVideos(videos.filter(video => video.id !== id));
  };
  
  const toggleVideoLiberado = (id: number) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, liberado: !video.liberado } : video
    ));
  };
  
  // Função para abrir o modal de liberação de vídeos
  const abrirModalLiberarVideos = (aluno: any) => {
    // Carregar títulos personalizados do localStorage
    const savedVideoTitles = localStorage.getItem('videoTitles');
    let currentVideoTitles = {};
    if (savedVideoTitles) {
      try {
        currentVideoTitles = JSON.parse(savedVideoTitles);
        setVideoTitles(currentVideoTitles); // Atualiza o estado também
      } catch (error) {
        console.error('Erro ao carregar títulos personalizados:', error);
      }
    }
    
    // Carregar permissões de vídeos do localStorage para garantir que temos os dados mais recentes
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    if (savedVideosLiberados) {
      try {
        const videosLiberadosData = JSON.parse(savedVideosLiberados);
        // Atualiza o estado com os dados mais recentes
        setVideosLiberados(videosLiberadosData); 
        console.log('Permissões de vídeos carregadas do localStorage:', videosLiberadosData);
      } catch (error) {
        console.error('Erro ao carregar permissões de vídeos:', error);
      }
    } else {
      // Se não houver dados no localStorage, inicializar com um objeto vazio
      setVideosLiberados({});
    }

    // Usar flatMap para extrair todos os vídeos de todos os módulos importados (allModulesData)
    const allVideosFromModules = allModulesData.flatMap(module => 
      module.videos.map(video => ({
        id: video.id,
        // Usar título personalizado se existir, senão o título padrão do módulo
        titulo: (currentVideoTitles as {[key: number]: string})[video.id] || video.title, 
        modulo: module.title, // Usar o título do módulo diretamente
        duracao: video.duration,
      }))
    );
    
    // Log para verificar os vídeos carregados
    console.log("Vídeos carregados para o modal:", allVideosFromModules);
    console.log("Vídeos liberados para o aluno ID", aluno.id, ":", videosLiberados[aluno.id] || []);

    // Atualizar o estado que alimenta o modal
    setAllVideosForModal(allVideosFromModules);
    
    setAlunoSelecionado(aluno);
    setMostrarModalVideos(true);
  };
  
  // Função para fechar o modal de liberação de vídeos
  const fecharModalLiberarVideos = () => {
    // Garantir que as permissões de vídeos sejam salvas no localStorage antes de fechar o modal
    localStorage.setItem('videosLiberados', JSON.stringify(videosLiberados));
    console.log('Permissões de vídeos salvas ao fechar modal:', videosLiberados);
    
    setMostrarModalVideos(false);
    setAlunoSelecionado(null);
  };
  
  // Função para verificar se um vídeo está liberado para um aluno
  const isVideoLiberado = (alunoId: number, videoId: number) => {
    // Converter alunoId para string para garantir que a chave seja encontrada corretamente
    const alunoIdStr = alunoId.toString();
    
    // Verificar diretamente do localStorage para garantir dados atualizados
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
    
    // Se não houver dados no localStorage, verificar do estado
    return videosLiberados[alunoIdStr]?.includes(videoId) || false;
  };
  
  // Função para alternar a liberação de um vídeo para um aluno
  const toggleVideoLiberadoParaAluno = (alunoId: number, videoId: number) => {
    // Converter alunoId para string para garantir consistência no armazenamento
    const alunoIdStr = alunoId.toString();
    
    // Obter os dados mais recentes do localStorage
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    let currentVideosLiberados = {};
    
    if (savedVideosLiberados) {
      try {
        currentVideosLiberados = JSON.parse(savedVideosLiberados);
      } catch (error) {
        console.error('Erro ao carregar permissões de vídeos:', error);
      }
    }
    
    const alunoVideos = currentVideosLiberados[alunoIdStr] || [];
    
    // Verificar se o vídeo já está liberado
    const videoIndex = alunoVideos.indexOf(videoId);
    
    if (videoIndex === -1) {
      // Adicionar o vídeo à lista de liberados
      const novoEstado = {
        ...currentVideosLiberados,
        [alunoIdStr]: [...alunoVideos, videoId]
      };
      setVideosLiberados(novoEstado);
      localStorage.setItem('videosLiberados', JSON.stringify(novoEstado));
      console.log('Vídeo liberado:', videoId, 'para aluno:', alunoIdStr);
    } else {
      // Remover o vídeo da lista de liberados
      const novosVideos = [...alunoVideos];
      novosVideos.splice(videoIndex, 1);
      
      const novoEstado = {
        ...currentVideosLiberados,
        [alunoIdStr]: novosVideos
      };
      setVideosLiberados(novoEstado);
      localStorage.setItem('videosLiberados', JSON.stringify(novoEstado));
      console.log('Vídeo bloqueado:', videoId, 'para aluno:', alunoIdStr);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Não renderiza nada enquanto redireciona
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Barra superior */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.021A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Painel de Administração</h1>
        </div>
        <div className="flex space-x-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => router.push('/videos')}
          >
            Voltar para Vídeos
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => {
              localStorage.removeItem('isAdmin');
              router.push('/login');
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="container mx-auto p-6">
        {/* Tabs de navegação */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'alunos' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('alunos')}
          >
            Gerenciar Alunos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'videos' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('videos')}
          >
            Gerenciar Vídeos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'estatisticas' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('estatisticas')}
          >
            Estatísticas
          </button>
        </div>
        
        {/* Conteúdo da tab Alunos */}
        {activeTab === 'alunos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lista de Alunos</h2>
              <button 
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                onClick={adicionarAluno}
              >
                Adicionar Aluno
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Módulo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Progresso</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {alunos.map((aluno) => (
                    <React.Fragment key={aluno.id}>
                      <tr className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{aluno.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{aluno.modulo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-orange-600 h-2.5 rounded-full" 
                              style={{ width: `${aluno.progresso}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">{aluno.progresso}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-500 hover:text-blue-400 hover:bg-blue-900 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105 mr-3"
                            onClick={() => editarAluno(aluno.id)}
                          >
                            Editar
                          </button>
                          <button 
                            className="text-green-500 hover:text-green-400 hover:bg-green-900 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105 mr-3"
                            onClick={() => abrirModalLiberarVideos(aluno)}
                          >
                            Liberar Vídeo
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-400 hover:bg-red-900 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105"
                            onClick={() => removerAluno(aluno.id)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                      {/* Formulário de edição */}
                      {editandoAlunoId === aluno.id && (
                        <tr>
                          <td colSpan={5} className="px-0 py-0">
                            <div className="bg-gray-700 p-6 rounded-lg shadow-lg m-2">
                              <h3 className="text-xl font-medium mb-4">Editar Aluno: {aluno.nome}</h3>
                              {/* Formulário de edição aqui */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Campos do formulário */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                                  <input
                                    type="text"
                                    name="nome"
                                    value={alunoEmEdicao.nome}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                  <input
                                    type="email"
                                    name="email"
                                    value={alunoEmEdicao.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Módulo</label>
                                  <select
                                    name="modulo"
                                    value={alunoEmEdicao.modulo}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  >
                                    <option value="Módulo 1">Módulo 1</option>
                                    <option value="Módulo 2">Módulo 2</option>
                                    <option value="Módulo 3">Módulo 3</option>
                                    <option value="Módulo 4">Módulo 4</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Progresso (%)</label>
                                  <input
                                    type="number"
                                    name="progresso"
                                    min="0"
                                    max="100"
                                    value={alunoEmEdicao.progresso}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Endereço</label>
                                  <input
                                    type="text"
                                    name="endereco"
                                    value={alunoEmEdicao.endereco}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                                  <input
                                    type="tel"
                                    name="telefone"
                                    value={alunoEmEdicao.telefone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Nascimento</label>
                                  <input
                                    type="date"
                                    name="dataNascimento"
                                    value={alunoEmEdicao.dataNascimento}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Pai/Mãe</label>
                                  <input
                                    type="text"
                                    name="nomePaiMae"
                                    value={alunoEmEdicao.nomePaiMae}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone do Responsável</label>
                                  <input
                                    type="tel"
                                    name="telefoneResponsavel"
                                    value={alunoEmEdicao.telefoneResponsavel}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Início do Curso</label>
                                  <input
                                    type="date"
                                    name="dataInicioCurso"
                                    value={alunoEmEdicao.dataInicioCurso}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                {/* Outros campos do formulário */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Login</label>
                                  <input
                                    type="text"
                                    name="login"
                                    value={alunoEmEdicao.login}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
                                  <div className="relative">
                                    <input
                                      type={showPassword ? "text" : "password"}
                                      name="senha"
                                      value={alunoEmEdicao.senha}
                                      onChange={handleInputChange}
                                      className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end space-x-3">
                                <button
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                  onClick={cancelarEdicao}
                                >
                                  Cancelar
                                </button>
                                <button
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                  onClick={salvarAluno}
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Formulário para adicionar novo aluno */}
            {novoAluno && (
              <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-4">Adicionar Novo Aluno</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nome"
                        value={alunoEmEdicao.nome}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border ${novoAlunoErrors.nome ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {novoAlunoErrors.nome && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{novoAlunoErrors.nome}</span>
                      )}
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={alunoEmEdicao.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
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
                      <option value="Módulo 1">Módulo 1</option>
                      <option value="Módulo 2">Módulo 2</option>
                      <option value="Módulo 3">Módulo 3</option>
                      <option value="Módulo 4">Módulo 4</option>
                    </select>
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
                        className={`w-full bg-gray-700 border ${novoAlunoErrors.endereco ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {novoAlunoErrors.endereco && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{novoAlunoErrors.endereco}</span>
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
                        className={`w-full bg-gray-700 border ${novoAlunoErrors.telefone ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {novoAlunoErrors.telefone && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{novoAlunoErrors.telefone}</span>
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
                        className={`w-full bg-gray-700 border ${novoAlunoErrors.login ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                      {novoAlunoErrors.login && (
                        <span className="text-red-500 text-xs absolute right-2 top-1/2 -translate-y-1/2">{novoAlunoErrors.login}</span>
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
                        className={`w-full bg-gray-700 border ${novoAlunoErrors.senha ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
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
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                    onClick={cancelarEdicao}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
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
                        <button 
                          className={`${video.liberado ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'} mr-3`}
                          onClick={() => toggleVideoLiberado(video.id)}
                        >
                          {video.liberado ? 'Bloquear' : 'Liberar'}
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-400"
                          onClick={() => removerVideo(video.id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Conteúdo da tab Estatísticas */}
        {activeTab === 'estatisticas' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Total de Alunos</h3>
                <p className="text-4xl font-bold text-orange-500">{alunos.length}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Total de Vídeos</h3>
                <p className="text-4xl font-bold text-orange-500">{videos.length}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-medium mb-2">Vídeos Liberados</h3>
                <p className="text-4xl font-bold text-orange-500">{videos.filter(v => v.liberado).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Liberação de Vídeos */}
      {mostrarModalVideos && alunoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
              {/* Agrupar vídeos por módulo usando allVideosForModal */}
              {Object.entries(allVideosForModal.reduce((acc, video) => {
                const modulo = video.modulo || 'Sem Módulo';
                if (!acc[modulo]) {
                  acc[modulo] = [];
                }
                acc[modulo].push(video);
                return acc;
              }, {} as { [key: string]: any[] })).sort(([modA], [modB]) => {
                  // Extrair números dos títulos dos módulos para ordenação correta
                  const numA = parseInt(modA.match(/\d+/)?.[0] || '0');
                  const numB = parseInt(modB.match(/\d+/)?.[0] || '0');
                  return numA - numB;
              }).map(([modulo, videosDoModulo]) => {
                if (videosDoModulo.length === 0) return null;
                
                return (
                  <div key={modulo} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">{modulo}</h3>
                    <div className="space-y-2">
                      {videosDoModulo.map((video) => (
                        <div key={video.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                          <div className="flex-1">
                            {/* O título já considera a personalização ao ser carregado em allVideosForModal */}
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
