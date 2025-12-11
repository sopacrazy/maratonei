import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, Series, SeriesStatus } from "../types";

interface OnboardingProps {
  user: UserProfile & { id: number };
  onComplete: () => Promise<void> | void;
}

const THEMES = ["sunset", "ocean", "forest", "berry", "midnight", "minimal"];

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados dos dados
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    avatar: user.avatar || "",
    coverTheme: user.coverTheme || "sunset",
  });

  // Busca de Séries
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Passo 1: Atualizar Perfil
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setStep(2);
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
    } finally {
      setLoading(false);
    }
  };

  // Passo 2 (Tema)
  const handleThemeSelect = (theme: string) => {
    setFormData((prev) => ({ ...prev, coverTheme: theme }));
  };

  // --- BUSCA AUTOMÁTICA (DEBOUNCE) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchSeries(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchSeries = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch("http://localhost:3001/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });

      const data = await res.json();
      const resultsArray = data.results || [];

      if (Array.isArray(resultsArray)) {
        const formatted = resultsArray.map((item: any) => ({
          ...item,
          // Garante que o ID seja string para comparação segura
          id: item.id ? item.id.toString() : `${item.title}-${item.year}`,
        }));
        setSearchResults(formatted.filter((s: any) => s.poster));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro na busca", error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // Verifica pelo ID. Se já existe, remove. Se não existe, adiciona.
  const toggleSeries = (series: Series) => {
    const exists = selectedSeries.find((s) => s.id === series.id);

    if (exists) {
      // Remove da lista (Desmarca)
      setSelectedSeries(selectedSeries.filter((s) => s.id !== series.id));
    } else {
      // Adiciona à lista (Marca)
      setSelectedSeries([
        ...selectedSeries,
        { ...series, status: SeriesStatus.WATCHING },
      ]);
    }
  };

  // --- FINALIZAR ---
  const handleFinish = async () => {
    setLoading(true);

    try {
      // 1. Garante que o tema foi salvo
      await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 2. Salva as séries escolhidas
      // Aqui poderias mandar um array único para o backend se quisesses otimizar,
      // mas o loop funciona bem para poucas séries.
      for (const series of selectedSeries) {
        await fetch("http://localhost:3001/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            series: series,
          }),
        });
      }

      // 3. ATUALIZA O APP
      await onComplete();

      // 4. Vai pra Home
      navigate("/");
    } catch (error) {
      console.error("Erro ao finalizar", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      {/* Barra de Progresso */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${
              step >= i ? "text-rose-500 font-bold" : "text-slate-300"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= i ? "border-rose-500 bg-rose-50" : "border-slate-200"
              }`}
            >
              {i}
            </div>
            <span className="hidden sm:inline">
              {i === 1 ? "Perfil" : i === 2 ? "Estilo" : "Séries"}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-6 sm:p-8 animate-fade-in">
        {/* PASSO 1: PERFIL */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Quem é você na fila do streaming?
            </h2>

            <div className="relative w-32 h-32 mx-auto">
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-slate-100"
              />
            </div>

            <div className="text-left space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Apelido
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Uma frase sobre você (Bio)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-all"
                  placeholder="Ex: Viciado em reviravoltas..."
                  rows={3}
                />
              </div>
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={!formData.bio || loading}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              {loading ? "Salvando..." : "Próximo"}
            </button>
          </div>
        )}

        {/* PASSO 2: TEMA */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Escolha a vibe do seu perfil
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((theme) => (
                <div
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  className={`h-24 rounded-xl cursor-pointer border-4 transition-all ${
                    formData.coverTheme === theme
                      ? "border-rose-500 scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundImage: theme === "minimal" ? "none" : "",
                    backgroundColor: theme === "minimal" ? "#334155" : "",
                  }}
                >
                  <div
                    className={`h-full w-full rounded-lg bg-gradient-to-br ${
                      theme === "sunset"
                        ? "from-rose-500 to-yellow-500"
                        : theme === "ocean"
                        ? "from-blue-500 to-teal-400"
                        : theme === "forest"
                        ? "from-emerald-600 to-lime-400"
                        : theme === "berry"
                        ? "from-fuchsia-600 to-pink-400"
                        : theme === "midnight"
                        ? "from-slate-900 to-purple-900"
                        : ""
                    }`}
                  ></div>
                  <span className="text-xs font-bold uppercase mt-1 block text-slate-400">
                    {theme}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-6 hover:bg-slate-800 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* PASSO 3: SÉRIES */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Para começar...
              </h2>
              <p className="text-slate-500">
                Adicione pelo menos 3 séries que você ama.
              </p>
              <div
                className={`mt-2 font-bold text-lg ${
                  selectedSeries.length >= 3
                    ? "text-green-500"
                    : "text-rose-500"
                }`}
              >
                {selectedSeries.length} / 3 Selecionadas
              </div>
            </div>

            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome da série..."
                className="w-full p-4 pl-12 border border-slate-200 rounded-2xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-lg"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                🔍
              </span>
              {isSearching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 animate-pulse font-bold">
                  Buscando...
                </span>
              )}
            </div>

            {/* Grid de Resultados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
              {searchResults.length === 0 &&
                searchQuery.length > 2 &&
                !isSearching && (
                  <div className="col-span-full text-center py-8 text-slate-400">
                    Nada encontrado. Tente outro nome.
                  </div>
                )}

              {searchResults.map((s) => {
                // CORREÇÃO: Verifica se JÁ EXISTE pelo ID
                const isSelected = selectedSeries.some(
                  (item) => item.id === s.id
                );

                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSeries(s)}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                      isSelected
                        ? "ring-4 ring-rose-500 scale-95"
                        : "hover:scale-105 hover:shadow-lg"
                    }`}
                  >
                    <div className="aspect-[2/3] w-full bg-slate-200 relative">
                      {s.poster ? (
                        <img
                          src={s.poster}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-slate-400 font-bold">
                          Sem Capa
                        </div>
                      )}

                      {/* Overlay de Seleção */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-rose-500/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-white font-bold text-3xl shadow-sm">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-6">
                      <p className="text-white text-xs font-bold truncate text-center">
                        {s.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleFinish}
              disabled={selectedSeries.length < 3 || loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:bg-slate-300 transition-all text-lg shadow-lg shadow-green-500/20 mt-4 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Finalizando..." : "Finalizar e Entrar! 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
