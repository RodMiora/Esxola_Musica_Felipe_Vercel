import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Escola de Música</h3>
            <p className="text-gray-300">Educação musical de qualidade para todos os níveis.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contato</h3>
            <p className="text-gray-300">Email: contato@escolademusica.com</p>
            <p className="text-gray-300">Telefone: (11) 99999-9999</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Redes Sociais</h3>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-300 hover:text-orange-400">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-orange-400">Facebook</a>
              <a href="#" className="text-gray-300 hover:text-orange-400">YouTube</a>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>© 2023 Escola de Música. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;