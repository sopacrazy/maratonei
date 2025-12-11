import React, { useState, useEffect, useMemo } from "react";
import { UserSeries, SeriesStatus, UserProfile, UserBadge } from "../types";
import StatusBadge from "../components/StatusBadge";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";

// --- MOCK DATA PARA GRUPOS ---
const GROUPS_META = [
  {
    name: "Recomendadas",
    icon: "💎",
    key: "RECOMMENDED",
    minRating: 4,
    maxRating: 5,
  },
  {
    name: "Passatempo OK",
    icon: "🤷",
    key: "GOOD_ENOUGH",
    minRating: 3,
    maxRating: 3,
  },
  {
    name: "Perdi meu tempo",
    icon: "👹",
    key: "WORST",
    minRating: 1,
    maxRating: 2,
  },
];

// MOCK LOCAL DO SELO (Apenas para estrutura)
const MOCK_BADGES: UserBadge[] = [
  {
    key: "FIRST_5_POSTS",
    title: "Maratonista Iniciante",
    description: "Publicou seu 5º post na timeline.",
    image: "/selo.png",
  },
];

interface PublicProfileProps {
  myList: UserSeries[];
  userProfile: UserProfile;
}

const THEMES: Record<string, string> = {
  sunset: "bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500",
  ocean: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",
  forest: "bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400",
  berry: "bg-gradient-to-br from-fuchsia-600 via-purple-500 to-pink-400",
  midnight: "linear-gradient(to right, #0f172a, #581c87, #0f172a)",
  minimal: "bg-slate-800",
};

