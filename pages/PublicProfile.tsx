import React, { useState, useEffect, useMemo } from "react";
import { UserSeries, SeriesStatus, GuestComment, UserProfile } from "../types";
import StatusBadge from "../components/StatusBadge";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";

interface PublicProfileProps {
  myList: UserSeries[];
  userProfile: UserProfile;
}

// --- CONSTANTES DE TEMA (Para garantir que funcionem) ---
const THEMES: Record<string, string> = {
  sunset: "bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500",
  ocean: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",
  forest: "bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400",
  berry: "bg-gradient-to-br from-fuchsia-600 via-purple-500 to-pink-400",
  midnight: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  minimal: "bg-slate-800",
};

// --- PODIUM COMPONENT (Editável) ---
const TopPodium: React.FC<{
  seriesList: UserSeries[];
  onSlotClick: (rank: number) => void;
  isOwner: boolean;
}> = ({ seriesList, onSlotClick, isOwner }) => {
  // Busca as séries pelo número do ranking salvo no banco
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
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
          {isOwner ? (
            <span className="text-3xl opacity-50">+</span>
          ) : (
            <span className="text-sm font-bold opacity-30">Vazio</span>
          )}
        </div>
      )}

      {/* Hover Overlay para Edição */}
      {isOwner && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-bold text-[10px] uppercase tracking-wider border border-white/50 px-2 py-1 rounded-full backdrop-blur-sm">
            Editar Top {rank}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex justify-center items-end gap-3 sm:gap-6 mb-8 px-4 animate-fade-in-up select-none mt-8">
      {/* 2º LUGAR */}
      <div className="flex flex-col items-center order-1 w-[28%] max-w-[110px] transform hover:-translate-y-1 transition-transform">
        <div className="text-xs font-bold text-slate-400 mb-1">#2</div>
        {renderSlot(2, second, "border-slate-300")}
        <p className="text-[10px] font-bold text-slate-600 mt-2 text-center line-clamp-1 h-3">
          {second?.title || ""}
        </p>
      </div>

      {/* 1º LUGAR */}
      <div className="flex flex-col items-center order-2 w-[35%] max-w-[140px] -mb-4 z-10 transform hover:-translate-y-2 transition-transform">
        <div className="text-3xl mb-1 animate-bounce">👑</div>
        {renderSlot(1, first, "border-yellow-400")}
        <div className="mt-[-0.8rem] z-20 bg-yellow-400 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md border-2 border-white">
          TOP 1
        </div>
        <p className="text-xs font-black text-slate-800 mt-2 text-center line-clamp-2 h-8 leading-tight px-1">
          {first?.title || "Escolher Favorito"}
        </p>
      </div>

      {/* 3º LUGAR */}
      <div className="flex flex-col items-center order-3 w-[28%] max-w-[110px] transform hover:-translate-y-1 transition-transform">
        <div className="text-xs font-bold text-orange-800/50 mb-1">#3</div>
        {renderSlot(3, third, "border-orange-300")}
        <p className="text-[10px] font-bold text-slate-600 mt-2 text-center line-clamp-1 h-3">
          {third?.title || ""}
        </p>
      </div>
    </div>
  );
};

