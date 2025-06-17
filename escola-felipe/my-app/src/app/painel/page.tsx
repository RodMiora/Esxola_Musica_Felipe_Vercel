'use client';

import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

// Interfaces
interface Video {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  level: string;
}

interface Module {
  id: number;
  title: string;
  videos: Video[];
}

interface Aluno {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  dataNascimento: string;
  nomePaiMae: string;
  dataInicioCurso: string;
  telefoneResponsavel: string;
  login: string;
  senha: string;
  modulo: number;
  progresso: number;
  videosLiberados: number[];
}

interface NotificacaoState {
  tipo: 'success' | 'error' | 'info' | 'warning';
  mensagem: string;
  visivel: boolean;
}

interface ConfirmacaoState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirm: () => void;
}

// Dados de exemplo para módulos
const modulesData: Module[] = [
  {
    id: 1,
    title: "Módulo 1: Começando do Zero!",
    videos: [
      { id: 1, title: "Partes do violão", duration: "12:30", thumbnail: "", level: "Básico" },
      { id: 2, title: "Tipos de violão", duration: "10:15", thumbnail: "", level: "Básico" },
      { id: 3, title: "Afinação básica", duration: "15:45", thumbnail: "", level: "Básico" },
      { id: 4, title: "Cuidados com o instrumento", duration: "8:50", thumbnail: "", level: "Básico" },
      { id: 5, title: "História do violão", duration: "14:20", thumbnail: "", level: "Básico" }
    ]
  },
  {
    id: 2,
    title: "Módulo 2: Primeiros Acordes",
    videos: [
      { id: 6, title: "Postura e posição das mãos", duration: "18:30", thumbnail: "", level: "Intermediário" },
      { id: 7, title: "Acordes maiores básicos", duration: "22:15", thumbnail: "", level: "Intermediário" },
      { id: 8, title: "Acordes menores básicos", duration: "20:45", thumbnail: "", level: "Intermediário" }
    ]
  },
  {
    id: 3,
    title: "Módulo 3: Técnicas Avançadas",
    videos: [
      { id: 9, title: "Pestanas", duration: "25:30", thumbnail: "", level: "Avançado" },
      { id: 10, title: "Fingerstyle básico", duration: "28:15", thumbnail: "", level: "Avançado" }
    ]
  }
];

// Dados de exemplo para alunos
const alunosIniciais: Aluno[] = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@exemplo.com",
    telefone: "(11) 99999-9999",
    endereco: "Rua das Flores, 123",
    dataNascimento: "15/03/1990",
    nomePaiMae: "Maria Silva",
    dataInicioCurso: "13/06/2025",
    telefoneResponsavel: "(11) 88888-8888",
    login: "joao.silva",
    senha: "123456",
    modulo: 1,
    progresso: 60,
    videosLiberados: [1, 2, 3]
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria@exemplo.com",
    telefone: "(11) 77777-7777",
    endereco: "Av. Principal, 456",
    dataNascimento: "22/08/1985",
    nomePaiMae: "José Oliveira",
    dataInicioCurso: "13/06/2025",
    telefoneResponsavel: "(11) 66666-6666",
    login: "maria.oliveira",
    senha: "654321",
    modulo: 2,
    progresso: 45,
    videosLiberados: [1, 2, 6]
  },
  {
    id: 3,
    nome: "Pedro Santos",
    email: "pedro@exemplo.com",
    telefone: "(11) 55555-5555",
    endereco: "Rua da Música, 789",
    dataNascimento: "10/12/1992",
    nomePaiMae: "Ana Santos",
    dataInicioCurso: "13/06/2025",
    telefoneResponsavel: "(11) 44444-4444",
    login: "pedro.santos",
    senha: "789123",
    modulo: 1,
    progresso: 30,
    videosLiberados: [1, 2]
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana@exemplo.com",
    telefone: "(11) 33333-3333",
    endereco: "Praça Central, 321",
    dataNascimento: "05/07/1988",
    nomePaiMae: "Carlos Costa",
    dataInicioCurso: "13/06/2025",
    telefoneResponsavel: "(11) 22222-2222",
    login: "ana.costa",
    senha: "456789",
    modulo: 3,
    progresso: 75,
    videosLiberados: [1, 2, 3, 6, 7, 9]
  },
  {
    id: 5,
    nome: "Lucas Ferreira",
    email: "lucas@exemplo.com",
    telefone: "(11) 11111-1111",
    endereco: "Rua Harmonia, 654",
    dataNascimento: "18/04/1991",
    nomePaiMae: "Lucia Ferreira",
    dataInicioCurso: "13/06/2025",
    telefoneResponsavel: "(11) 99999-0000",
    login: "lucas.ferreira",
    senha: "147258",
    modulo: 2,
    progresso: 50,
    videosLiberados: [1, 2, 3, 6]
  }
];

