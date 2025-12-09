import React, { useState, useEffect, useMemo } from "react";
import { UserSeries } from "../types";

interface TrendingSeries {
  id: number;
  title: string;
  count: number;
  poster: string | null;
  trend: "up" | "down" | "stable";
}

interface TrendingRankingProps {
  myList?: UserSeries[];
}

const TrendingRanking: React.FC<TrendingRankingProps> = ({ myList = [] }) => {
  const [viewMode, setViewMode] = useState<"global" | "personal">("global");
  const [globalTrending, setGlobalTrending] = useState<TrendingSeries[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca o Ranking Real do Servidor
  useEffect(() => {
    if (viewMode === "global") {
      setLoading(true);
      fetch("http://localhost:3001/api/trending")
        .then((res) => res.json())
        .then((data) => setGlobalTrending(data))
        .catch((err) => console.error("Erro ao buscar ranking:", err))
        .finally(() => setLoading(false));
    }
  }, [viewMode]);

  // Lógica para gerar o Ranking Pessoal (Local)
  const personalRanking = useMemo(() => {
    if (!myList || myList.length === 0) return [];

    const sorted = [...myList].sort((a, b) => {
      // Prioridade: Ranking definido pelo usuário > Status > Data
      if (a.ranking && b.ranking && a.ranking > 0 && b.ranking > 0)
        return a.ranking - b.ranking;
      if (a.ranking && a.ranking > 0) return -1;
      if (b.ranking && b.ranking > 0) return 1;
      return b.addedAt - a.addedAt;
    });

    return sorted.slice(0, 5).map((series, index) => ({
      id: Number(series.id), // Casting simples para manter tipagem
      title: series.title,
      count: series.ranking || 0, // Usa o ranking ou 0
      poster: series.poster || null,
      trend: "stable" as const,
    }));
  }, [myList]);

  const displayList = viewMode === "global" ? globalTrending : personalRanking;

  return (
    // CORREÇÃO: Removido 'sticky top-24' para evitar sobreposição
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span
            className={`p-2 rounded-lg text-lg transition-colors ${
              viewMode === "global"
                ? "bg-orange-100 text-orange-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {viewMode === "global" ? "🔥" : "🏆"}
          </span>
          <h3 className="font-bold text-slate-800 text-lg">
            {viewMode === "global" ? "Em Alta" : "Meus Tops"}
          </h3>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("global")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === "global"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setViewMode("personal")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === "personal"
                ? "bg-white text-rose-500 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Meus
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Carregando ranking...
          </div>
        ) : displayList.length > 0 ? (
          displayList.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {/* Posição */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-600"
                    : index === 1
                    ? "bg-slate-200 text-slate-600"
                    : index === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {index + 1}
              </div>

              {/* Capa Pequena */}
              <div className="w-10 h-14 bg-slate-200 rounded-md overflow-hidden shrink-0 shadow-sm">
                {item.poster ? (
                  <img
                    src={item.poster}
                    className="w-full h-full object-cover"
                    alt={item.title}
                  />
                ) : null}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-slate-800 text-xs truncate group-hover:text-rose-500 transition-colors"
                  title={item.title}
                >
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                  {viewMode === "global" ? (
                    <span>{item.count} usuários</span>
                  ) : (
                    <span>
                      {item.count > 0 ? `Top ${item.count}` : "Na lista"}
                    </span>
                  )}
                </div>
              </div>

              {/* Seta de Tendência (Só no Global) */}
              {viewMode === "global" && (
                <div className="text-xs opacity-50">
                  {index < 2 ? (
                    <span className="text-green-500">▲</span>
                  ) : (
                    <span className="text-slate-300">=</span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            {viewMode === "global"
              ? "Nenhuma série popular ainda."
              : "Adicione séries para ver seu ranking."}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-center">
        <button className="text-xs font-bold text-rose-500 hover:text-rose-600">
          Ver Ranking Completo
        </button>
      </div>
    </div>
  );
};

export default TrendingRanking;
