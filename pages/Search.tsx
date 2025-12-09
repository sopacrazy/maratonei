//
import React, { useState } from "react";
import { Series, SeriesStatus, UserProfile } from "../types";
import SeriesCard from "../components/SeriesCard";
import { useNavigate } from "react-router-dom";

interface SearchProps {
  myList: Series[];
  onAdd: (series: Series, status: SeriesStatus) => void;
}

const Search: React.FC<SearchProps> = ({ myList, onAdd }) => {
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState<"series" | "users">("series");
  const [query, setQuery] = useState("");
  const [seriesResults, setSeriesResults] = useState<Series[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Paginação para Séries (API)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Paginação Local para Usuários
  const [userLimit, setUserLimit] = useState(5); // Começa com 5 usuários

  const executeSearch = async (searchTerm: string, pageNumber: number) => {
    setIsLoading(true);
    setHasSearched(true);
    setUserLimit(5); // Reseta o limite ao buscar novo

    try {
      if (searchType === "series") {
        const response = await fetch("http://localhost:3001/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchTerm, page: pageNumber }),
        });
        const data = await response.json();
        const newResults = (data.results || []).map((item: any) => ({
          ...item,
          id: item.id ? item.id.toString() : `${item.title}-${item.year}`,
        }));
        if (pageNumber === 1) setSeriesResults(newResults);
        else setSeriesResults((prev) => [...prev, ...newResults]);
        setTotalPages(data.total_pages || 0);
      } else {
        const response = await fetch(
          `http://localhost:3001/api/users/search?query=${encodeURIComponent(
            searchTerm
          )}`
        );
        const data = await response.json();
        setUserResults(data);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    setSeriesResults([]);
    setUserResults([]);
    executeSearch(query, 1);
  };

  const handleLoadMoreSeries = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(query, nextPage);
  };

  // Carregar mais usuários (Apenas aumenta o limite visual)
  const handleLoadMoreUsers = () => {
    setUserLimit((prev) => prev + 5);
  };

  const isAlreadyInList = (seriesTitle: string) =>
    myList.some(
      (item) => item.title.toLowerCase() === seriesTitle.toLowerCase()
    );
  const goToProfile = (userName: string) => {
    const slug = userName.toLowerCase().replace(/\s+/g, "");
    navigate(`/profile/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <span className="inline-block p-3 rounded-2xl bg-white shadow-sm mb-4 text-3xl">
          {searchType === "series" ? "🔍" : "👥"}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
          {searchType === "series"
            ? "O que vamos ver hoje?"
            : "Encontre a galera"}
        </h2>
        <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-4">
          <button
            onClick={() => {
              setSearchType("series");
              setQuery("");
              setHasSearched(false);
            }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              searchType === "series"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Séries
          </button>
          <button
            onClick={() => {
              setSearchType("users");
              setQuery("");
              setHasSearched(false);
            }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              searchType === "users"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Pessoas
          </button>
        </div>
      </div>

      {/* Input */}
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
            placeholder={
              searchType === "series"
                ? "Ex: The Last of Us, Naruto..."
                : "Digite o nome ou apelido..."
            }
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
            {isLoading ? "..." : "Buscar"}
          </button>
        </div>
      </form>

      {/* RESULTADOS */}
      <div className="space-y-8">
        {!isLoading &&
          hasSearched &&
          ((searchType === "series" && seriesResults.length === 0) ||
            (searchType === "users" && userResults.length === 0)) && (
            <div className="text-center text-slate-500 py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl mb-3">🤔</div>
              <p className="font-medium">Nada encontrado.</p>
            </div>
          )}

        {/* LISTA DE SÉRIES */}
        {searchType === "series" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {seriesResults.map((series) => {
                const added = isAlreadyInList(series.title);
                return (
                  <div key={series.id} className="relative animate-fade-in-up">
                    {added && (
                      <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl border-2 border-green-100 pointer-events-none">
                        <span className="bg-white text-green-600 font-bold px-3 py-1.5 rounded-full shadow-lg border border-green-100 flex items-center gap-1 text-xs">
                          ✅ Na lista!
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
            {seriesResults.length > 0 && page < totalPages && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMoreSeries}
                  disabled={isLoading}
                  className="bg-white text-slate-600 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Carregando..." : "Carregar mais resultados"}
                </button>
              </div>
            )}
          </>
        )}

        {/* LISTA DE USUÁRIOS (COM LIMITE DE 5) */}
        {searchType === "users" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userResults.slice(0, userLimit).map((user: any) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 animate-fade-in-up"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      {user.bio || "Sem bio definida."}
                    </p>
                    <button
                      onClick={() => goToProfile(user.name)}
                      className="text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-bold hover:bg-rose-100 transition-colors"
                    >
                      Ver Perfil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Carregar Mais Usuários */}
            {userResults.length > userLimit && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMoreUsers}
                  className="bg-white text-slate-600 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 shadow-sm active:scale-95"
                >
                  Mostrar mais pessoas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
