import React, { useState } from "react";

// Dados Expandidos para o Modal
const TRENDING_DATA = [
  {
    id: 1,
    title: "House of the Dragon",
    comments: "12.5k",
    trend: "up",
    poster: "https://image.tmdb.org/t/p/w500/1X4h40nqsUAusy2KHZ1qjuzwmKS.jpg", // Capa Real
    year: "2022",
    genre: "Drama, Fantasia",
    synopsis:
      'A história da Guerra Civil Targaryen, que ocorreu cerca de 200 anos antes dos eventos de "Game of Thrones".',
  },
  {
    id: 2,
    title: "The Last of Us",
    comments: "10.2k",
    trend: "stable",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    year: "2023",
    genre: "Drama, Sci-Fi",
    synopsis:
      "Vinte anos após a destruição da civilização moderna, Joel, um sobrevivente endurecido, é contratado para contrabandear Ellie, uma garota de 14 anos, para fora de uma zona de quarentena opressiva.",
  },
  {
    id: 3,
    title: "Succession",
    comments: "8.9k",
    trend: "up",
    poster: "https://image.tmdb.org/t/p/w500/7T5xXfFpjkJO8dMCVSt5pM5C0tT.jpg",
    year: "2018",
    genre: "Drama",
    synopsis:
      "A saga da família Roy, donos de um dos maiores conglomerados de mídia e entretenimento do mundo.",
  },
  {
    id: 4,
    title: "The Bear",
    comments: "7.4k",
    trend: "down",
    poster: "https://image.tmdb.org/t/p/w500/nJbWj5W9Yc1q6Jz3Y9x2X8k7Q8.jpg", // Placeholder se link quebrar
    year: "2022",
    genre: "Comédia, Drama",
    synopsis:
      "Um jovem chef do mundo da alta gastronomia volta a Chicago para administrar a lanchonete de sanduíches da família.",
  },
  {
    id: 5,
    title: "Ruptura",
    comments: "6.1k",
    trend: "up",
    poster: "https://image.tmdb.org/t/p/w500/fki3kBlwJzFp8Q8a7v8w9X8Y8.jpg", // Placeholder
    year: "2022",
    genre: "Sci-Fi, Mistério",
    synopsis:
      "Mark lidera uma equipe de funcionários de escritório cujas memórias foram cirurgicamente divididas entre suas vidas profissionais e pessoais.",
  },
];

const TrendingRanking: React.FC = () => {
  const [activeSeries, setActiveSeries] = useState<any>(null);

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-lg">
            🔥
          </span>
          <h3 className="font-bold text-slate-800 text-lg">Em Alta na Rede</h3>
        </div>

        <div className="space-y-4">
          {TRENDING_DATA.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveSeries(item)} // Abre o Modal
              className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"
            >
              {/* Position Rank */}
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0
                ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-600"
                    : index === 1
                    ? "bg-slate-100 text-slate-500"
                    : index === 2
                    ? "bg-orange-50 text-orange-700"
                    : "bg-slate-50 text-slate-400"
                }
              `}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-rose-500 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <span>{item.comments} comentários</span>
                </div>
              </div>

              {/* Trend Icon */}
              <div className="text-xs">
                {item.trend === "up" && (
                  <span className="text-green-500">▲</span>
                )}
                {item.trend === "down" && (
                  <span className="text-red-400">▼</span>
                )}
                {item.trend === "stable" && (
                  <span className="text-slate-300">=</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button className="text-xs font-bold text-rose-500 hover:text-rose-600">
            Ver Ranking Completo
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {activeSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop com Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setActiveSeries(null)}
          ></div>

          {/* Conteúdo do Modal */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
            {/* Header com Imagem */}
            <div className="h-48 w-full relative">
              <img
                src={
                  activeSeries.poster ||
                  `https://picsum.photos/seed/${activeSeries.title}/500/300`
                }
                className="w-full h-full object-cover"
                alt={activeSeries.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <button
                onClick={() => setActiveSeries(null)}
                className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 backdrop-blur-md transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute bottom-4 left-6">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  {activeSeries.title}
                </h2>
                <div className="flex gap-2 mt-1">
                  <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {activeSeries.year}
                  </span>
                  <span className="text-slate-200 text-xs font-medium">
                    {activeSeries.genre}
                  </span>
                </div>
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {activeSeries.synopsis}
              </p>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-800">
                    {activeSeries.comments}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Comentários
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-500">
                    #{activeSeries.id}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    No Ranking
                  </div>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                Ver Discussão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrendingRanking;