const alunoVazio: Aluno = {
  id: 0,
  nome: '',
  email: '',
  telefone: '',
  endereco: '',
  dataNascimento: '',
  nomePaiMae: '',
  dataInicioCurso: new Date().toLocaleDateString('pt-BR'),
  telefoneResponsavel: '',
  login: '',
  senha: '',
  modulo: 1,
  progresso: 0,
  videosLiberados: []
};

export default function PainelPage() {
  const router = useRouter();
  
  
  const [videosLiberados, setVideosLiberados] = useState<{[key: number]: number[]}>({});

  // Estados principais
  const [alunos, setAlunos] = useState<Aluno[]>(alunosIniciais);
  const [abaAtiva, setAbaAtiva] = useState<'alunos' | 'videos' | 'estatisticas'>('alunos');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalLiberarVideosAberto, setModalLiberarVideosAberto] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno>(alunoVazio);
  const [alunoSelecionadoVideos, setAlunoSelecionadoVideos] = useState<Aluno | null>(null);
  
  // Estados de filtro e busca
  const [filtroAluno, setFiltroAluno] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  
  // Estados de notificação e confirmação
  const [notificacao, setNotificacao] = useState<NotificacaoState>({
    tipo: 'info',
    mensagem: '',
    visivel: false
  });
  
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    visivel: false,
    titulo: '',
    mensagem: '',
    onConfirm: () => {}
  });

// Função para remover vídeo com confirmação
const removerVideoComConfirmacao = (videoId: string) => {
  if (confirm('Tem certeza que deseja remover este vídeo do aluno?')) {
    if (alunoSelecionadoVideos) {
      setVideosLiberados(prev => ({
        ...prev,
        [alunoSelecionadoVideos.id]: prev[alunoSelecionadoVideos.id]?.filter(id => id !== parseInt(videoId)) || []
      }));
    }
  }
};