// --- MODAL DE SELEÇÃO ---
const SelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  slot: number;
  list: UserSeries[];
  onSelect: (series: UserSeries) => void;
}> = ({ isOpen, onClose, slot, list, onSelect }) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = list.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col relative z-10 shadow-2xl animate-fade-in-up">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-xl">🏆</span> Escolher Top {slot}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <input
            autoFocus
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium transition-all"
            placeholder="Buscar na sua lista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <div className="text-4xl mb-2">🕵️‍♀️</div>
              <p className="text-sm">Nenhuma série encontrada.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group text-left border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-14 bg-slate-200 rounded-md overflow-hidden shrink-0 shadow-sm">
                  {s.poster ? (
                    <img
                      src={s.poster}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-700 text-sm group-hover:text-rose-600 truncate">
                    {s.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {s.year} • {s.status}
                  </span>
                </div>
                {s.ranking === slot && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    Selecionado
                  </span>
                )}
              </button>
            ))
          )}
        </div>
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
  const isGuestView = Boolean(userId);

  // Estado Local
  const [localList, setLocalList] = useState<UserSeries[]>(myList);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState("");

  // Sync props (CRÍTICO: Garante que os dados do banco atualizem a tela)
  useEffect(() => {
    if (myList && myList.length > 0) {
      const sanitized = myList.map((s) => ({
        ...s,
        ranking: Number(s.ranking || 0),
      }));
      setLocalList(sanitized);
    }
  }, [myList]);

  // Função para salvar o ranking
  const handleSelectSeriesForSlot = async (series: UserSeries) => {
    if (editingSlot === null) return;

    // 1. Atualização Otimista (Visual instantâneo)
    const updatedList = localList.map((s) => {
      // Se alguma série já tinha esse rank, remove
      if (s.ranking === editingSlot) return { ...s, ranking: 0 };
      // Define o rank na nova série
      if (s.id === series.id) return { ...s, ranking: editingSlot };
      return s;
    });

    setLocalList(updatedList);
    setEditingSlot(null);

    // 2. Persistir no Banco
    if (!isGuestView) {
      try {
        // Pega ID real do usuário salvo no login
        const savedProfile = localStorage.getItem("userProfile");
        const realUserId = savedProfile ? JSON.parse(savedProfile).id : null;

        if (realUserId) {
          await fetch(`http://localhost:3001/api/series/${series.id}/rank`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: realUserId, rank: editingSlot }),
          });
        }
      } catch (error) {
        console.error("Erro ao salvar ranking:", error);
        // Opcional: Reverter estado em caso de erro
      }
    }
  };

  // Mock dados para visitante
  const displayData = useMemo(() => {
    if (userId) {
      // Simulação para visitante
      return {
        profile: {
          name: "Visitante",
          bio: "Perfil público",
          avatar: "",
          coverTheme: "midnight",
        } as UserProfile,
        list: [],
      };
    }
    return { profile: userProfile, list: localList };
  }, [userId, userProfile, localList]);

  const { profile: currentProfile, list: currentList } = displayData;

  // Filtros
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

  // Lógica de Capa Robusta
  const getHeaderStyle = () => {
    const themeKey = currentProfile.coverTheme || "sunset";

    // Se for um tema predefinido (gradiente)
    if (THEMES[themeKey]) {
      // Retornamos vazio aqui e usamos className no elemento,
      // mas para inline style precisamos setar o background ou deixar nulo
      return {};
    }

    // Se for URL customizada
    if (themeKey.startsWith("http") || themeKey.startsWith("data:")) {
      return {
        backgroundImage: `url('${themeKey}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    // Fallback
    return {};
  };

  // Classe CSS do tema
  const themeClass =
    THEMES[currentProfile.coverTheme || "sunset"] ||
    "bg-gradient-to-r from-rose-400 to-orange-400"; // Fallback visual

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto bg-black/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-black/40 transition-all flex items-center gap-2 group"
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
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </button>
      </nav>

      {/* === CAPA (HEADER) === */}
      {/* Removemos a margem negativa excessiva e o box flutuante estranho */}
      <div className="relative bg-white pb-8">
        {/* Imagem/Gradiente de Fundo */}
        <div
          className={`h-48 sm:h-64 w-full ${themeClass} relative`}
          style={getHeaderStyle()}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Informações do Perfil (Avatar + Texto) */}
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6 gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-xl">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full rounded-full object-cover bg-slate-200"
                />
              </div>
              {!isGuestView && (
                <button
                  onClick={() => navigate("/settings")}
                  className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                  title="Editar Perfil"
                >
                  <svg
                    className="w-3 h-3"
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
                </button>
              )}
            </div>

            {/* Texto (Nome e Bio) - Agora alinhado, não flutuando */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {currentProfile.name}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1 max-w-md">
                {currentProfile.bio || "Adicione uma bio nas configurações."}
              </p>
            </div>

            {/* Stats Rápidos */}
            <div className="flex gap-6 text-center sm:pb-3">
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
        {/* --- PÓDIO EDITÁVEL --- */}
        <div className="mb-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg text-lg">
              👑
            </span>
            <h2 className="text-xl font-black text-slate-800">Top Favoritos</h2>
          </div>
          <p className="text-center text-xs text-slate-400 mb-6">
            {!isGuestView
              ? "Toque nos cards para escolher suas favoritas"
              : "As favoritas do usuário"}
          </p>

          <TopPodium
            seriesList={localList}
            onSlotClick={(slot) => setEditingSlot(slot)}
            isOwner={!isGuestView}
          />
        </div>

        {/* Listas e Filtros */}
        <div className="bg-white rounded-2xl p-2 mb-8 flex items-center gap-2 shadow-sm border border-slate-200">
          <span className="text-lg pl-3 text-slate-400">🔍</span>
          <input
            className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400 py-2 bg-transparent"
            placeholder="Filtrar nesta lista..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          {watchingNow.length > 0 && (
            <section>
              <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-rose-500 rounded-full"></span>
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
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
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

      <Footer />

      {/* MODAL DE SELEÇÃO */}
      <SelectionModal
        isOpen={editingSlot !== null}
        onClose={() => setEditingSlot(null)}
        slot={editingSlot || 0}
        list={localList}
        onSelect={handleSelectSeriesForSlot}
      />
    </div>
  );
};

// Componente simples para a lista (Design Limpo)
const ProfileListCard: React.FC<{ series: UserSeries }> = ({ series }) => (
  <div className="bg-white p-3 rounded-2xl border border-slate-100 hover:border-rose-100 hover:shadow-md transition-all flex gap-4 items-center group">
    <div className="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
      {series.poster ? (
        <img
          src={series.poster}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : null}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 text-sm truncate">
        {series.title}
      </h4>
      <div className="flex gap-2 mt-1 items-center">
        <StatusBadge status={series.status} />
        {series.ranking && series.ranking > 0 && (
          <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold border border-yellow-200 flex items-center gap-1">
            <span>👑</span> Top {series.ranking}
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
