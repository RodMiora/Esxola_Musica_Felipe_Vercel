"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const Equalizer = dynamic(
  () => import('@/components/Equalizer'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[150px] sm:h-[200px] md:h-[400px] bg-gray-800 animate-pulse rounded-lg" />
  }
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verificar credenciais de administrador
      if ((email === "admin" && password === "123456") ||
          (email === "administrador" && password === "123456789")) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', email);
        localStorage.setItem('isAdmin', 'true');
        router.push('/videos'); // Redireciona para vídeos primeiro
        return;
      }

      // Verificar se é um aluno cadastrado
      const alunosSalvos = localStorage.getItem('alunos');
      if (alunosSalvos) {
        const alunos = JSON.parse(alunosSalvos);
        const aluno = alunos.find(
          (a: any) => a.login === email && (a.password === password || a.senha === password)
        );
        
        if (aluno) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', email);
          localStorage.setItem('isAdmin', 'false');
          localStorage.setItem('alunoId', aluno.id.toString());
          router.push('/videos');
          return;
        }
      }

      // Se chegou aqui, as credenciais são inválidas
      setError("Nome de usuário ou senha incorretos");
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.");
      console.error("Erro de login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container principal com posição relativa para o divisor absoluto
    <div className="h-screen w-screen bg-gray-900 flex flex-col md:flex-row overflow-hidden relative">
      {/* Coluna Esquerda - em mobile fica na segunda posição */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 order-2 md:order-1">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-700"
        >
          <div className="space-y-4 md:space-y-6">
            {error && (
              <div className="bg-red-600 bg-opacity-90 border border-red-700 text-white px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                Nome de Usuário
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu nome de usuário"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3 pr-10"
                  required
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

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Lembrar-me</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </div>
        </form>

        {/* Links sociais */}
        <div className="mt-6 md:mt-8 flex space-x-4 justify-center">
          <a
            href="https://www.instagram.com/felipe.couttinho?igsh=MWhjd3R6a3YxdXFsaQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-800 via-pink-800 to-yellow-700 rounded-full px-4 py-2 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-500 transition-all duration-300"
          >
            <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="text-gray-300 hover:text-white transition-colors font-medium">Instagram</span>
          </a>
          <a
            href="https://www.youtube.com/c/CanaldoFelipeCoutinhoViolaoFingerstylle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-red-800 rounded-full px-4 py-2 hover:bg-red-600 transition-all duration-300"
          >
            <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            <span className="text-gray-300 hover:text-white transition-colors font-medium">YouTube</span>
          </a>
        </div>
      </div>

      {/* Divisor Vertical com posicionamento absoluto para garantir centralização */}
      <div className="hidden md:block w-[10px] bg-gradient-to-b from-gray-700 via-orange-500 to-gray-700 absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2">
      </div>

      {/* Coluna Direita - em mobile fica na primeira posição */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 order-1 md:order-2">
        <div className="flex flex-col items-center w-full">
          {/* ALTERAÇÃO APLICADA AQUI */}
          <div className="w-full max-w-[800px] h-[150px] sm:h-[200px] md:h-[400px]">
            <Equalizer className="w-full" />
          </div>
          <h1 className="text-3xl md:text-5xl font-sans text-gray-100 mt-4 tracking-wide text-center w-full">
            Escola de música
            <br />
            <span className="text-gray-100 block">
              Coutinho
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
}
