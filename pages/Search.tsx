import React, { useState } from "react";
import { Series, SeriesStatus } from "../types";
import SeriesCard from "../components/SeriesCard";

interface SearchProps {
  myList: Series[];
  onAdd: (series: Series, status: SeriesStatus) => void;
}

const Search: React.FC<SearchProps> = ({ myList, onAdd }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Novos estados para paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Função unificada de busca
  const executeSearch = async (searchTerm: string, pageNumber: number) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, page: pageNumber }),
      });

      const data = await response.json();

      // --- CORREÇÃO DE SEGURANÇA ---
      // Se a API der erro, 'data.results' será undefined.
      // Aqui garantimos que seja um array vazio se falhar.
      const resultsArray = Array.isArray(data.results) ? data.results : [];

      if (!data.results) {
        console.warn("Aviso da API:", data); // Mostra no console o que veio errado
      }
      // -----------------------------

      // Formata os resultados
      const newResults: Series[] = resultsArray.map((item: any) => ({
        ...item,
        // Garante que o ID seja string
        id: item.id ? item.id.toString() : `${item.title}-${item.year}`,
      }));

      if (pageNumber === 1) {
        setResults(newResults);
      } else {
        setResults((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = newResults.filter((r) => !existingIds.has(r.id));
          return [...prev, ...uniqueNew];
        });
      }

      setTotalPages(data.total_pages || 0);
      setHasSearched(true);
    } catch (error) {
      console.error("Erro na busca:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setPage(1);
    setResults([]);
    executeSearch(query, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(query, nextPage);
  };

  const isAlreadyInList = (seriesTitle: string) => {
    return myList.some(
      (item) => item.title.toLowerCase() === seriesTitle.toLowerCase()
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-12">
        <span className="inline-block p-3 rounded-2xl bg-white shadow-sm mb-4 text-3xl">
          🔍
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          O que vamos ver hoje?
        </h2>
        <p className="text-slate-500 text-lg">
          Digite o nome da série para encontrar capas oficiais.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-12 relative max-w-2xl mx-auto"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: The Last of Us, Naruto..."
            className="relative w-full bg-white text-slate-800 border-0 rounded-full px-8 py-5 pl-14 shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-slate-400 text-lg"
          />
          <svg
            className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 z-10"
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
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md z-10"
          >
            {isLoading && page === 1 ? "..." : "Buscar"}
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center text-slate-500 py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-4xl mb-3">🤔</div>
            <p className="font-medium">Ops! Nenhuma série encontrada.</p>
            <p className="text-sm opacity-70">
              Verifique se o nome está correto ou se o servidor está conectado.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((series) => {
            const added = isAlreadyInList(series.title);
            return (
              <div key={series.id} className="relative animate-fade-in-up">
                {added && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl border-2 border-green-100 pointer-events-none">
                    <span className="bg-white text-green-600 font-bold px-3 py-1.5 rounded-full shadow-lg border border-green-100 flex items-center gap-1 transform -rotate-3 text-xs">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Na lista!
                    </span>
                  </div>
                )}
                <SeriesCard
                  series={series}
                  onUpdateStatus={onAdd}
                  isSearch={true}
                />
              </div>
            );
          })}
        </div>

        {/* Botão Ver Mais */}
        {results.length > 0 && page < totalPages && (
          <div className="flex justify-center pt-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-white text-slate-600 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Carregando...
                </>
              ) : (
                <>
                  Carregar mais resultados
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
      </div>
    </div>
  );
};

export default Search;
