import React, { useState } from "react";
import { Series, SeriesStatus, UserSeries } from "../types";

interface SeriesCardProps {
  series: Series | UserSeries;
  onUpdateStatus: (series: Series, status: SeriesStatus) => void;
  onRemove?: (id: string) => void;
  onUpdateNote?: (id: string, note: string) => void;

  // NOVA PROP
  onRate?: (id: string, rating: number) => void;

  isSearch?: boolean;
  viewMode?: "grid" | "list";
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  onUpdateStatus,
  onRemove,
  onUpdateNote,
  onRate, // Recebe a função
  isSearch,
  viewMode = "grid",
}) => {
  const isUserSeries = (s: Series | UserSeries): s is UserSeries => {
    return (s as UserSeries).status !== undefined;
  };

  const userSeries = series as UserSeries;
  const [note, setNote] = useState(userSeries.personalNote || "");
  const [rating, setRating] = useState(userSeries.rating || 0); // Começa com a nota salva
  const [hoverRating, setHoverRating] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handleNoteBlur = () => {
    if (isUserSeries(series) && onUpdateNote) {
      if (note !== userSeries.personalNote) {
        onUpdateNote(series.id, note);
      }
    }
  };

  const handleRate = (star: number) => {
    setRating(star);
    if (onRate && isUserSeries(series)) {
      onRate(series.id, star);
    }
  };

  const StarRating = () => (
    <div className="flex gap-0.5" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-sm leading-none transition-transform hover:scale-125 focus:outline-none p-0.5"
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoverRating(star)}
        >
          <span
            className={`drop-shadow-sm ${
              star <= (hoverRating || rating)
                ? "text-yellow-400"
                : "text-slate-300/50"
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );

  // --- MODO LISTA ---
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col gap-2 hover:shadow-md transition-all group h-full animate-fade-in">
        <div className="flex gap-3 items-start">
          <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-200 relative shadow-sm">
            {series.poster && !imgError ? (
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold text-center p-1 bg-slate-100">
                SEM FOTO
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-1">
              <h3
                className="font-bold text-slate-800 text-xs leading-tight line-clamp-2"
                title={series.title}
              >
                {series.title}
              </h3>
              {onRemove && (
                <button
                  onClick={() => onRemove(series.id)}
                  className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors shrink-0 -mt-1 -mr-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                {series.year}
              </span>
            </div>

            {/* Rating Ativo */}
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {!isSearch && isUserSeries(series) && <StarRating />}
            </div>
          </div>
        </div>

        {!isSearch && isUserSeries(series) && (
          <div className="mt-auto pt-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Nota pessoal..."
              className="w-full text-[10px] bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-slate-600 focus:ring-1 focus:ring-rose-100 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        )}

        {isSearch ? (
          <button
            onClick={() => onUpdateStatus(series, SeriesStatus.WATCHING)}
            className="mt-auto w-full bg-rose-500 text-white text-[10px] font-bold py-1.5 rounded hover:bg-rose-600 transition-colors"
          >
            + Adicionar
          </button>
        ) : (
          <div className="mt-1">
            <select
              className="w-full bg-transparent text-slate-400 text-[9px] font-bold py-1 rounded border border-transparent hover:border-slate-200 outline-none cursor-pointer text-center hover:text-slate-600 transition-colors"
              value={userSeries.status}
              onChange={(e) =>
                onUpdateStatus(series, e.target.value as SeriesStatus)
              }
            >
              <option value={SeriesStatus.WATCHING}>Mover: Assistindo</option>
              <option value={SeriesStatus.WATCHED}>Mover: Completo</option>
              <option value={SeriesStatus.WANT_TO_WATCH}>
                Mover: Quero Ver
              </option>
            </select>
          </div>
        )}
      </div>
    );
  }

  // --- MODO GRID ---
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-slate-100 animate-fade-in">
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-slate-200">
        {series.poster && !imgError ? (
          <img
            src={series.poster}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-slate-100">
            <span className="text-3xl mb-2 opacity-50">🎬</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {series.title}
            </span>
          </div>
        )}

        {/* Gradiente e Estrelas no Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {!isSearch && isUserSeries(series) && (
            <div className="flex justify-center pb-1">
              <StarRating />
            </div>
          )}
        </div>

        {/* Estrela Fixa (Se já tiver nota, mostra um indicador pequeno quando não está hover) */}
        {!isSearch && isUserSeries(series) && rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 group-hover:opacity-0 transition-opacity">
            <span className="text-yellow-400 text-[10px]">★</span>
            <span className="text-white text-[10px] font-bold">{rating}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <div className="flex justify-between items-start gap-2">
            <h3
              className="font-bold text-sm leading-tight text-slate-800 line-clamp-2"
              title={series.title}
            >
              {series.title}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 shrink-0">
              {series.year}
            </span>
          </div>
        </div>

        <div className="flex-grow mb-4">
          {!isSearch && isUserSeries(series) ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Sua análise..."
              className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-rose-200 outline-none resize-none h-16"
            />
          ) : (
            <p className="text-xs text-slate-500 line-clamp-3 font-medium">
              {series.synopsis}
            </p>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100">
          {isSearch ? (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus(series, SeriesStatus.WATCHING)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm active:scale-95"
              >
                + Ver
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <select
                className="flex-1 bg-white text-slate-600 text-[10px] font-bold py-1.5 px-2 rounded-lg border border-slate-200 outline-none cursor-pointer hover:border-rose-300 w-full"
                value={userSeries.status}
                onChange={(e) =>
                  onUpdateStatus(series, e.target.value as SeriesStatus)
                }
              >
                <option value={SeriesStatus.WATCHING}>Assistindo</option>
                <option value={SeriesStatus.WATCHED}>Completo</option>
                <option value={SeriesStatus.WANT_TO_WATCH}>Quero Ver</option>
              </select>
              {onRemove && (
                <button
                  onClick={() => onRemove(series.id)}
                  className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;
