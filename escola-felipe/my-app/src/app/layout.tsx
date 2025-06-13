import type { Metadata } from "next";
import "./globals.css";

// Adicione os logs de depuração
console.log('Ambiente:', process.env.NODE_ENV);
console.log('Tailwind CSS carregando em:', typeof window !== 'undefined' ? 'Cliente' : 'Servidor');

export const metadata: Metadata = {
  title: "Escola de Música",
  description: "Plataforma de ensino musical online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log adicional na função de layout
  console.log('Layout renderizado no ambiente:', process.env.NODE_ENV);
  
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
