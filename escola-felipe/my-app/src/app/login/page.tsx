"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
const Equalizer = dynamic(
  () => import('@/components/Equalizer'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-gray-800 animate-pulse rounded-lg" />
  }
);

export default function LoginPage() {
  // [Código de estado e funções permanecem iguais]
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    // [Função handleSubmit permanece igual]
    // ...
  };

  return (
    // Pai: ocupa a tela inteira em altura e largura
    <div className="h-screen w-screen bg-gray-900 flex">
      {/* Coluna Esquerda (50%) */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md border border-gray-700"
        >
          {/* [Conteúdo do formulário permanece igual] */}
          {/* ... */}
        </form>
        {/* Links sociais centralizados abaixo do formulário */}
        <div className="mt-8 flex space-x-4 justify-center">
          {/* [Links sociais permanecem iguais] */}
          {/* ... */}
        </div>
      </div>
      {/* Divisor Vertical */}
      <div className="w-[10px] bg-gradient-to-b from-gray-700 via-orange-500 to-gray-700" />
      
      {/* Coluna Direita (50%) - AJUSTADA PARA CENTRALIZAR VERTICALMENTE NA MESMA ALTURA DO FORMULÁRIO */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Ajustando a disposição vertical dos elementos */}
        <div className="flex flex-col items-center w-full" style={{
          transform: 'translateY(-5%)' // Adiciona um deslocamento para cima de 5% para alinhar com o formulário
        }}>
          {/* Container do equalizador com altura fixa */}
          <div className="w-full max-w-[800px] h-[400px]">
            <Equalizer className="w-full" />
          </div>
          
          {/* Título da escola */}
          <h1 className="text-5xl font-sans text-gray-100 mt-4 tracking-wide">
            Escola de música
            <br />
            <span className="text-gray-100">
              Coutinho
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
}
