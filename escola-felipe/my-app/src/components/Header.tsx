import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Escola de Música
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-orange-400">
                Início
              </Link>
            </li>
            <li>
              <Link href="/videos" className="hover:text-orange-400">
                Vídeos
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-orange-400">
                Sobre
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;