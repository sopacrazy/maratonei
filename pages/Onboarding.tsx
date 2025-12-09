//
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, Series, SeriesStatus } from "../types";

interface OnboardingProps {
  user: UserProfile & { id: number };
  // Alteração aqui: permitimos que retorne uma Promise para podermos usar await
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

  // Passo 3: Buscar Série
  const searchSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      const resultsArray = data.results || [];

      if (Array.isArray(resultsArray)) {
        const formatted = resultsArray.map((item: any) => ({
          ...item,
          id: item.id ? item.id.toString() : `${item.title}-${item.year}`,
        }));
        setSearchResults(formatted);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro na busca", error);
    } finally {
      setLoading(false);
    }
  };

  const addSeries = (series: Series) => {
    if (!selectedSeries.find((s) => s.title === series.title)) {
      setSelectedSeries([
        ...selectedSeries,
        { ...series, status: SeriesStatus.WATCHING },
      ]);
    }
  };

  // --- FINALIZAR (A CORREÇÃO ESTÁ AQUI) ---
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

      // 3. ATUALIZA O APP E ESPERA TERMINAR ANTES DE NAVEGAR
      await onComplete();

      // 4. Agora sim, vai pra Home
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

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-8 animate-fade-in">
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
                Adicione pelo menos 3 séries que você ama ou está vendo.
              </p>
              <div
                className={`mt-2 font-bold text-lg ${
                  selectedSeries.length >= 3
                    ? "text-green-500"
                    : "text-rose-500"
                }`}
              >
                {selectedSeries.length} / 3 Adicionadas
              </div>
            </div>

            <form onSubmit={searchSeries} className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar série (ex: The Last of Us)..."
                className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-500 text-white px-6 rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? "..." : "Buscar"}
              </button>
            </form>

            {/* Resultados da Busca */}
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((s) => (
                <div
                  key={s.id}
                  onClick={() => addSeries(s)}
                  className="p-2 border rounded-lg cursor-pointer hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                >
                  {/* IMAGEM DA CAPA (POSTER) */}
                  <div className="w-10 h-14 bg-slate-200 rounded shrink-0 overflow-hidden relative">
                    {s.poster ? (
                      <img
                        src={s.poster}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500 font-bold bg-slate-100 text-center p-1">
                        SEM FOTO
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate text-slate-800">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.year}</div>
                  </div>
                  <span className="ml-auto text-green-500 font-bold bg-green-50 p-1 rounded-md shadow-sm">
                    +
                  </span>
                </div>
              ))}
            </div>

            {/* Lista Selecionada */}
            {selectedSeries.length > 0 && (
              <div className="border-t border-slate-100 pt-4 animate-fade-in">
                <h4 className="font-bold text-sm mb-2 text-slate-600">
                  Sua seleção:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeries.map((s) => (
                    <span
                      key={s.id}
                      className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in"
                    >
                      {s.title}
                      <button
                        onClick={() =>
                          setSelectedSeries((prev) =>
                            prev.filter((i) => i.id !== s.id)
                          )
                        }
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={selectedSeries.length < 3 || loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:bg-slate-300 transition-all text-lg shadow-lg shadow-green-500/20 mt-4 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Finalizando...
                </>
              ) : (
                "Finalizar e Entrar! 🚀"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
