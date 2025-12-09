//
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { Notification } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados da Notificação
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Ref para detectar clique fora
  const notificationRef = useRef<HTMLDivElement>(null);

  const savedUser = localStorage.getItem("userProfile");
  const userId = savedUser ? JSON.parse(savedUser).id : null;

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-rose-600 font-bold bg-rose-50"
      : "text-slate-500 hover:text-rose-500 hover:bg-slate-50";
  };

  const navLinks = [
    { path: "/", label: "Minhas Séries" },
    { path: "/search", label: "Buscar" },
  ];

  // --- BUSCA NOTIFICAÇÕES ---
  const fetchNotifications = () => {
    if (!userId) return;
    fetch(`http://localhost:3001/api/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  // --- FECHAR AO CLICAR FORA ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Se o menu estiver aberto E o clique NÃO for dentro do menu (ref)
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const toggleNotifications = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);

    if (newState && unreadCount > 0) {
      // Marca visualmente como lidas
      const updated = notifications.map((n) => ({ ...n, is_read: true }));
      setNotifications(updated);

      // Atualiza no banco
      notifications
        .filter((n) => !n.is_read)
        .forEach((n) => {
          fetch(`http://localhost:3001/api/notifications/${n.id}/read`, {
            method: "PATCH",
          });
        });
    }
  };

  // Clicar na notificação
  const handleNotificationClick = (notif: Notification) => {
    setShowNotifications(false);

    // Garante leitura
    if (!notif.is_read) {
      fetch(`http://localhost:3001/api/notifications/${notif.id}/read`, {
        method: "PATCH",
      });
    }

    if (notif.type === "FOLLOW") {
      const slug = notif.actor_name.toLowerCase().replace(/\s+/g, "");
      navigate(`/profile/${slug}`);
    } else {
      // Assume que activity_id vem no objeto (veja rota GET do server)
      const actId = (notif as any).activity_id;
      if (actId) navigate(`/post/${actId}`);
    }
  };

  // --- FUNÇÃO LIMPAR (DELETAR TUDO) ---
  const handleClear = async () => {
    if (!userId) return;
    setNotifications([]); // Limpa visual
    try {
      await fetch(`http://localhost:3001/api/notifications/clear/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao limpar:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
        <header className="sticky top-0 sm:top-4 z-50 bg-white/90 backdrop-blur-md border-b sm:border border-white/40 shadow-sm sm:rounded-2xl px-4 sm:px-6 py-3 mb-8 -mx-4 sm:mx-0 transition-all">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Mara<span className="text-rose-500">tonei</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="hidden sm:flex items-center gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1 rounded-full transition-all ${isActive(
                      link.path
                    )}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* --- SINO DE NOTIFICAÇÃO --- */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative outline-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-700">
                        Notificações
                      </span>
                      <button
                        className="text-[10px] text-rose-500 font-bold hover:underline uppercase tracking-wide px-2 py-1 hover:bg-rose-50 rounded"
                        onClick={handleClear}
                      >
                        Limpar
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <div className="text-2xl mb-2">💤</div>
                          Nenhuma notificação por enquanto.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 border-b border-slate-50 flex gap-3 items-start hover:bg-slate-50 transition-colors cursor-pointer ${
                              !n.is_read ? "bg-rose-50/20" : ""
                            }`}
                          >
                            <img
                              src={n.actor_avatar}
                              className="w-8 h-8 rounded-full border border-slate-100 shrink-0"
                              alt=""
                            />
                            <div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-bold text-slate-900">
                                  {n.actor_name}
                                </span>
                                {n.type === "LIKE" && " curtiu sua publicação."}
                                {n.type === "COMMENT" &&
                                  " comentou no seu post."}
                                {n.type === "FOLLOW" && " começou a te seguir."}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(n.created_at).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            {!n.is_read && (
                              <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

              <Link
                to="/settings"
                className="hidden sm:block p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Configurações"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>

              <button
                onClick={onLogout}
                className="hidden sm:block p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>

              <button
                className="sm:hidden p-2 text-slate-600 hover:text-rose-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-fade-in p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${isActive(
                    link.path
                  )}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-1"></div>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between text-slate-500 hover:bg-slate-50"
              >
                Configurações
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between text-red-500 hover:bg-red-50"
              >
                Sair da Conta
              </button>
            </div>
          )}
        </header>

        <main className="flex-grow pb-12">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
