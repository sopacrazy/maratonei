import React, { useMemo, useState, useEffect } from "react";
import {
  UserSeries,
  SeriesStatus,
  Series,
  UserProfile,
  UserBadge,
  BADGE_MAP, // <-- Importado o mapa de metadados
} from "../types";
import SeriesCard from "../components/SeriesCard";
import CommunityFeed from "../components/CommunityFeed";
import MatchCinefilo from "../components/MatchCinefilo";
import TrendingRanking from "../components/TrendingRanking";
import { Link, useNavigate } from "react-router-dom";

interface DashboardProps {
  myList: UserSeries[];
  userProfile: UserProfile;
  onUpdateStatus: (series: Series, status: SeriesStatus) => void;
  onRemove: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  // NOVAS PROPS DO APP.TSX:
  userBadges: UserBadge[];
  onUpdateBadges: (newBadge: UserBadge) => void;
}

enum DashboardTab {
  FEED = "Início",
  WATCHING = "Assistindo",
  WANT_TO_WATCH = "Minha Lista",
  WATCHED = "Completas",
}

const INITIAL_LIMIT = 6;

const Dashboard: React.FC<DashboardProps> = ({
  myList,
  userProfile,
  onUpdateStatus,
  onRemove,
  onUpdateNote,
  userBadges, // Lista de selos do App.tsx
  onUpdateBadges, // Função para atualizar a lista no App.tsx
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab | SeriesStatus>(
    DashboardTab.FEED
  );
  const [recommendations, setRecommendations] = useState<Series[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isExpanded, setIsExpanded] = useState(false);

  // ESTADOS PARA OS SELOS
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<UserBadge | null>(null);

  // FUNÇÃO: Recebe o selo do CommunityFeed e abre o modal Congrats
  const handleNewBadgeAwarded = (badge: UserBadge) => {
    setNewBadge(badge);
    onUpdateBadges(badge);
  };

  // Ação ao fechar o CongratsModal: Abre o Mural
  const handleCloseCongrats = () => {
    setNewBadge(null);
    setIsBadgesModalOpen(true);
  };

  // --- Lógica de Listas Filtradas ---
  const watchingList = useMemo(
    () => myList.filter((s) => s.status === SeriesStatus.WATCHING),
    [myList]
  );
  const watchedList = useMemo(
    () => myList.filter((s) => s.status === SeriesStatus.WATCHED),
    [myList]
  );
  const wantList = useMemo(
    () => myList.filter((s) => s.status === SeriesStatus.WANT_TO_WATCH),
    [myList]
  );

  const currentList =
    activeTab === SeriesStatus.WATCHING
      ? watchingList
      : activeTab === SeriesStatus.WATCHED
      ? watchedList
      : activeTab === SeriesStatus.WANT_TO_WATCH
      ? wantList
      : [];

  const displayedList = isExpanded
    ? currentList
    : currentList.slice(0, INITIAL_LIMIT);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  // --- Estatísticas de Tempo ---
  const timeStats = useMemo(() => {
    const totalMinutes = watchedList.reduce((acc, series) => {
      const eps = series.totalEpisodes || 10;
      const duration = series.avgEpisodeDuration || 45;
      return acc + eps * duration;
    }, 0);
    const months = Math.floor(totalMinutes / (60 * 24 * 30));
    const days = Math.floor((totalMinutes % (60 * 24 * 30)) / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    return { months, days, hours, totalMinutes };
  }, [watchedList]);

  // --- Buscar Recomendações ---
  useEffect(() => {
    const fetchRecs = async () => {
      setLoadingRecs(true);
      try {
        const response = await fetch(
          "http://72.61.57.51:3001/api/recommendations",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              favorites: myList.slice(-5).map((s) => s.title),
            }),
          }
        );
        const data = await response.json();
        const formattedRecs = data.map((r: any) => ({
          ...r,
          id:
            r.id ||
            `rec-${r.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
        }));
        setRecommendations(formattedRecs);
      } catch (error) {
        console.error("Erro ao buscar recomendações", error);
      } finally {
        setLoadingRecs(false);
      }
    };
    if (recommendations.length === 0) fetchRecs();
  }, [myList]);

  // --- FUNÇÃO DE AVALIAÇÃO (RATING) ---
  const handleRate = async (seriesId: string, rating: number) => {
    const series = myList.find((s) => s.id === seriesId);
    if (!series) return;

    const userStr = localStorage.getItem("userProfile");
    const uid = userStr ? JSON.parse(userStr).id : null;

    if (uid) {
      try {
        await fetch(`http://72.61.57.51:3001/api/series/${seriesId}/rating`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: uid,
            rating: rating,
            seriesTitle: series.title,
            poster: series.poster,
          }),
        });
        console.log("Avaliação salva!");
      } catch (error) {
        console.error("Erro ao avaliar", error);
      }
    }
  };

  const isCustomImage = useMemo(() => {
    const theme = userProfile.coverTheme || "sunset";
    return theme.startsWith("http") || theme.startsWith("data:");
  }, [userProfile.coverTheme]);

  const getHeaderStyle = () => {
    if (isCustomImage) {
      return {
        backgroundImage: `url('${userProfile.coverTheme}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    const themes: Record<string, string> = {
      ocean: "linear-gradient(to right, #3b82f6, #22d3ee, #2dd4bf)",
      forest: "linear-gradient(to right, #059669, #22c55e, #a3e635)",
      berry: "linear-gradient(to right, #c026d3, #a855f7, #f472b6)",
      midnight: "linear-gradient(to right, #0f172a, #581c87, #0f172a)",
      minimal: "linear-gradient(to right, #334155, #1e293b)",
    };
    return {
      backgroundImage:
        themes[userProfile.coverTheme] ||
        "linear-gradient(to right, #f43f5e, #fb923c, #eab308)",
    };
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header Stats */}
      <div
        className="rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200 text-white relative overflow-hidden transition-all duration-500"
        style={getHeaderStyle()}
      >
        {isCustomImage ? (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          </>
        )}

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left w-full md:w-auto flex flex-col items-center md:items-start">
            {/* VERSÃO 2.2: Header Reorganizado */}
            <div className="flex items-center gap-4 mb-2">
              {" "}
              {/* Reduzi mb-3 para mb-2 */}
              {/* Foto de Perfil Grande */}
              <img
                src={userProfile.avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full border-4 border-white/50 bg-white object-cover shadow-lg shrink-0"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-black drop-shadow-md leading-tight">
                  Olá, {userProfile.name || "Visitante"}!
                </h1>

                {/* Bio/Slogan alinhado com o nome */}
                <p className="text-white/90 font-medium drop-shadow-md text-base">
                  {" "}
                  {/* Aumentei o texto para 'text-base' */}
                  {userProfile.bio ||
                    "Gerencie suas séries e adicione notas pessoais para o seu perfil."}
                </p>
              </div>
            </div>
            {/* FIM VERSÃO 2.2: Header Reorganizado */}

            {/* Botões uniformizados */}
            <div className="flex gap-4 flex-wrap mt-4">
              {" "}
              {/* Adicionei mt-4 para separar dos textos */}
              <button
                onClick={() => navigate("/profile")}
                // Tamanho e sombra uniformizados
                className="bg-white text-slate-800 px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
              >
                Ver Perfil
              </button>
              <button
                onClick={() => navigate("/settings")}
                // Tamanho e sombra uniformizados
                className="bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-xl font-bold hover:bg-white/30 transition-all text-sm backdrop-blur-sm shadow-md hover:scale-[1.02]"
              >
                Editar
              </button>
              {/* BOTÃO MEUS SELOS (Branco) */}
              <button
                onClick={() => setIsBadgesModalOpen(true)}
                className="bg-white text-slate-800 px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
              >
                <img
                  src="/selo.png"
                  alt="Selo de Conquista"
                  className="w-5 h-5 object-contain"
                />
                Meus Selos
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-center w-24">
              <div className="text-2xl font-bold drop-shadow-sm">
                {watchingList.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-90 font-bold drop-shadow-sm">
                Assistindo
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-center w-24">
              <div className="text-2xl font-bold drop-shadow-sm">
                {watchedList.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-90 font-bold drop-shadow-sm">
                Vistos
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* CONTAINER DE NAVEGAÇÃO: Apenas Tabs */}
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex gap-1 overflow-x-auto max-w-full">
              {/* Mapeamento das Tabs (FEED, WATCHING, etc.) */}
              {[
                DashboardTab.FEED,
                SeriesStatus.WATCHING,
                SeriesStatus.WANT_TO_WATCH,
                SeriesStatus.WATCHED,
              ].map((status) => {
                let label = "";
                let count = 0;
                if (status === DashboardTab.FEED) label = "Início";
                else if (status === SeriesStatus.WATCHING) {
                  label = "Assistindo";
                  count = watchingList.length;
                } else if (status === SeriesStatus.WATCHED) {
                  label = "Completas";
                  count = watchedList.length;
                } else {
                  label = "Minha Lista";
                  count = wantList.length;
                }

                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === status
                        ? "bg-slate-800 text-white shadow-md"
                        : "text-slate-500 hover:text-rose-500"
                    }`}
                  >
                    {label}
                    {status !== DashboardTab.FEED && (
                      <span
                        className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${
                          activeTab === status
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab !== DashboardTab.FEED && (
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-slate-100 text-rose-500"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grade"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-slate-100 text-rose-500"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Lista"
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {activeTab === DashboardTab.FEED && (
            <div className="animate-fade-in">
              {/* PASSAR A NOVA PROP DE CALLBACK */}
              <CommunityFeed onNewBadgeAwarded={handleNewBadgeAwarded} />
            </div>
          )}

          {activeTab !== DashboardTab.FEED && (
            <>
              {currentList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 animate-fade-in">
                  <div className="text-5xl mb-4 grayscale opacity-50">📺</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Tudo calmo por aqui
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                    Sua lista está vazia nesta categoria.
                  </p>
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-lg hover:-translate-y-1"
                  >
                    Buscar Séries
                  </Link>
                </div>
              ) : (
                <>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in"
                    }
                  >
                    {displayedList.map((series) => (
                      <SeriesCard
                        key={series.id}
                        series={series}
                        onUpdateStatus={onUpdateStatus}
                        onRemove={onRemove}
                        onUpdateNote={onUpdateNote}
                        onRate={handleRate} // <--- Passando a função de avaliação aqui
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                  {currentList.length > INITIAL_LIMIT && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-500 bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                      >
                        {isExpanded ? (
                          <>
                            Ver menos{" "}
                            <svg
                              className="w-4 h-4 rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Ver mais ({currentList.length - INITIAL_LIMIT}){" "}
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 p-2 rounded-lg text-xl">⏳</span>
                <h3 className="font-bold text-lg">Tempo de vida em Series</h3>
              </div>
              {timeStats.totalMinutes === 0 ? (
                <p className="text-sm text-slate-400">
                  Complete séries para calcular seu tempo total assistido.
                </p>
              ) : (
                <>
                  <p className="text-slate-300 text-xs mb-2 font-medium uppercase tracking-wide">
                    Você já investiu:
                  </p>
                  <div className="space-y-1 mb-4">
                    {timeStats.months > 0 && (
                      <div className="text-3xl font-black text-white leading-none">
                        {timeStats.months}{" "}
                        <span className="text-sm font-bold text-slate-400">
                          meses
                        </span>
                      </div>
                    )}
                    {timeStats.days > 0 && (
                      <div className="text-3xl font-black text-white leading-none">
                        {timeStats.days}{" "}
                        <span className="text-sm font-bold text-slate-400">
                          dias
                        </span>
                      </div>
                    )}
                    <div className="text-3xl font-black text-rose-400 leading-none">
                      {timeStats.hours}{" "}
                      <span className="text-sm font-bold text-rose-200/70">
                        horas
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <MatchCinefilo myList={myList} />
          <TrendingRanking myList={myList} />
        </div>
      </div>

      {activeTab !== DashboardTab.FEED && recommendations.length > 2 && (
        <div className="pt-10 border-t border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full text-xl">
              ✨
            </span>
            <h2 className="text-2xl font-bold text-slate-800">
              Pode ser do seu gosto
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recommendations.slice(2).map((rec) => (
              <SeriesCard
                key={rec.id}
                series={rec}
                onUpdateStatus={onUpdateStatus}
                isSearch={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE PARABÉNS (Concedido após 5 posts) */}
      {newBadge && (
        <CongratsModal badge={newBadge} onClose={handleCloseCongrats} />
      )}

      {/* MODAL MURAL DE SELOS (Aberto pelo botão) */}
      {isBadgesModalOpen && (
        <BadgesModal
          onClose={() => setIsBadgesModalOpen(false)}
          badges={userBadges}
        />
      )}
    </div>
  );
};

// --- NOVO COMPONENTE: MODAL DE PARABÉNS (Ajustado Visualmente) ---
const CongratsModal: React.FC<{ badge: UserBadge; onClose: () => void }> = ({
  badge,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative z-10 text-center animate-pop-in">
        {/* Título e Texto */}
        <h3 className="text-3xl font-black text-slate-800 mb-2">
          Selo Conquistado!
        </h3>
        <p className="text-slate-600 mb-6 font-medium">
          Você desbloqueou o selo **{badge.title}**!
        </p>

        {/* Exibição do Selo: Aumentado, limpo, com bounce */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={`/${badge.image}`}
            alt={badge.title}
            className="w-40 h-40 object-contain animate-bounce"
          />
          <p className="mt-4 text-xs italic text-slate-500">
            "{badge.description}"
          </p>
        </div>

        <button
          onClick={onClose} // Fecha o modal de parabéns e abre o mural
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
        >
          Ir para o Mural
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE MODAL DE SELOS (MURAL AJUSTADO para Hover e Tamanho) ---
const BadgesModal: React.FC<{ onClose: () => void; badges: UserBadge[] }> = ({
  onClose,
  badges,
}) => {
  // Simula todos os selos possíveis (Mapeamento)
  // Nota: BADGE_MAP é importado do types.ts
  const allPossibleBadges = Object.entries(BADGE_MAP).map(
    ([key, metadata]) => ({
      key,
      ...metadata,
    })
  );

  // Mapeia os selos possíveis com os selos conquistados
  const mergedBadges = allPossibleBadges.map((possible) => {
    const earned = badges.find((b) => b.key === possible.key);
    return {
      ...possible,
      earned: !!earned,
    };
  });

  const renderBadge = (item: (typeof mergedBadges)[0]) => (
    <div
      key={item.key}
      // Container principal: Garante que ele preenche a célula do grid.
      className={`relative w-full aspect-square transition-all group cursor-pointer overflow-hidden`}
    >
      {/* Imagem do Selo - MÁXIMO DE TAMANHO e LIMPO */}
      <div
        // Fundo claro e sombra para separação na grade.
        className={`w-full h-full flex items-center justify-center transition-all rounded-xl shadow-md ${
          !item.earned
            ? "bg-slate-100 opacity-60"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        <img
          src={item.image}
          alt={item.title}
          // Removido o padding (p-X) para que a imagem ocupe o MÁXIMO do seu contêiner.
          className={`w-full h-full object-contain transition-transform`}
        />
      </div>

      {/* Tooltip/Overlay (Hover effect): Exibe os detalhes ao passar o mouse */}
      <div className="absolute inset-0 bg-slate-900/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-3 pointer-events-none">
        <h4 className="font-bold text-white text-sm leading-tight mb-1">
          {item.earned ? item.title : "Selo Bloqueado"}
        </h4>
        <p className="text-[10px] text-yellow-300 italic">
          {item.earned ? item.description : "Ainda Bloqueado"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay de fundo */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Conteúdo do Modal */}
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="text-yellow-500 text-2xl">✨</span>
            Minhas Conquistas ({badges.length})
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* MURAL COMPLETO */}
        {badges.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <div className="text-5xl mb-4 opacity-70">🏅</div>
            <p className="text-slate-500 font-bold mb-2">
              Seu mural está vazio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[450px] overflow-y-auto p-2">
            {mergedBadges.map(renderBadge)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
