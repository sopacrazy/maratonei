import React, { useMemo, useState, useEffect } from "react";
import { UserSeries, SeriesStatus, Series, UserProfile } from "../types";
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
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab | SeriesStatus>(
    DashboardTab.FEED
  );
  const [recommendations, setRecommendations] = useState<Series[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isExpanded, setIsExpanded] = useState(false);

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

  useEffect(() => {
    const fetchRecs = async () => {
      setLoadingRecs(true);
      try {
        const response = await fetch(
          "http://localhost:3001/api/recommendations",
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
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 drop-shadow-md">
              Olá, {userProfile.name || "Visitante"}!
              <img
                src={userProfile.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-white/50 bg-white object-cover ml-2"
              />
            </h1>
            <p className="text-white/90 font-medium mb-4 max-w-md drop-shadow-md">
              {userProfile.bio ||
                "Gerencie suas séries e adicione notas pessoais para o seu perfil."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/profile")}
                className="bg-white text-slate-800 px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Ver Perfil
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-full font-bold hover:bg-white/30 transition-all text-sm backdrop-blur-sm"
              >
                Editar
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
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex gap-1 overflow-x-auto max-w-full">
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
              <CommunityFeed />
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

        {/* Sidebar Column - CORRIGIDO O ESPAÇAMENTO */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 p-2 rounded-lg text-xl">⏳</span>
                <h3 className="font-bold text-lg">Tempo de Vida</h3>
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

          {recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <h3 className="font-bold text-lg mb-4 relative z-10 flex items-center gap-2">
                🔥 Em Alta na Rede
              </h3>
              <div className="space-y-4 relative z-10">
                {recommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 flex gap-3"
                  >
                    <div className="w-10 h-14 bg-black/20 rounded-lg shrink-0 overflow-hidden relative">
                      {rec.poster ? (
                        <img
                          src={rec.poster}
                          className="w-full h-full object-cover"
                          alt={rec.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {rec.title}
                      </h4>
                      <button
                        onClick={() =>
                          onUpdateStatus(rec, SeriesStatus.WANT_TO_WATCH)
                        }
                        className="mt-2 text-[10px] bg-white text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-50"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
};

export default Dashboard;