// --- PODIUM COMPONENT (Não alterado) ---
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

  const [isFollowing, setIsFollowing] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedRankSlot, setSelectedRankSlot] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // NOVOS ESTADOS PARA SEGUIDORES E GRUPOS
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  // >> 1. ESTADO PARA SELOS REAIS
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);

  const myDataStr = localStorage.getItem("userProfile");
  const myId = myDataStr ? JSON.parse(myDataStr).id : null;

  const refreshPage = () => {
    window.location.reload();
  };

  // Função para buscar listas de seguidores (Nova)
  const fetchFollowLists = async (targetId: number) => {
    try {
      const followersRes = await fetch(
        `http://72.61.57.51:3001/api/users/${targetId}/followers`
      );
      const followingRes = await fetch(
        `http://72.61.57.51:3001/api/users/${targetId}/following`
      );
      if (followersRes.ok) setFollowersList(await followersRes.json());
      if (followingRes.ok) setFollowingList(await followingRes.json());
    } catch (error) {
      console.error("Erro ao buscar listas de seguidores:", error);
    }
  };

  // >> FUNÇÃO PARA BUSCAR SELOS
  const fetchUserBadges = async (targetId: number) => {
    try {
      const badgesRes = await fetch(
        `http://72.61.57.51:3001/api/users/${targetId}/badges`
      );
      if (badgesRes.ok) {
        const earnedBadges = await badgesRes.json();
        // Mapeia para o formato UserBadge (contém apenas a chave e a data)
        setUserBadges(
          earnedBadges.map((b: any) => ({
            key: b.badge_key,
            title: "", // Será preenchido no modal
            description: "", // Será preenchido no modal
            image: "", // Será preenchido no modal
            awarded_at: b.awarded_at,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao buscar selos:", error);
      setUserBadges([]);
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      let fetchedProfileId: number;
      fetch(`http://72.61.57.51:3001/api/users/${userId}/full`)
        .then((res) => {
          if (!res.ok) throw new Error("Usuário não encontrado");
          return res.json();
        })
        .then((data) => {
          fetchedProfileId = data.user.id;
          setFetchedData({
            profile: data.user,
            list: data.myList.map((s: any) => ({
              ...s,
              ranking: Number(s.ranking || 0),
            })),
          });
          setTargetId(fetchedProfileId);

          // Buscar listas de seguidores
          fetchFollowLists(fetchedProfileId);
          // >> 2A. BUSCA DE SELOS PARA PERFIL EXTERNO
          fetchUserBadges(fetchedProfileId);

          if (myId) {
            return fetch(
              `http://72.61.57.51:3001/api/users/${data.user.id}/is_following?followerId=${myId}`
            );
          }
        })
        .then((res) => (res ? res.json() : null))
        .then((data) => {
          if (data) setIsFollowing(data.isFollowing);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (isOwner && userProfile.id) {
      // Se for o proprietário, buscar as próprias listas
      fetchFollowLists(userProfile.id);
      // >> 2B. BUSCA DE SELOS PARA PERFIL PROPRIETÁRIO
      fetchUserBadges(userProfile.id);
    }
  }, [userId, myId, isOwner, userProfile.id]);

  const handleFollowToggle = async () => {
    if (!targetId || !myId) return;
    try {
      const url = `http://72.61.57.51:3001/api/users/${targetId}/follow`;
      const method = isFollowing ? "DELETE" : "POST";
      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: myId }),
      });
      setIsFollowing(!isFollowing);
      // Atualizar contagens e listas após a ação
      refreshPage();
    } catch (error) {
      console.error("Erro ao seguir:", error);
    }
  };

  const openRankingModal = (rank: number) => {
    setSelectedRankSlot(rank);
    setIsSelectionModalOpen(true);
  };

  const handleSelectSeriesForRank = async (seriesId: string) => {
    if (!selectedRankSlot || !myId) return;
    try {
      await fetch(`http://72.61.57.51:3001/api/series/${seriesId}/rank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myId, rank: selectedRankSlot }),
      });
      setIsSelectionModalOpen(false);
      refreshPage();
    } catch (error) {
      console.error("Erro ao atualizar ranking:", error);
    }
  };

  const currentProfile = isOwner ? userProfile : fetchedData?.profile;
  const currentList = isOwner ? myList : fetchedData?.list || [];

  // Lógica para verificar se é oficial (ajuste o ID ou Nome conforme sua preferência)
  const isOfficial =
    currentProfile?.id === 16 || currentProfile?.name === "Maratonei";

  // --- LÓGICA DE PARTILHA ---
  const getShareUrl = () => {
    if (userId) return window.location.href;
    const baseUrl = window.location.origin;
    const safeIdentifier = currentProfile?.name
      ? currentProfile.name.toLowerCase().replace(/\s+/g, "")
      : currentProfile?.id;
    return `${baseUrl}/#/profile/${safeIdentifier}`;
  };

  const shareLink = getShareUrl();
  const shareMessage = `Vem ver minhas séries favoritas e o que estou assistindo no Maratonei! 🍿🎬`;
  const encodedShareLink = encodeURIComponent(shareLink);
  const encodedShareText = encodeURIComponent(shareMessage);

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${currentProfile?.name}`,
          text: shareMessage,
          url: shareLink,
        });
      } catch (err) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyLink = (platform: string) => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(`Link copiado! Cole no ${platform}`);
    setTimeout(() => setCopySuccess(""), 3000);
  };

  const whatsappLink = `http://wa.me/?text=${encodedShareText}%20${encodedShareLink}`;
  const messengerLink = `fb-messenger://share/?link=${encodedShareLink}`;

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

  // --- LÓGICA DE FILTRAGEM DOS GRUPOS (Baseado no Rating 1-5) ---
  const getGroupSeries = (key: string): UserSeries[] => {
    const group = GROUPS_META.find((g) => g.key === key);
    if (!group) return [];

    return currentList.filter(
      (s) =>
        s.rating !== undefined &&
        s.rating >= group.minRating &&
        s.rating <= group.maxRating
    );
  };

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
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 gap-6">
            {/* AVATAR: Sobe sozinho com margem negativa */}
            <div className="relative -mt-16 sm:-mt-20 shrink-0 z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-white shadow-xl">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full rounded-full object-cover bg-slate-200"
                />
              </div>
            </div>

            {/* INFO DO USUÁRIO: Fica no fluxo normal (fundo branco) */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
              {/* --- BOTÕES DE AÇÃO --- */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                {!isOwner && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                      isFollowing
                        ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200"
                        : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-105"
                    }`}
                  >
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </button>
                )}

                {/* BOTÃO COMPARTILHAR (APENAS ÍCONE) */}
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  title="Compartilhar Perfil"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z" />
                  </svg>
                </button>

                {/* BOTÃO SELOS (IMAGEM selo.png) */}
                <button
                  onClick={() => setIsBadgesModalOpen(true)}
                  className="p-2 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  title="Meus Selos de Conquista"
                >
                  <img
                    src="/selo.png"
                    alt="Selo de Conquista"
                    className="w-[18px] h-[18px] object-contain"
                  />
                </button>
              </div>

              {/* --- NOME COM SELO OFICIAL --- */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight">
                  {currentProfile.name}
                </h1>
                {isOfficial && (
                  <img
                    src="/selo1.png"
                    alt="Oficial"
                    className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse"
                    title="Perfil Oficial Maratonei"
                  />
                )}
              </div>

              {/* BIO */}
              <p className="text-slate-500 font-medium text-sm mt-3 max-w-md mx-auto sm:mx-0 leading-relaxed">
                {currentProfile.bio || "Sem bio."}
              </p>

              {/* STATUS ESTATÍSTICAS (Clicáveis para abrir o Modal) */}
              <div className="flex justify-center sm:justify-start gap-6 mt-6">
                <button
                  onClick={() => setIsFollowModalOpen(true)}
                  className="text-center sm:text-left cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -m-2"
                >
                  <div className="font-black text-xl text-slate-800">
                    {currentProfile.followersCount || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Seguidores
                  </div>
                </button>
                <button
                  onClick={() => setIsFollowModalOpen(true)}
                  className="text-center sm:text-left cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -m-2"
                >
                  <div className="font-black text-xl text-slate-800">
                    {currentProfile.followingCount || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Seguindo
                  </div>
                </button>
                <div className="text-center sm:text-left">
                  <div className="font-black text-xl text-slate-800">
                    {watchingNow.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Assistindo
                  </div>
                </div>
                <div className="text-center sm:text-left">
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
          <TopPodium
            seriesList={currentList}
            onSlotClick={openRankingModal}
            isOwner={isOwner}
          />
        </div>

        {/* --- NOVOS GRUPOS DE SÉRIES --- */}
        <div className="mb-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-4 text-center">
            Meu Guia de Séries
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {GROUPS_META.map((group) => (
              <button
                key={group.key}
                onClick={() =>
                  setExpandedGroup(
                    expandedGroup === group.key ? null : group.key
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md ${
                  expandedGroup === group.key
                    ? "bg-rose-600 text-white shadow-rose-500/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                disabled={getGroupSeries(group.key).length === 0}
                title={
                  getGroupSeries(group.key).length === 0
                    ? "Adicione séries com essa nota!"
                    : undefined
                }
              >
                {group.icon} {group.name} ({getGroupSeries(group.key).length})
                {getGroupSeries(group.key).length > 0 &&
                  (expandedGroup === group.key ? " ▼" : " ►")}
              </button>
            ))}
          </div>

          {/* Conteúdo Expansível do Grupo */}
          {expandedGroup && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl animate-fade-in-up">
              <h4 className="font-bold text-slate-800 mb-3">
                Séries em "
                {GROUPS_META.find((g) => g.key === expandedGroup)?.name}"
              </h4>
              <div className="grid gap-3">
                {getGroupSeries(expandedGroup).map((s) => (
                  <ProfileListCard key={s.id} series={s} />
                ))}
              </div>
              {getGroupSeries(expandedGroup).length === 0 && (
                <p className="text-sm text-slate-400">
                  Nenhuma série classificada neste grupo.
                </p>
              )}
            </div>
          )}
        </div>
        {/* --- FIM NOVOS GRUPOS DE SÉRIES --- */}

        {/* Listas (Watching / Watched) */}
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

      {/* MODAL DE RANKING (NÃO ALTERADO) */}
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
                      <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-bold">
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

      {/* MODAL DE COMPARTILHAMENTO (NÃO ALTERADO) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setIsShareModalOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-fade-in-up">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Compartilhar Perfil
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>

            {copySuccess && (
              <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold text-center animate-fade-in">
                {copySuccess}
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs text-slate-500 break-all border border-slate-100 text-center">
              {shareLink}
            </div>

            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold">WhatsApp</span>
                  <span className="text-xs opacity-70">Enviar mensagem</span>
                </div>
              </a>

              {/* Messenger */}
              <a
                href={messengerLink}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[#0084FF]/10 text-[#0084FF] hover:bg-[#0084FF]/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.639.639 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.639.639 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76zm5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold">Messenger</span>
                  <span className="text-xs opacity-70">Abrir app</span>
                </div>
              </a>

              {/* Instagram (Copy Link) */}
              <button
                onClick={() => copyLink("Instagram")}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.232-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold">Instagram</span>
                  <span className="text-xs opacity-70">
                    Copiar link para Stories
                  </span>
                </div>
              </button>

              {/* Copiar Link Genérico */}
              <button
                onClick={() => copyLink("Area de Transferência")}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xl shadow-sm group-hover:bg-slate-300 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold">Copiar Link</span>
                  <span className="text-xs opacity-70">Para outras redes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL DE SEGUIDORES/SEGUINDO */}
      {isFollowModalOpen && (
        <FollowersModal
          onClose={() => setIsFollowModalOpen(false)}
          followers={followersList}
          following={followingList}
          profileName={currentProfile?.name || "Usuário"}
        />
      )}

      {/* NOVO MODAL DE SELOS (Mock Simples) */}
      {isBadgesModalOpen && (
        <BadgesModal
          onClose={() => setIsBadgesModalOpen(false)}
          // >> 3. ALTERADO: Passa a lista dinâmica 'userBadges' para o modal
          badges={userBadges}
        />
      )}

      <Footer />
    </div>
  );
};

// --- NOVO COMPONENTE: MODAL DE SEGUIDORES/SEGUINDO ---
const FollowersModal: React.FC<{
  onClose: () => void;
  followers: any[];
  following: any[];
  profileName: string;
}> = ({ onClose, followers, following, profileName }) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    "followers"
  );

  const list = activeTab === "followers" ? followers : following;
  const title =
    activeTab === "followers"
      ? `Seguidores de ${profileName}`
      : `Seguindo por ${profileName}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "followers"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Seguidores ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "following"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Seguindo ({following.length})
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3">
          {list.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-6">
              Ninguém nesta lista.
            </div>
          ) : (
            list.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"
              >
                <img
                  src={user.avatar}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  alt={user.name}
                />
                <span className="font-bold text-sm text-slate-800">
                  {user.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODAL DE SELOS (Com lógica de unificação de dados) ---
const BadgesModal: React.FC<{ onClose: () => void; badges: UserBadge[] }> = ({
  onClose,
  badges,
}) => {
  // >> 4. METADATA COMPLETA LOCAL (Ajustado o caminho da imagem)
  const BADGE_MAP_LOCAL: Record<string, Omit<UserBadge, "key">> = {
    FIRST_5_POSTS: {
      title: "Maratonista Iniciante",
      description: "Publicou 5 posts.",
      // Usando 'post.png' que é o nome do arquivo definido no backend anterior
      image: "/post.png",
    },
    // Adicione a metadata de outros selos aqui
  };

  const allPossibleBadges = Object.entries(BADGE_MAP_LOCAL).map(
    ([key, metadata]) => ({
      key,
      ...metadata,
    })
  );

  const mergedBadges = allPossibleBadges.map((possible) => {
    // Busca a chave do selo conquistado na lista que veio do backend
    const earned = badges.find((b) => b.key === possible.key);
    return {
      ...possible,
      earned: !!earned,
    };
  });

  const renderBadge = (item: (typeof mergedBadges)[0]) => (
    <div
      key={item.key}
      className={`relative w-full aspect-square transition-all group cursor-pointer overflow-hidden`}
    >
      <div
        className={`w-full h-full flex items-center justify-center transition-all rounded-xl shadow-md ${
          !item.earned
            ? "bg-slate-100 opacity-60"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        <img
          // Usa a propriedade 'image' do BADGE_MAP_LOCAL
          src={item.image}
          alt={item.title}
          className={`w-full h-full object-contain transition-transform`}
        />
      </div>

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
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
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
        {mergedBadges.length === 0 ? (
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
