"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import './animations.css'; // Import the animations CSS file

// Carregue o Equalizer apenas no lado do cliente
const Equalizer = dynamic(
  () => import('@/components/Equalizer'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-800 animate-pulse rounded-lg" />
  }
);

// Componente personalizado para o ícone do YouTube
const YouTubeIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);

// Módulos de violão organizados sequencialmente - definidos fora do componente
const initialModules = [
  {
    id: 1,
    title: 'Módulo 1: Começando do Zero!',
    videos: [
      {
        id: 101,
        thumbnail: '/imagens/Sem_titulo.jpg',
      },
      {
        id: 102,
        thumbnail: '/imagens/Postura.jpg',
      },
      {
        id: 103,
        thumbnail: '/imagens/afinando.png',
        level: 'iniciante'
      },
      {
        id: 104,
        thumbnail: '/imagens/diagrama.png',
        level: 'iniciante'
      },
      {
        id: 105,
        thumbnail: '/imagens/Sem_titulo.jpg',
        level: 'iniciante'
      },
      {
        id: 106,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,buying',
        level: 'iniciante'
      },
      {
        id: 107,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,accessories',
        level: 'iniciante'
      }
    ]
  },
  {
    id: 2,
    title: 'Módulo 2: Posicionando as Mãos e Postura',
    videos: [
      {
        id: 201,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,posture',
        level: 'iniciante'
      },
      {
        id: 202,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,hand',
        level: 'iniciante'
      },
      {
        id: 203,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chord',
        level: 'iniciante'
      },
      {
        id: 204,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,practice',
        level: 'iniciante'
      },
      {
        id: 205,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,health',
        level: 'iniciante'
      },
      {
        id: 206,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,relax',
        level: 'iniciante'
      },
      {
        id: 207,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingers',
        level: 'iniciante-intermediario'
      },
      {
        id: 208,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,strength',
        level: 'iniciante-intermediario'
      }
    ]
  },
  {
    id: 3,
    title: 'Módulo 3: Primeiros Acordes',
    videos: [
      {
        id: 301,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chords',
        level: 'iniciante'
      },
      {
        id: 302,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,minor',
        level: 'iniciante'
      },
      {
        id: 303,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,transition',
        level: 'iniciante-intermediario'
      },
      {
        id: 304,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,song',
        level: 'iniciante-intermediario'
      },
      {
        id: 305,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,seventh',
        level: 'intermediario'
      },
      {
        id: 306,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,suspended',
        level: 'intermediario'
      },
      {
        id: 307,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,progression',
        level: 'iniciante-intermediario'
      },
      {
        id: 308,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,harmony',
        level: 'intermediario'
      },
      {
        id: 309,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,barre',
        level: 'intermediario'
      }
    ]
  },
  {
    id: 4,
    title: 'Módulo 4: Técnicas de Ritmo',
    videos: [
      {
        id: 401,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,strumming',
        level: 'iniciante'
      },
      {
        id: 402,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,rhythm',
        level: 'iniciante-intermediario'
      },
      {
        id: 403,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,pick',
        level: 'iniciante'
      },
      {
        id: 404,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingerpicking',
        level: 'iniciante-intermediario'
      },
      {
        id: 405,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,latin',
        level: 'intermediario'
      },
      {
        id: 406,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,percussion',
        level: 'intermediario'
      }
    ]
  }
];

