import React, { useState, useEffect, useMemo } from "react";
import { UserSeries, SeriesStatus, GuestComment, UserProfile } from "../types";
import StatusBadge from "../components/StatusBadge";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";

interface PublicProfileProps {
  myList: UserSeries[];
  userProfile: UserProfile;
}

// Helper para gerar dados fictícios
const generateGuestData = (
  userId: string
): { profile: UserProfile; list: UserSeries[] } => {
  const name = userId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const profile: UserProfile = {
    name: name,
    bio: `Cinéfilo entusiasta. Adoro discutir teorias e finais alternativos! #${
      name.split(" ")[0]
    }TV`,
    avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${name}`,
    coverTheme: userId.length % 2 === 0 ? "midnight" : "ocean",
  };
  const list: UserSeries[] = [];
  return { profile, list };
};

// --- COMPONENTE PODIUM (TOP 3) ---
const TopPodium: React.FC<{ series: UserSeries[] }> = ({ series }) => {
  // Precisamos de pelo menos 1 série. Se tiver menos de 3, preenchemos com null para não quebrar o layout.
  if (!series || series.length === 0) return null;

  // Organização visual do Podium: [2º Lugar, 1º Lugar, 3º Lugar]
  // Array original vem ordenado [1º, 2º, 3º...]
  const first = series[0];
  const second = series.length > 1 ? series[1] : null;
  const third = series.length > 2 ? series[2] : null;

  return (
    <div className="flex justify-center items-end gap-3 sm:gap-6 mb-12 px-4 animate-fade-in-up">
      {/* 2º LUGAR (Esquerda) */}
      <div className="flex flex-col items-center order-1 w-1/3 max-w-[100px] sm:max-w-[120px]">
        {second ? (
          <>
            <div className="text-sm font-bold text-slate-400 mb-1">#2</div>
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 border-slate-300 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              {second.poster ? (
                <img
                  src={second.poster}
                  alt={second.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px]">
                  ?
                </div>
              )}
              {/* Badge Prata */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-400 to-transparent h-1/2 opacity-50"></div>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 mt-2 text-center line-clamp-1">
              {second.title}
            </p>
          </>
        ) : (
          <div className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-2xl opacity-20">2</span>
          </div>
        )}
      </div>

      {/* 1º LUGAR (Centro - Maior) */}
      <div className="flex flex-col items-center order-2 w-1/3 max-w-[120px] sm:max-w-[140px] -mb-4 z-10">
        <div className="text-2xl mb-2 animate-bounce">👑</div>
        <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform duration-300">
          {first.poster ? (
            <img
              src={first.poster}
              alt={first.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs">
              Sem Foto
            </div>
          )}
          {/* Badge Ouro */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-yellow-400 flex items-center justify-center text-white font-black text-sm">
            TOP 1
          </div>
        </div>
        <p className="text-xs sm:text-sm font-black text-slate-800 mt-3 text-center line-clamp-2 leading-tight">
          {first.title}
        </p>
      </div>

      {/* 3º LUGAR (Direita) */}
      <div className="flex flex-col items-center order-3 w-1/3 max-w-[100px] sm:max-w-[120px]">
        {third ? (
          <>
            <div className="text-sm font-bold text-orange-800/50 mb-1">#3</div>
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 border-orange-200 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              {third.poster ? (
                <img
                  src={third.poster}
                  alt={third.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px]">
                  ?
                </div>
              )}
              {/* Badge Bronze */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-300 to-transparent h-1/2 opacity-50"></div>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 mt-2 text-center line-clamp-1">
              {third.title}
            </p>
          </>
        ) : (
          <div className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-2xl opacity-20">3</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PublicProfile: React.FC<PublicProfileProps> = ({
  myList,
  userProfile,
}) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isGuestView = Boolean(userId);

  const [localSearch, setLocalSearch] = useState("");

  const displayData = useMemo(() => {
    if (userId) {
      return generateGuestData(userId);
    }
    return { profile: userProfile, list: myList };
  }, [userId, userProfile, myList]);

  const { profile: currentProfile, list: currentList } = displayData;

  // Separa as listas para uso
  // Lógica do Top 3: Pegamos as 3 primeiras da lista "Completa" (Watched).
  // Se não tiver, pega da "Assistindo" (Watching).
  const watchedList = currentList.filter(
    (s) => s.status === SeriesStatus.WATCHED
  );
  const watchingList = currentList.filter(
    (s) => s.status === SeriesStatus.WATCHING
  );

  // Prioriza completas, se não tiver 3, completa com assistindo
  const top3Series = useMemo(() => {
    const combined = [...watchedList, ...watchingList];
    // Remove duplicatas se houver (por segurança) e pega as 3 primeiras
    return combined.slice(0, 3);
  }, [watchedList, watchingList]);

  const filteredList = useMemo(() => {
    if (!localSearch.trim()) return currentList;
    return currentList.filter(
      (s) =>
        s.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        (s.personalNote &&
          s.personalNote.toLowerCase().includes(localSearch.toLowerCase()))
    );
  }, [currentList, localSearch]);

  const storageKey = userId ? `guestBook_${userId}` : "guestBookComments";
  const [comments, setComments] = useState<GuestComment[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [newComment, setNewComment] = useState("");
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, storageKey]);

  useEffect(() => {
    setNewComment("");
    setActiveSeriesId(null);
    setLocalSearch("");
  }, [userId]);

  const filteredWatching = filteredList.filter(
    (s) => s.status === SeriesStatus.WATCHING
  );
  const filteredWatched = filteredList.filter(
    (s) => s.status === SeriesStatus.WATCHED
  );

  // Stats
  const fullWatchedList = currentList.filter(
    (s) => s.status === SeriesStatus.WATCHED
  );
  const timeStats = useMemo(() => {
    const totalMinutes = fullWatchedList.reduce((acc, series) => {
      const eps = series.totalEpisodes || 10;
      const duration = series.avgEpisodeDuration || 45;
      return acc + eps * duration;
    }, 0);

    const months = Math.floor(totalMinutes / (60 * 24 * 30));
    const days = Math.floor((totalMinutes % (60 * 24 * 30)) / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    return { months, days, hours, totalMinutes };
  }, [fullWatchedList]);

  const handlePostComment = (seriesId: string) => {
    if (!newComment.trim()) return;
    const comment: GuestComment = {
      id: Date.now().toString(),
      seriesId,
      author: "Você (Visitante)",
      text: newComment,
      timestamp: Date.now(),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setActiveSeriesId(null);
  };

  const getSeriesComments = (id: string) =>
    comments.filter((c) => c.seriesId === id);

  const isCustomImage = useMemo(() => {
    const theme = currentProfile.coverTheme || "sunset";
    return theme.startsWith("http") || theme.startsWith("data:");
  }, [currentProfile.coverTheme]);

  const getCoverStyle = () => {
    if (isCustomImage) {
      return {
        backgroundImage: `url('${currentProfile.coverTheme}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    switch (currentProfile.coverTheme) {
      case "ocean":
        return {
          backgroundImage:
            "linear-gradient(to bottom right, #3b82f6, #22d3ee, #2dd4bf)",
        };
      case "forest":
        return {
          backgroundImage:
            "linear-gradient(to bottom right, #059669, #22c55e, #a3e635)",
        };
      case "berry":
        return {
          backgroundImage:
            "linear-gradient(to bottom right, #c026d3, #a855f7, #f472b6)",
        };
      case "midnight":
        return {
          backgroundImage:
            "linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)",
        };
      case "minimal":
        return { backgroundColor: "#1e293b" };
      default:
        return {
          backgroundImage:
            "linear-gradient(to bottom right, #f43f5e, #fb923c, #eab308)",
        };
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto bg-black/30 backdrop-blur-xl border border-white/20 text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-black/50 hover:scale-105 transition-all flex items-center gap-2 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar ao Início
        </button>
      </nav>

      <div
        className={`relative h-64 sm:h-96 rounded-b-[50px] shadow-2xl overflow-hidden transition-all duration-700`}
        style={getCoverStyle()}
      >
        {isCustomImage ? (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30"></div>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          </>
        )}
      </div>

      <div className="flex-grow max-w-3xl mx-auto px-4 -mt-24 sm:-mt-32 relative z-10 w-full mb-12">
        {/* CARTÃO DE PERFIL */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/50 text-center mb-10 animate-fade-in-up">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-white shadow-xl mx-auto">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-full h-full rounded-full object-cover bg-slate-100"
              />
            </div>
            <div className="absolute bottom-2 right-4 bg-emerald-500 border-4 border-white w-7 h-7 rounded-full shadow-sm"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3 tracking-tight flex items-center justify-center gap-2">
            {currentProfile.name}
            <svg
              className="w-7 h-7 text-blue-500 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </h1>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed text-lg">
            {currentProfile.bio || "Apaixonado por séries e novas histórias."}
          </p>

          <div className="flex justify-center items-center gap-8 sm:gap-16 border-t border-slate-100 pt-8">
            <div className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-slate-800 group-hover:text-rose-500 transition-colors">
                {watchingList.length}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">
                Assistindo
              </div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-slate-800 group-hover:text-teal-500 transition-colors">
                {watchedList.length}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">
                Vistos
              </div>
            </div>
          </div>

          {timeStats.totalMinutes > 0 && (
            <div className="mt-10 mx-auto inline-block relative group cursor-pointer hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-slate-900 text-white rounded-2xl px-6 py-3 flex items-center gap-4 shadow-lg border border-slate-700">
                <div className="bg-white/10 p-2 rounded-full">
                  <span className="text-xl">⏳</span>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    Tempo de vida investido
                  </div>
                  <div className="font-bold text-sm sm:text-base leading-tight">
                    {timeStats.months > 0 && (
                      <span>{timeStats.months} m, </span>
                    )}
                    {timeStats.days > 0 && <span>{timeStats.days} d, </span>}
                    <span className="text-rose-400">
                      {timeStats.hours} horas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- ÁREA DO PODIUM (TOP 3) --- */}
        {top3Series.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="bg-yellow-100 text-yellow-600 p-2 rounded-xl text-xl shadow-sm">
                👑
              </span>
              <h2 className="text-2xl font-black text-slate-800">
                Top Favoritos
              </h2>
            </div>
            <TopPodium series={top3Series} />
          </div>
        )}

        {/* ÁREA DE BUSCA */}
        <div className="bg-white rounded-2xl p-2 mb-10 shadow-sm border border-slate-200 flex items-center gap-2">
          <div className="p-3 text-slate-400">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Filtrar série por nome ou anotação..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400 text-sm py-2"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-10">
          {filteredWatching.length > 0 && (
            <section
              className="animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <span className="bg-rose-100 text-rose-600 p-2 rounded-xl text-lg shadow-sm">
                  📺
                </span>
                <h2 className="text-2xl font-bold text-slate-800">
                  Assistindo Agora ({filteredWatching.length})
                </h2>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {filteredWatching.map((series) => (
                    <ProfileSeriesItem
                      key={series.id}
                      series={series}
                      comments={getSeriesComments(series.id)}
                      onComment={() => setActiveSeriesId(series.id)}
                      isCommenting={activeSeriesId === series.id}
                      commentText={newComment}
                      setCommentText={setNewComment}
                      submitComment={handlePostComment}
                      cancelComment={() => setActiveSeriesId(null)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {filteredWatched.length > 0 && (
            <section
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <span className="bg-teal-100 text-teal-600 p-2 rounded-xl text-lg shadow-sm">
                  🏆
                </span>
                <h2 className="text-2xl font-bold text-slate-800">
                  Já Finalizados ({filteredWatched.length})
                </h2>
              </div>

              <div className="grid gap-4">
                {filteredWatched.map((series) => (
                  <div
                    key={series.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex gap-4"
                  >
                    <div className="w-16 h-24 rounded-xl shadow-sm bg-slate-200 shrink-0 overflow-hidden relative">
                      {series.poster ? (
                        <img
                          src={series.poster}
                          className="w-full h-full object-cover"
                          alt={series.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                        {series.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mb-3 uppercase">
                        {series.genres ? series.genres[0] : "TV Show"}
                      </p>
                      {series.personalNote ? (
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block italic">
                          "{series.personalNote}"
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          Sem nota pública.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isGuestView ? (
            <div className="text-center pt-8">
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-bold px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Editar meu perfil
              </Link>
            </div>
          ) : (
            <div className="text-center pt-8">
              <button className="inline-flex items-center gap-2 text-sm text-white bg-rose-500 hover:bg-rose-600 font-bold px-6 py-2.5 rounded-full shadow-lg transition-colors">
                Seguir {currentProfile.name.split(" ")[0]}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const ProfileSeriesItem: React.FC<{
  series: UserSeries;
  comments: GuestComment[];
  onComment: () => void;
  isCommenting: boolean;
  commentText: string;
  setCommentText: (s: string) => void;
  submitComment: (id: string) => void;
  cancelComment: () => void;
}> = ({
  series,
  comments,
  onComment,
  isCommenting,
  commentText,
  setCommentText,
  submitComment,
  cancelComment,
}) => {
  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex gap-5">
        <div className="w-20 h-28 rounded-xl shadow-md shrink-0 bg-slate-200 transform rotate-1 overflow-hidden relative">
          {series.poster ? (
            <img
              src={series.poster}
              alt={series.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
              SEM FOTO
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-xl text-slate-800 truncate">
              {series.title}
            </h3>
            <StatusBadge status={series.status} />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 relative mb-3 mt-2">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              <span className="text-slate-400 font-serif text-lg mr-1">"</span>
              {series.personalNote ||
                "Sem comentários ainda, mas estou assistindo!"}
              <span className="text-slate-400 font-serif text-lg ml-1">"</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pl-24">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onComment}
            className="text-xs font-bold text-slate-500 hover:text-rose-500 flex items-center gap-1.5 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Deixar recado ({comments.length})
          </button>
        </div>

        {isCommenting && (
          <div className="mb-4 animate-fade-in bg-slate-50 p-3 rounded-xl border border-slate-200">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Deixe um recado para o dono do perfil..."
              className="w-full text-sm p-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none mb-2"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelComment}
                className="text-xs font-bold text-slate-500 px-3 py-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => submitComment(series.id)}
                className="text-xs bg-rose-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-md hover:bg-rose-600 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-3 mt-3">
            {comments.slice(-2).map((comment) => (
              <div
                key={comment.id}
                className="text-sm flex gap-2 items-start bg-slate-50/50 p-2 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shrink-0 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                  {comment.author.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-700 text-xs block">
                    {comment.author}
                  </span>
                  <span className="text-slate-600">{comment.text}</span>
                </div>
              </div>
            ))}
            {comments.length > 2 && (
              <div className="text-[10px] text-slate-400 font-bold hover:text-rose-500 cursor-pointer pl-1">
                Ver mais {comments.length - 2} comentários...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
