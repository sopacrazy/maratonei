//
import React, { useState, useEffect, useMemo } from "react";
import { UserSeries, SeriesStatus, UserProfile } from "../types";
import StatusBadge from "../components/StatusBadge";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";

interface PublicProfileProps {
  myList: UserSeries[];
  userProfile: UserProfile;
}

const THEMES: Record<string, string> = {
  sunset: "bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500",
  ocean: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",
  forest: "bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400",
  berry: "bg-gradient-to-br from-fuchsia-600 via-purple-500 to-pink-400",
  midnight: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  minimal: "bg-slate-800",
};

// --- PODIUM COMPONENT ---
const TopPodium: React.FC<{
  seriesList: UserSeries[];
  onSlotClick: (rank: number) => void;
  isOwner: boolean;
}> = ({ seriesList, onSlotClick, isOwner }) => {
  const first = seriesList.find((s) => s.ranking === 1);
  const second = seriesList.find((s) => s.ranking === 2);
  const third = seriesList.find((s) => s.ranking === 3);

  const renderSlot = (
    rank: number,
    series?: UserSeries,
    borderColor = "border-slate-200"
  ) => (
    <div
      onClick={() => isOwner && onSlotClick(rank)}
      className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 ${borderColor} bg-slate-200 transition-all duration-300 ${
        isOwner ? "cursor-pointer hover:brightness-90 group" : ""
      }`}
    >
      {series?.poster ? (
        <img
          src={series.poster}
          alt={series.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 relative">
          <span className="text-3xl opacity-50">{isOwner ? "+" : "Vazio"}</span>
          {isOwner && (
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-slate-600 transition-opacity">
              Editar
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex justify-center items-end gap-3 sm:gap-6 mb-8 px-4 animate-fade-in-up select-none mt-8">
      <div className="flex flex-col items-center order-1 w-[28%] max-w-[110px] transform hover:-translate-y-1 transition-transform">
        <div className="text-xs font-bold text-slate-400 mb-1">#2</div>
        {renderSlot(2, second, "border-slate-300")}
        <p className="text-[10px] font-bold text-slate-600 mt-2 text-center line-clamp-1 h-3">
          {second?.title}
        </p>
      </div>
      <div className="flex flex-col items-center order-2 w-[35%] max-w-[140px] -mb-4 z-10 transform hover:-translate-y-2 transition-transform">
        <div className="text-3xl mb-1 animate-bounce">👑</div>
        {renderSlot(1, first, "border-yellow-400")}
        <p className="text-xs font-black text-slate-800 mt-4 text-center line-clamp-2 h-8 leading-tight px-1">
          {first?.title || "Seu Top 1"}
        </p>
      </div>
      <div className="flex flex-col items-center order-3 w-[28%] max-w-[110px] transform hover:-translate-y-1 transition-transform">
        <div className="text-xs font-bold text-orange-800/50 mb-1">#3</div>
        {renderSlot(3, third, "border-orange-300")}
        <p className="text-[10px] font-bold text-slate-600 mt-2 text-center line-clamp-1 h-3">
          {third?.title}
        </p>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const PublicProfile: React.FC<PublicProfileProps> = ({
  myList,
  userProfile,
}) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isOwner = !userId;

  const [fetchedData, setFetchedData] = useState<{
    profile: UserProfile;
    list: UserSeries[];
  } | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [localSearch, setLocalSearch] = useState("");

  // Estados para Seguir
  const [isFollowing, setIsFollowing] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  // Estados para Modal de Seleção de Top 3
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedRankSlot, setSelectedRankSlot] = useState<number | null>(null);

  const myDataStr = localStorage.getItem("userProfile");
  const myId = myDataStr ? JSON.parse(myDataStr).id : null;

  // Lógica para recarregar a página (forçar atualização visual do Ranking)
  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetch(`http://localhost:3001/api/users/${userId}/full`)
        .then((res) => {
          if (!res.ok) throw new Error("Usuário não encontrado");
          return res.json();
        })
        .then((data) => {
          setFetchedData({
            profile: data.user,
            list: data.myList.map((s: any) => ({
              ...s,
              ranking: Number(s.ranking || 0),
            })),
          });
          setTargetId(data.user.id);

          if (myId) {
            return fetch(
              `http://localhost:3001/api/users/${data.user.id}/is_following?followerId=${myId}`
            );
          }
        })
        .then((res) => (res ? res.json() : null))
        .then((data) => {
          if (data) setIsFollowing(data.isFollowing);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [userId, myId]);

  const handleFollowToggle = async () => {
    if (!targetId || !myId) return;
    try {
      const url = `http://localhost:3001/api/users/${targetId}/follow`;
      const method = isFollowing ? "DELETE" : "POST";
      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: myId }),
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Erro ao seguir:", error);
    }
  };

  // --- Lógica do Modal de Ranking ---
  const openRankingModal = (rank: number) => {
    setSelectedRankSlot(rank);
    setIsSelectionModalOpen(true);
  };

  const handleSelectSeriesForRank = async (seriesId: string) => {
    if (!selectedRankSlot || !myId) return;

    try {
      await fetch(`http://localhost:3001/api/series/${seriesId}/rank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myId, rank: selectedRankSlot }),
      });

      setIsSelectionModalOpen(false);
      refreshPage(); // Recarrega para mostrar a mudança
    } catch (error) {
      console.error("Erro ao atualizar ranking:", error);
    }
  };

  const currentProfile = isOwner ? userProfile : fetchedData?.profile;
  const currentList = isOwner ? myList : fetchedData?.list || [];

  const filteredList = useMemo(() => {
    if (!localSearch.trim()) return currentList;
    return currentList.filter((s) =>
      s.title.toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [currentList, localSearch]);

  const watchingNow = filteredList.filter(
    (s) => s.status === SeriesStatus.WATCHING
  );
  const watchedAll = filteredList.filter(
    (s) => s.status === SeriesStatus.WATCHED
  );

  const getHeaderStyle = () => {
    const themeKey = currentProfile?.coverTheme || "sunset";
    if (THEMES[themeKey]) return {};
    return {
      backgroundImage: `url('${themeKey}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const themeClass =
    THEMES[currentProfile?.coverTheme || "sunset"] || "bg-slate-200";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  if (!currentProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Perfil não encontrado.
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto bg-black/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-black/40 transition-all flex items-center gap-2 group"
        >
          Voltar
        </button>
      </nav>

      {/* Header */}
      <div className="relative bg-white pb-8">
        <div
          className={`h-48 sm:h-64 w-full ${themeClass} relative`}
          style={getHeaderStyle()}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6 gap-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-xl">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full rounded-full object-cover bg-slate-200"
                />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {currentProfile.name}
              </h1>
              {!isOwner && (
                <button
                  onClick={handleFollowToggle}
                  className={`mt-2 px-6 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                    isFollowing
                      ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200"
                      : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-105"
                  }`}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </button>
              )}
              <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
                {currentProfile.bio || "Sem bio."}
              </p>
            </div>

            <div className="flex gap-6 text-center sm:pb-3">
              <div>
                <div className="font-black text-xl text-slate-800">
                  {currentProfile.followersCount || 0}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Seguidores
                </div>
              </div>
              <div>
                <div className="font-black text-xl text-slate-800">
                  {currentProfile.followingCount || 0}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Seguindo
                </div>
              </div>
              <div>
                <div className="font-black text-xl text-slate-800">
                  {watchingNow.length}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Assistindo
                </div>
              </div>
              <div>
                <div className="font-black text-xl text-slate-800">
                  {watchedAll.length}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Vistos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto px-4 w-full mb-12 mt-4">
        {/* Top 3 */}
        <div className="mb-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg text-lg">
              👑
            </span>
            <h2 className="text-xl font-black text-slate-800">Top Favoritos</h2>
          </div>
          {/* AQUI ESTAVA O PROBLEMA: Faltava passar a função openRankingModal */}
          <TopPodium
            seriesList={currentList}
            onSlotClick={openRankingModal}
            isOwner={isOwner}
          />
        </div>

        {/* Listas */}
        <div className="bg-white rounded-2xl p-2 mb-8 flex items-center gap-2 shadow-sm border border-slate-200">
          <span className="text-lg pl-3 text-slate-400">🔍</span>
          <input
            className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400 py-2 bg-transparent"
            placeholder={`Filtrar na lista de ${currentProfile.name}...`}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          {watchingNow.length > 0 && (
            <section>
              <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-rose-500 rounded-full"></span>{" "}
                Assistindo ({watchingNow.length})
              </h3>
              <div className="grid gap-3">
                {watchingNow.map((s) => (
                  <ProfileListCard key={s.id} series={s} />
                ))}
              </div>
            </section>
          )}
          {watchedAll.length > 0 && (
            <section>
              <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>{" "}
                Finalizados ({watchedAll.length})
              </h3>
              <div className="grid gap-3">
                {watchedAll.map((s) => (
                  <ProfileListCard key={s.id} series={s} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* MODAL DE SELEÇÃO DE SÉRIE PARA O TOP 3 */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSelectionModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
              Escolha o Top #{selectedRankSlot}
            </h3>
            <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
              {myList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSeriesForRank(s.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <img
                    src={s.poster || ""}
                    className="w-10 h-14 object-cover rounded bg-slate-200"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">
                      {s.title}
                    </p>
                    {s.ranking && s.ranking > 0 && (
                      <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        Atual Top {s.ranking}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const ProfileListCard: React.FC<{ series: UserSeries }> = ({ series }) => (
  <div className="bg-white p-3 rounded-2xl border border-slate-100 hover:border-rose-100 hover:shadow-md transition-all flex gap-4 items-center group">
    <div className="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
      {series.poster && (
        <img src={series.poster} className="w-full h-full object-cover" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 text-sm truncate">
        {series.title}
      </h4>
      <div className="flex gap-2 mt-1 items-center">
        <StatusBadge status={series.status} />
        {series.ranking > 0 && (
          <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
            Top {series.ranking}
          </span>
        )}
      </div>
    </div>
    {series.personalNote && (
      <div className="hidden sm:block text-xs text-slate-400 italic pr-4 max-w-[200px] truncate border-l border-slate-100 pl-4">
        "{series.personalNote}"
      </div>
    )}
  </div>
);

export default PublicProfile;
