"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './animations.css'; // Import the animations CSS file
// Removendo a importação do FaYoutube
// import { FaYoutube } from "react-icons/fa";

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
  
  // Estado para armazenar os módulos
  const [modulesList, setModulesList] = useState<typeof modules>([]);
  
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
    
    // Carregar títulos salvos do localStorage
    const savedTitles = localStorage.getItem('videoTitles');
    let updatedModules = [...modules]; // Começamos com os módulos definidos no código
    
    if (savedTitles) {
      try {
        const titlesMap = JSON.parse(savedTitles);
        
        // Aplicar os títulos salvos aos módulos, mas manter os títulos dos módulos do código
        updatedModules = updatedModules.map(module => {
          const updatedVideos = module.videos.map(video => {
            if (titlesMap[video.id]) {
              return { ...video, title: titlesMap[video.id] };
            }
            return video;
          });
          return { ...module, videos: updatedVideos };
        });
      } catch (error) {
        console.error('Erro ao carregar títulos salvos:', error);
      }
    }
    
    // Removido o código que aplicava os títulos dos módulos do localStorage
    // Agora os títulos dos módulos serão sempre os definidos no código
    
    setModulesList(updatedModules);
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
      const scrollAmount = 350; // Aumentado para acomodar cards mais largos
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
    setVideoSelecionado(video);
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
      return videosLiberados[currentUserId]?.includes(videoId) || false;
    }
    
    return false;
  };
  
  // Funções de edição de título removidas

  // Módulos de violão organizados sequencialmente
  const modules = [
    {
      id: 1,
      title: 'Módulo 1: Começando do Zero!',
      videos: [
        { 
          id: 101, 
          title: 'Partes do violão', 
          duration: '12:30',
          thumbnail: '/imagens/Sem_titulo.jpg',
        
        },
        { 
          id: 102, 
          title: 'Tipos de violão', 
          duration: '10:15',
          thumbnail: '/imagens/Postura.jpg',
        
        },
        { 
          id: 103, 
          title: 'Afinação básica', 
          duration: '15:45',
          thumbnail: '/imagens/afinando.png',
          level: 'iniciante'
        },
        { 
          id: 104, 
          title: 'Cuidados com o instrumento', 
          duration: '8:50',
          thumbnail: '/imagens/diagrama.png',
          level: 'iniciante'
        },
        { 
          id: 105, 
          title: 'História do violão', 
          duration: '14:20',
          thumbnail: '/imagens/Sem_titulo.jpg',
          level: 'iniciante'
        },
        { 
          id: 106, 
          title: 'Escolhendo seu primeiro violão', 
          duration: '11:35',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,buying',
          level: 'iniciante'
        },
        { 
          id: 107, 
          title: 'Acessórios essenciais', 
          duration: '9:45',
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
          title: 'Postura correta', 
          duration: '14:20',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,posture',
          level: 'iniciante'
        },
        { 
          id: 202, 
          title: 'Posição da mão direita', 
          duration: '12:35',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,hand',
          level: 'iniciante'
        },
        { 
          id: 203, 
          title: 'Posição da mão esquerda', 
          duration: '15:10',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chord',
          level: 'iniciante'
        },
        { 
          id: 204, 
          title: 'Exercícios de aquecimento', 
          duration: '10:10',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,practice',
          level: 'iniciante'
        },
        { 
          id: 205, 
          title: 'Prevenção de lesões', 
          duration: '13:25',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,health',
          level: 'iniciante'
        },
        { 
          id: 206, 
          title: 'Técnicas de relaxamento', 
          duration: '11:40',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,relax',
          level: 'iniciante'
        },
        { 
          id: 207, 
          title: 'Exercícios para dedilhado', 
          duration: '16:15',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingers',
          level: 'iniciante-intermediario'
        },
        { 
          id: 208, 
          title: 'Fortalecimento dos dedos', 
          duration: '12:50',
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
          title: 'Acordes maiores', 
          duration: '18:45',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chords',
          level: 'iniciante'
        },
        { 
          id: 302, 
          title: 'Acordes menores', 
          duration: '16:20',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,minor',
          level: 'iniciante'
        },
        { 
          id: 303, 
          title: 'Transição entre acordes', 
          duration: '15:25',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,transition',
          level: 'iniciante-intermediario'
        },
        { 
          id: 304, 
          title: 'Primeira música completa', 
          duration: '20:00',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,song',
          level: 'iniciante-intermediario'
        },
        { 
          id: 305, 
          title: 'Acordes com sétima', 
          duration: '17:30',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,seventh',
          level: 'intermediario'
        },
        { 
          id: 306, 
          title: 'Acordes suspensos', 
          duration: '14:45',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,suspended',
          level: 'intermediario'
        },
        { 
          id: 307, 
          title: 'Progressões harmônicas básicas', 
          duration: '19:15',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,progression',
          level: 'iniciante-intermediario'
        },
        { 
          id: 308, 
          title: 'Campo harmônico maior', 
          duration: '22:10',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,harmony',
          level: 'intermediario'
        },
        { 
          id: 309, 
          title: 'Acordes com pestana', 
          duration: '16:40',
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
          title: 'Batidas básicas', 
          duration: '15:30',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,strumming',
          level: 'iniciante'
        },
        { 
          id: 402, 
          title: 'Ritmos populares', 
          duration: '18:20',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,rhythm',
          level: 'iniciante-intermediario'
        },
        { 
          id: 403, 
          title: 'Técnica de palhetada', 
          duration: '14:15',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,pick',
          level: 'iniciante'
        },
        { 
          id: 404, 
          title: 'Dedilhado simples', 
          duration: '16:40',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingerpicking',
          level: 'iniciante-intermediario'
        },
        { 
          id: 405, 
          title: 'Ritmos latinos', 
          duration: '19:25',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,latin',
          level: 'intermediario'
        },
        { 
          id: 406, 
          title: 'Técnicas percussivas', 
          duration: '17:10',
          thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,percussion',
          level: 'intermediario'
        }
      ]
    }
  ];

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
              
              <div 
                ref={(el: HTMLDivElement | null) => {
                  carouselRefs.current[module.id] = el;
                }}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {module.videos.map((video) => (
                  <div 
                    key={video.id} 
                    className="flex-shrink-0 w-65 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-orange-500 transition-colors relative"
                  >
                    {!isVideoLiberadoParaUsuario(video.id) && !isAdmin && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-0 backdrop-blur-[2px] flex items-center justify-center">
                        {/* Overlay mais escuro e com maior opacidade para vídeos bloqueados */}
                        <div className="text-white text-opacity-90 text-lg font-bold bg-black bg-opacity-50 p-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12M9 9V7a3 3 0 0 1 6 0v2" />
                            <rect x="7" y="11" width="10" height="10" rx="2" strokeWidth={2} />
                          </svg>
                          BLOQUEADO
                        </div>
                      </div>
                    )}
                    {/* Thumbnail do vídeo - área clicável */}
                    <div 
                      className="relative h-140 overflow-hidden"
                      onClick={() => youtubeLinks[video.id] ? abrirVideoYoutube(video.id) : null}
                      style={{ cursor: youtubeLinks[video.id] ? 'pointer' : 'default' }}
                    >
                                {/* Imagem de thumbnail */}
                                <div 
                                  className="absolute inset-0 bg-cover bg-center transition-all duration-300" 
                                  style={{
                                    backgroundImage: `url(${video.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    filter: !isVideoLiberadoParaUsuario(video.id) && !isAdmin ? 'grayscale(1) brightness(0.6) contrast(1.2)' : 'none'
                                  }} 
                                />
                                
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
                        
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button 
                            className="bg-orange-600 rounded-full p-3 transform hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (youtubeLinks[video.id] && (isVideoLiberadoParaUsuario(video.id) || isAdmin)) {
                                abrirVideoYoutube(video.id);
                              }
                            }}
                          >
                            {isVideoLiberadoParaUsuario(video.id) || isAdmin ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Área de edição de título removida */}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Divisor entre módulos */}
            {module.id < modules.length && (
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
            <p className="text-gray-300 mb-4">Vídeo: {videoSelecionado.title}</p>
            
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

