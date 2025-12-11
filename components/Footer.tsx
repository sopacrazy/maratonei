import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                M
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                Mara<span className="text-rose-500">tonei</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              A rede social definitiva para quem vive de play em play. Organize, descubra e compartilhe suas obsessões.
            </p>
            <div className="flex gap-4">
              {/* Fake Social Icons */}
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Navegação</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-rose-500 transition-colors">Início</Link></li>
              <li><Link to="/search" className="hover:text-rose-500 transition-colors">Explorar Séries</Link></li>
              <li><Link to="/profile" className="hover:text-rose-500 transition-colors">Meu Perfil Público</Link></li>
              <li><Link to="/settings" className="hover:text-rose-500 transition-colors">Configurações</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Comunidade</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-rose-500 transition-colors">Diretrizes da Comunidade</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Sugerir Funcionalidade</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Ajuda e Suporte</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Termos de Uso</a></li>
            </ul>
          </div>

          {/* Newsletter / App Info */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Baixe o App</h4>
            <p className="text-xs text-slate-500 mb-4">Em breve disponível para iOS e Android. Leve sua lista no bolso.</p>
            <div className="flex gap-2">
               <div className="h-10 bg-slate-900 rounded-lg w-32 flex items-center justify-center text-white text-xs font-bold cursor-not-allowed opacity-80">
                  App Store
               </div>
               <div className="h-10 bg-slate-900 rounded-lg w-32 flex items-center justify-center text-white text-xs font-bold cursor-not-allowed opacity-80">
                  Google Play
               </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; 2024 Maratonei Inc. Todos os direitos reservados.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-slate-600">Privacidade</a>
             <a href="#" className="hover:text-slate-600">Cookies</a>
             <a href="#" className="hover:text-slate-600">Sobre</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