export default function VideosPage() {
  const router = useRouter();
  const carouselRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [videosLiberados, setVideosLiberados] = useState<{[key: string]: number[]}>({});
  
  // Adicionar estados para controlar a visibilidade das setas
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<{[key: number]: boolean}>({});
  const [showRightArrow, setShowRightArrow] = useState<{[key: number]: boolean}>({});
  
  // Adicionar estados para o modal de YouTube e links
  const [mostrarModalYoutube, setMostrarModalYoutube] = useState(false);
  const [videoSelecionado, setVideoSelecionado] = useState<any>(null);
  const [youtubeLinks, setYoutubeLinks] = useState<{[key: number]: string}>({});
  
  // Estado para armazenar os módulos - inicializado com initialModules
  const [modulesList, setModulesList] = useState<typeof initialModules>(initialModules);
  
  // Valores fixos para o equalizador inicial (evita problemas de hidratação)
  const staticBars = [0.6, 0.8, 0.7, 0.9, 0.6];
  const [miniBars, setMiniBars] = useState<number[]>(staticBars);
  
  // Verificar se o usuário é administrador e carregar links do YouTube
  useEffect(() => {
    // Em um ambiente real, isso seria feito com um token JWT ou similar
    // Aqui estamos simulando com localStorage
    const checkAdmin = () => {
      const username = localStorage.getItem('username');
      const isAdminUser = username === 'administrador';
      setIsAdmin(isAdminUser);
      setCurrentUser(username);
      
      // Buscar o ID do usuário atual para verificar permissões de vídeo
      if (username && username !== 'administrador') {
        const savedAlunos = localStorage.getItem('alunos');
        if (savedAlunos) {
          const alunos = JSON.parse(savedAlunos);
          const currentUserData = alunos.find((a: any) => a.login === username);
          if (currentUserData) {
            setCurrentUserId(currentUserData.id);
            // Atualizar o currentUser para mostrar o nome do aluno em vez do login
            setCurrentUser(currentUserData.nome);
          }
        }
      }
    };
    
    checkAdmin();
    
    // Carregar permissões de vídeos
    const savedVideosLiberados = localStorage.getItem('videosLiberados');
    if (savedVideosLiberados) {
      setVideosLiberados(JSON.parse(savedVideosLiberados));
    }
    
    // Carregar links do YouTube salvos
    const savedLinks = localStorage.getItem('youtubeLinks');
    if (savedLinks) {
      setYoutubeLinks(JSON.parse(savedLinks));
    }
  }, []);
  
  // Ativar animação apenas no cliente após montagem
  useEffect(() => {
    setIsMounted(true);
    // Iniciar animação apenas no cliente
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        setMiniBars(prev => prev.map(() =>
          Math.abs(Math.sin(Date.now() / 100 + Math.random() * 10)) * 0.8 + 0.2
        ));
      }, 150);
      return () => clearInterval(interval);
    }
  }, []);
  
  // Função para rolar o carrossel
  const scrollCarousel = (moduleId: number, direction: 'left' | 'right') => {
    const carouselRef = carouselRefs.current[moduleId];
    if (carouselRef) {
      const scrollAmount = 280; // Ajustado para o novo tamanho dos cards (260px + margem)
      const currentScroll = carouselRef.scrollLeft;
      carouselRef.scrollTo({
        left: direction === 'right'
          ? currentScroll + scrollAmount
          : currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // FUNÇÕES DE MANIPULAÇÃO DO MOUSE
  const handleMouseMove = (moduleId: number, event: React.MouseEvent<HTMLDivElement>) => {
    const carouselRef = carouselRefs.current[moduleId];
    if (!carouselRef) return;
    
    const container = event.currentTarget;
    const mouseX = event.clientX - container.getBoundingClientRect().left;
    const containerWidth = container.offsetWidth;
    
    const hasMoreRight = carouselRef.scrollWidth > carouselRef.offsetWidth + carouselRef.scrollLeft;
    const hasMoreLeft = carouselRef.scrollLeft > 0;
    
    setShowRightArrow(prev => ({
      ...prev,
      [moduleId]: mouseX > containerWidth - 100 && hasMoreRight
    }));
    
    setShowLeftArrow(prev => ({
      ...prev,
      [moduleId]: mouseX < 100 && hasMoreLeft
    }));
  };
  
  const handleMouseLeave = (moduleId: number) => {
    setShowLeftArrow(prev => ({...prev, [moduleId]: false}));
    setShowRightArrow(prev => ({...prev, [moduleId]: false}));
  };
  
  // Função para abrir o modal de adicionar link do YouTube
  const abrirModalYoutube = (e: React.MouseEvent, video: any) => {
    e.stopPropagation(); // Impedir que o clique propague para o card do vídeo
    setVideoSelecionado({
      ...video,
      youtubeLink: youtubeLinks[video.id] || ''
    });
    setMostrarModalYoutube(true);
  };
  
  // Função para salvar o link do YouTube
  const salvarLinkYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoSelecionado && videoSelecionado.youtubeLink) {
      const novosLinks = {
        ...youtubeLinks,
        [videoSelecionado.id]: videoSelecionado.youtubeLink
      };
      setYoutubeLinks(novosLinks);
      localStorage.setItem('youtubeLinks', JSON.stringify(novosLinks));
      setMostrarModalYoutube(false);
    }
  };
  
  // Função para abrir o vídeo do YouTube
  const abrirVideoYoutube = (videoId: number) => {
    // Verificar se o vídeo está liberado para o usuário atual
    if (!isVideoLiberadoParaUsuario(videoId) && !isAdmin) {
      alert('Este vídeo não está liberado para você.');
      return;
    }
    
    const link = youtubeLinks[videoId];
    if (link) {
      window.open(link, '_blank');
    }
  };
  
  // Função para verificar se um vídeo está liberado para o usuário atual
  const isVideoLiberadoParaUsuario = (videoId: number) => {
    // Administrador tem acesso a todos os vídeos
    if (isAdmin) return true;
    
    // Verificar se o usuário atual tem permissão para este vídeo
    if (currentUserId) {
      const userIdStr = currentUserId.toString();
      return videosLiberados[userIdStr]?.includes(videoId) || false;
    }
    return false;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Estilos CSS para o mini equalizador */}
      <style jsx>{`
        @keyframes bar1 {
          0%, 100% { height: 6px; background-color: #FF5722; }
          50% { height: 10px; background-color: #FF8A65; }
        }
        @keyframes bar2 {
          0%, 100% { height: 9px; background-color: #FF8A65; }
          50% { height: 5px; background-color: #FF5722; }
        }
        @keyframes bar3 {
          0%, 100% { height: 12px; background-color: #FF5722; }
          33% { height: 16px; background-color: #FF8A65; }
          66% { height: 8px; background-color: #E64A19; }
        }
        .equalizer-bar1 {
          width: 2px;
          height: 6px;
          animation: bar1 1.2s ease-in-out infinite;
        }
        .equalizer-bar2 {
          width: 2px;
          height: 9px;
          animation: bar2 0.8s ease-in-out infinite;
        }
        .equalizer-bar3 {
          width: 2px;
          height: 12px;
          animation: bar3 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed top-0 left-0 w-full bg-gray-800 text-gray-100 p-2 flex justify-between items-center z-50">
        {/* ESQUERDA - Equalizer + Nome */}
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 flex items-center justify-center">
            <div className="flex items-end space-x-[1px]">
              {staticBars.map((height, index) => (
                <div
                  key={index}
                  className="w-[5px] bg-gradient-to-t from-orange-500 to-green-500 transition-all duration-300 ease-out"
                  style={{ height: `${isMounted ? miniBars[index] : height}rem` }}
                />
              ))}
            </div>
          </div>
          <span className="font-bold text-sm">Escola de Música Coutinho</span>
        </div>
        {/* CENTRO - Bem-vindo */}
        {!isAdmin && currentUser && (
          <div className="text-orange-400 font-semibold text-2xl">
            Bem vindo {currentUser}
          </div>
        )}
        {/* DIREITA - Painel (se admin) + Sair */}
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-base font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
              onClick={() => router.push('/painel')}
            >
              Painel de Administração
            </button>
          )}
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-base font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
            onClick={() => window.location.href = 'http://localhost:3000/login'}
          >
            SAIR
          </button>
        </div>
      </div>
      {/* Frase motivacional centralizada acima dos vídeos */}
      <div className="mt-24 mb-4 flex justify-center">
        <div
          className="text-white font-bold"
          style={{
            fontSize: '28px',
            textShadow: '0 0 10px rgba(255,255,255,0.7)',
            letterSpacing: '0.7px',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}
        >
          "A Repetição leva à Perfeição"
        </div>
      </div>
      {/* Cabeçalho */}
      <div className="pb-4 flex flex-col items-center">
        <Equalizer />
      </div>
      {/* Módulos com vídeos em carrossel horizontal */}
      <div className="px-4 pb-12 w-full max-w-6xl mx-auto space-y-12">
        {modulesList.map((module) => (
          <div key={module.id} className="space-y-4">
            {/* Título do módulo */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{module.title}</h2>
            </div>
            {/* Carrossel de vídeos */}
            <div
              className="relative overflow-hidden"
              onMouseMove={(e) => handleMouseMove(module.id, e)}
              onMouseLeave={() => handleMouseLeave(module.id)}
            >
              {/* Seta de navegação esquerda */}
              {showLeftArrow[module.id] && (
                <button
                  onClick={() => scrollCarousel(module.id, 'left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-orange-800 bg-opacity-70 text-white p-3 rounded-r-full z-10 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Seta de navegação direita */}
              {showRightArrow[module.id] && (
                <button
                  onClick={() => scrollCarousel(module.id, 'right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-orange-800 bg-opacity-70 text-white p-3 rounded-l-full z-10 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {/* Carrossel de vídeos com altura mínima para acomodar os cards */}
              <div
                ref={(el: HTMLDivElement | null) => {
                  carouselRefs.current[module.id] = el;
                }}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  minHeight: '460px'  // Adicionando altura mínima para acomodar os cards
                }}
              >
                {module.videos.map((video) => (
                  // Card de vídeo com ícone de cadeado ao passar o mouse
                  <div
                    key={video.id}
                    className="relative"
                    style={{ 
                      width: '260px', 
                      height: '440px',
                      flexShrink: 0,
                      margin: '0 8px'
                    }}
                  >
                    {/* Imagem de thumbnail sempre visível */}
                    <img
                      src={video.thumbnail}
                      alt="Thumbnail do vídeo"
                      className="rounded-lg cursor-pointer shadow-lg border border-gray-700 hover:border-orange-500 transition-colors"
                      style={{ 
                        width: '260px', 
                        height: '440px',
                        objectFit: 'cover',
                        filter: !isVideoLiberadoParaUsuario(video.id) && !isAdmin ? 'grayscale(1) brightness(0.6) contrast(1.2)' : 'none'
                      }}
                      onClick={() => youtubeLinks[video.id] ? abrirVideoYoutube(video.id) : null}
                    />
                    
                    {/* Gradiente e botões de ação */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent hover:from-black/50 transition-all duration-300">
                      {/* Ícones para administradores */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-2 z-20">
                          {/* Ícone do YouTube para administradores */}
                          <button
                            onClick={(e) => abrirModalYoutube(e, video)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 cursor-pointer transform transition-all duration-200 ease-in-out"
                            title="Adicionar link do YouTube"
                          >
                            <YouTubeIcon size={16} />
                          </button>
                        </div>
                      )}
                      
                      {/* Botão centralizado - Play ou Cadeado dependendo do estado */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          className={`rounded-full p-3 transform hover:scale-110 transition-transform ${isVideoLiberadoParaUsuario(video.id) || isAdmin ? 'bg-orange-600' : 'bg-gray-800 border-2 border-red-500'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (youtubeLinks[video.id] && (isVideoLiberadoParaUsuario(video.id) || isAdmin)) {
                              abrirVideoYoutube(video.id);
                            }
                          }}
                          disabled={!isVideoLiberadoParaUsuario(video.id) && !isAdmin}
                        >
                          {isVideoLiberadoParaUsuario(video.id) || isAdmin ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Divisor entre módulos */}
            {module.id < modulesList.length && (
              <div className="border-b border-gray-700 mt-8"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Modal para adicionar link do YouTube */}
      {mostrarModalYoutube && videoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Adicionar Link do YouTube</h2>
            <p className="text-gray-300 mb-4">Vídeo ID: {videoSelecionado.id}</p>
            <form onSubmit={salvarLinkYoutube}>
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">Link do YouTube</label>
                <input
                  type="text"
                  value={videoSelecionado.youtubeLink || ''}
                  onChange={(e) => setVideoSelecionado({...videoSelecionado, youtubeLink: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModalYoutube(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <YouTubeIcon size={16} className="mr-2" /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