// Função para abrir modal de vídeos
const abrirModalVideos = (aluno: Aluno) => {
  setAlunoSelecionadoVideos(aluno);
  setModalLiberarVideosAberto(true);
};

  // Funções de notificação
  const mostrarNotificacao = useCallback((tipo: NotificacaoState['tipo'], mensagem: string) => {
    setNotificacao({ tipo, mensagem, visivel: true });
    setTimeout(() => {
      setNotificacao(prev => ({ ...prev, visivel: false }));
    }, 3000);
  }, []);

  const mostrarConfirmacao = useCallback((titulo: string, mensagem: string, onConfirm: () => void) => {
    setConfirmacao({ visivel: true, titulo, mensagem, onConfirm });
  }, []);

  const fecharConfirmacao = useCallback(() => {
    setConfirmacao(prev => ({ ...prev, visivel: false }));
  }, []);

  // Funções de manipulação de alunos
  const adicionarAluno = useCallback((aluno: Omit<Aluno, 'id'>) => {
    const novoId = Math.max(...alunos.map(a => a.id), 0) + 1;
    const novoAluno: Aluno = { ...aluno, id: novoId };
    setAlunos(prev => [...prev, novoAluno]);
    mostrarNotificacao('success', 'Aluno adicionado com sucesso!');
    setModalAberto(false);
    setAlunoEmEdicao(alunoVazio);
  }, [alunos, mostrarNotificacao]);

  const atualizarAluno = useCallback((alunoAtualizado: Aluno) => {
    setAlunos(prev => prev.map(aluno => 
      aluno.id === alunoAtualizado.id ? alunoAtualizado : aluno
    ));
    mostrarNotificacao('success', 'Aluno atualizado com sucesso!');
    setModalEdicaoAberto(false);
    setAlunoEmEdicao(alunoVazio);
  }, [mostrarNotificacao]);

  const removerAluno = useCallback((id: number) => {
    setAlunos(prev => prev.filter(aluno => aluno.id !== id));
  }, []);

  const handleRemoverAluno = useCallback((id: number) => {
    mostrarConfirmacao(
      "Remover Aluno", 
      "Tem certeza de que deseja remover este aluno?", 
      () => {
        removerAluno(id);
        mostrarNotificacao('success', 'Aluno removido com sucesso!');
        fecharConfirmacao();
      }
    );
  }, [removerAluno, mostrarNotificacao, mostrarConfirmacao, fecharConfirmacao]);

  // Funções de modal
  const abrirModalAdicionar = useCallback(() => {
    setAlunoEmEdicao(alunoVazio);
    setModalAberto(true);
  }, []);

  const abrirModalEditar = useCallback((aluno: Aluno) => {
    setAlunoEmEdicao(aluno);
    setModalEdicaoAberto(true);
  }, []);

  const abrirModalLiberarVideos = useCallback((aluno: Aluno) => {
    setAlunoSelecionadoVideos(aluno);
    setModalLiberarVideosAberto(true);
  }, []);

  const fecharModais = useCallback(() => {
    setModalAberto(false);
    setModalEdicaoAberto(false);
    setModalLiberarVideosAberto(false);
    setAlunoEmEdicao(alunoVazio);
    setAlunoSelecionadoVideos(null);
  }, []);

  // Função para liberar/bloquear vídeo individual
  const toggleVideoLiberado = useCallback((videoId: number) => {
    if (!alunoSelecionadoVideos) return;
    
    const videosLiberados = [...alunoSelecionadoVideos.videosLiberados];
    const index = videosLiberados.indexOf(videoId);
    
    if (index > -1) {
      videosLiberados.splice(index, 1);
    } else {
      videosLiberados.push(videoId);
    }
    
    const alunoAtualizado = { ...alunoSelecionadoVideos, videosLiberados };
    setAlunoSelecionadoVideos(alunoAtualizado);
    
    setAlunos(prev => prev.map(aluno => 
      aluno.id === alunoAtualizado.id ? alunoAtualizado : aluno
    ));
    
    mostrarNotificacao('success', 'Status do vídeo atualizado!');
  }, [alunoSelecionadoVideos, mostrarNotificacao]);

  // Filtros
  const alunosFiltrados = useMemo<Aluno[]>(() => {
    return alunos.filter((aluno) => {
      const matchNome = aluno.nome.toLowerCase().includes(filtroAluno.toLowerCase());
      const matchModulo = filtroModulo === 'todos' || aluno.modulo.toString() === filtroModulo;
      return matchNome && matchModulo;
    });
  }, [alunos, filtroAluno, filtroModulo]);

  // Função para obter nome do módulo
  const obterNomeModulo = useCallback((moduloId: number) => {
    const modulo = modulesData.find(m => m.id === moduloId);
    return modulo ? modulo.title : `Módulo ${moduloId}`;
  }, []);

  // Handlers de formulário
  const handleSubmitAdicionar = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoEmEdicao.nome || !alunoEmEdicao.telefone || !alunoEmEdicao.endereco || !alunoEmEdicao.senha) {
      mostrarNotificacao('error', 'Preencha todos os campos obrigatórios!');
      return;
    }
    adicionarAluno(alunoEmEdicao);
  }, [alunoEmEdicao, adicionarAluno, mostrarNotificacao]);

  const handleSubmitEditar = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoEmEdicao.nome || !alunoEmEdicao.telefone || !alunoEmEdicao.endereco || !alunoEmEdicao.senha) {
      mostrarNotificacao('error', 'Preencha todos os campos obrigatórios!');
      return;
    }
    atualizarAluno(alunoEmEdicao);
  }, [alunoEmEdicao, atualizarAluno, mostrarNotificacao]);

  const handleInputChange = useCallback((field: keyof Aluno, value: string | number) => {
    setAlunoEmEdicao(prev => ({ ...prev, [field]: value }));
  }, []);

  // Navegação
  const voltarParaVideos = useCallback(() => {
    router.push('/videos');
  }, [router]);

  const sair = useCallback(() => {
    mostrarConfirmacao(
      "Sair do Sistema",
      "Tem certeza de que deseja sair?",
      () => {
        router.push('/login');
      }
    );
  }, [router, mostrarConfirmacao]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">Painel de Administração</h1>
          <div className="flex gap-4">
            <button
              onClick={voltarParaVideos}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Voltar para Vídeos
            </button>
            <button
              onClick={sair}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {/* Navegação */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva('alunos')}
              className={`py-4 px-2 font-medium text-sm transition-colors ${
                abaAtiva === 'alunos'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Gerenciar Alunos
            </button>
            <button
              onClick={() => setAbaAtiva('videos')}
              className={`py-4 px-2 font-medium text-sm transition-colors ${
                abaAtiva === 'videos'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Gerenciar Vídeos
            </button>
            <button
              onClick={() => setAbaAtiva('estatisticas')}
              className={`py-4 px-2 font-medium text-sm transition-colors ${
                abaAtiva === 'estatisticas'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Estatísticas
            </button>
          </div>
        </div>
      </nav>
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto p-6">
        {abaAtiva === 'alunos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Lista de Alunos</h2>
              <button
                onClick={abrirModalAdicionar}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors font-medium"
              >
                Adicionar Aluno
              </button>
            </div>
            {/* Filtros */}
            <div className="mb-6 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtroAluno}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltroAluno(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 flex-1 max-w-md"
              />
              <select
                value={filtroModulo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltroModulo(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="todos">Todos os módulos</option>
                {modulesData.map((modulo) => (
                  <option key={modulo.id} value={modulo.id.toString()}>
                    {modulo.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Tabela de Alunos */}
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="text-left p-4 font-medium">ID</th>
                    <th className="text-left p-4 font-medium">NOME</th>
                    <th className="text-left p-4 font-medium">MÓDULO</th>
                    <th className="text-left p-4 font-medium">PROGRESSO</th>
                    <th className="text-left p-4 font-medium">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosFiltrados.length > 0 ? (
                    alunosFiltrados.map((aluno) => (
                      <tr key={aluno.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-4">{aluno.id}</td>
                        <td className="p-4">{aluno.nome}</td>
                        <td className="p-4">{obterNomeModulo(aluno.modulo)}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-600 rounded-full h-2 mr-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${aluno.progresso}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{aluno.progresso}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirModalEditar(aluno)}
                              className="text-blue-400 hover:text-blue-300 font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => abrirModalLiberarVideos(aluno)}
                              className="text-green-400 hover:text-green-300 font-medium"
                            >
                              Liberar Vídeo
                            </button>
                            <button
                              onClick={() => handleRemoverAluno(aluno.id)}
                              className="text-red-400 hover:text-red-300 font-medium"
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        Nenhum aluno encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {abaAtiva === 'videos' && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Gerenciar Vídeos</h2>
            <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          </div>
        )}
        {abaAtiva === 'estatisticas' && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
            <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          </div>
        )}
      </main>
      {/* Modal Adicionar Aluno */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Adicionar Novo Aluno</h3>
            <form onSubmit={handleSubmitAdicionar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={alunoEmEdicao.nome}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('nome', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Módulo</label>
                  <select
                    value={alunoEmEdicao.modulo}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('modulo', parseInt(e.target.value))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    {modulesData.map((modulo) => (
                      <option key={modulo.id} value={modulo.id}>
                        {modulo.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={alunoEmEdicao.telefone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('telefone', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={alunoEmEdicao.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Endereço <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={alunoEmEdicao.endereco}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('endereco', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                  <input
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={alunoEmEdicao.dataNascimento}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('dataNascimento', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Pai/Mãe</label>
                  <input
                    type="text"
                    value={alunoEmEdicao.nomePaiMae}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('nomePaiMae', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Início do Curso</label>
                  <input
                    type="text"
                    value={alunoEmEdicao.dataInicioCurso}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('dataInicioCurso', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone do Responsável</label>
                  <input
                    type="text"
                    value={alunoEmEdicao.telefoneResponsavel}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('telefoneResponsavel', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Login</label>
                  <input
                    type="text"
                    value={alunoEmEdicao.login}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('login', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={alunoEmEdicao.senha}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('senha', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Liberar Vídeos */}
      {modalLiberarVideosAberto && alunoSelecionadoVideos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Liberar Vídeos para {alunoSelecionadoVideos.nome}
            </h2>
  
            <div className="space-y-6">
              {modulesData.map((modulo: { id: number; title: string; videos: { id: number; title: string; duration: string; thumbnail?: string; level: string; }[] }) => (
                <div key={modulo.id} className="border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">
                    {modulo.title}
                  </h3>
  
                  <div className="space-y-3">
                    {modulo.videos.map((video: { id: number; title: string; duration: string; thumbnail?: string; level: string; }) => (
                      <div key={video.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          {/* Checkbox Personalizado */}
                          <div
                            onClick={() => {
                              const videoId = video.id;
                              const alunoId = alunoSelecionadoVideos.id;
                              const isChecked = videosLiberados[alunoId]?.includes(videoId) || false;
  
                              setVideosLiberados(prev => {
                                const videosDoAluno = prev[alunoId] || [];
  
                                if (!isChecked) {
                                  return {
                                    ...prev,
                                    [alunoId]: [...videosDoAluno, videoId]
                                  };
                                } else {
                                  return {
                                    ...prev,
                                    [alunoId]: videosDoAluno.filter(id => id !== videoId)
                                  };
                                }
                              });
                            }}
                            className={`w-4 h-4 border-2 rounded cursor-pointer flex items-center justify-center ${
                              videosLiberados[alunoSelecionadoVideos.id]?.includes(video.id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-400'
                            }`}
                          >
                            {videosLiberados[alunoSelecionadoVideos.id]?.includes(video.id) && (
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
                        {/* Nível, Status e Botão Remover */}
                        <div className="flex items-center space-x-2">
                          {/* Badge de Nível */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            video.level === 'Básico' ? 'bg-blue-600 text-white' :
                            video.level === 'Intermediário' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {video.level}
                          </span>
                          {/* Badge de Status */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            videosLiberados[alunoSelecionadoVideos.id]?.includes(video.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}>
                            {videosLiberados[alunoSelecionadoVideos.id]?.includes(video.id) ? 'Liberado' : 'Bloqueado'}
                          </span>
                          {/* Botão Remover (do seu código original) */}
                          <button
                            onClick={() => removerVideoComConfirmacao(video.id.toString())}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
  
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setModalLiberarVideosAberto(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  // A lógica de atualização do estado videosLiberados já acontece no clique do checkbox.
                  // O botão Salvar apenas fecha o modal e mostra a notificação.
                  // Se você precisa persistir esses dados (salvar no backend, local storage, etc.),
                  // a chamada para essa função de persistência deve ser adicionada aqui.
                  mostrarNotificacao('success', `Permissões de vídeos atualizadas para ${alunoSelecionadoVideos?.nome || 'aluno'}!`);
                  setModalLiberarVideosAberto(false);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Salvar
              </button>
            </div>
          </div> {/* Fecha a div bg-gray-800 do modal */}
        </div>
      )} {/* Fecha a renderização condicional do modal */}
    </div>
  );
}
