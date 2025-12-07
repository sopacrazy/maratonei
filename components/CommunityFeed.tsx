import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: number;
  user: string;
  avatar: string;
  series?: string; // Série mencionada (opcional)
  text: string;
  time: string;
  isSpoiler?: boolean;
}

const ALL_SERIES_MOCK = [
  "Breaking Bad",
  "Game of Thrones",
  "Succession",
  "The Bear",
  "Stranger Things",
  "Dark",
  "The Office",
  "Friends",
  "Severance",
  "The Last of Us",
  "House of the Dragon",
];

// Emojis populares para acesso rápido
const QUICK_EMOJIS = [
  "😂",
  "😭",
  "😍",
  "😡",
  "😱",
  "🤯",
  "🍿",
  "🔥",
  "🤡",
  "💀",
];

const CommunityFeed: React.FC = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "Beatriz Silva",
      avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Beatriz",
      text: "A trilha sonora dessa série é imbatível. 🎹",
      time: "2 min atrás",
      series: "Succession",
    },
    {
      id: 3,
      user: "Carla Dias",
      avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Carla",
      text: "Meu cérebro explodiu com esse final! A revelação sobre a Helly foi chocante demais.",
      time: "12 min atrás",
      series: "Severance",
      isSpoiler: true,
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Estados para Menção (@)
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredSeries, setFilteredSeries] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null); // Guarda a série marcada no post atual

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<number[]>([]);

  // Detectar @
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewPost(text);

    const words = text.split(" ");
    const lastWord = words[words.length - 1];

    // Só ativa a busca se ainda não tiver selecionado uma série
    if (lastWord.startsWith("@") && !selectedSeries) {
      const query = lastWord.substring(1).toLowerCase();
      setMentionQuery(query);
      setShowMentions(true);

      if (query === "") {
        setFilteredSeries(ALL_SERIES_MOCK.slice(0, 5));
      } else {
        const matches = ALL_SERIES_MOCK.filter((s) =>
          s.toLowerCase().includes(query)
        ).slice(0, 5);
        setFilteredSeries(matches);
      }
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (seriesName: string) => {
    // Remove o texto @parcial do input
    const words = newPost.split(" ");
    words.pop();
    setNewPost(words.join(" "));

    // Define a série como um "Mini Card" anexado ao post
    setSelectedSeries(seriesName);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const removeMention = () => {
    setSelectedSeries(null);
  };

  const addEmoji = (emoji: string) => {
    setNewPost((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;

    const post: Comment = {
      id: Date.now(),
      user: "Você",
      avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Felix",
      series: selectedSeries || undefined,
      text: newPost,
      time: "Agora",
      isSpoiler: isSpoiler,
    };

    setComments([post, ...comments]);
    setNewPost("");
    setSelectedSeries(null);
    setIsSpoiler(false);
  };

  // Alterna entre mostrar e esconder o spoiler
  const toggleReveal = (id: number) => {
    setRevealedSpoilers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id); // Remove ID (Esconde)
      } else {
        return [...prev, id]; // Adiciona ID (Mostra)
      }
    });
  };

  const goToProfile = (userName: string) => {
    if (userName === "Você") return;
    const slug = userName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/profile/${slug}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Timeline da Comunidade
        </h3>
      </div>

      {/* Caixa de Postagem */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 relative z-20">
        <div className="flex gap-3 mb-3">
          <img
            src="https://api.dicebear.com/9.x/micah/svg?seed=Felix"
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
            alt="Você"
          />
          <div className="flex-1 relative">
            {/* Visualização da Menção (O "Mini Card" que você pediu) */}
            {selectedSeries && (
              <div className="mb-2 inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-100 animate-fade-in shadow-sm">
                <span>📺 Assistindo {selectedSeries}</span>
                <button
                  onClick={removeMention}
                  className="hover:bg-rose-200 rounded-full p-0.5 transition-colors"
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
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={newPost}
              onChange={handleInputChange}
              placeholder="O que você está assistindo? Digite @ para marcar uma série..."
              className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-rose-100 resize-none border-0 h-24"
            />

            {/* MENU DE MENÇÃO FLUTUANTE */}
            {showMentions && filteredSeries.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Sugeridas
                </div>
                {filteredSeries.map((s) => (
                  <button
                    key={s}
                    onClick={() => selectMention(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📺</span> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé da Postagem */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex gap-2 relative">
            {/* Botão Emoji */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
              title="Adicionar Emoji"
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Picker de Emoji Flutuante */}
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 grid grid-cols-5 gap-1 z-50 w-56 animate-fade-in">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => addEmoji(e)}
                    className="text-xl p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Botão Spoiler */}
            <button
              onClick={() => setIsSpoiler(!isSpoiler)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSpoiler
                  ? "bg-red-100 text-red-600"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              {isSpoiler ? (
                <>
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Contém Spoiler
                </>
              ) : (
                "Alerta de Spoiler"
              )}
            </button>
          </div>

          <button
            onClick={handlePostSubmit}
            disabled={!newPost.trim()}
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            Publicar
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {comments.map((comment) => {
          const isHidden =
            comment.isSpoiler && !revealedSpoilers.includes(comment.id);

          return (
            <div
              key={comment.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cabeçalho do Post */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  onClick={() => goToProfile(comment.user)}
                  className={`shrink-0 ${
                    comment.user !== "Você"
                      ? "cursor-pointer hover:opacity-80"
                      : ""
                  }`}
                >
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      onClick={() => goToProfile(comment.user)}
                      className={`font-bold text-slate-800 text-sm ${
                        comment.user !== "Você"
                          ? "cursor-pointer hover:underline"
                          : ""
                      }`}
                    >
                      {comment.user}
                    </span>

                    {/* CARD DA SÉRIE (Se houver) */}
                    {comment.series && (
                      <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-rose-100 flex items-center gap-1 cursor-default">
                        📺 {comment.series}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {comment.time}
                  </span>
                </div>
              </div>

              {/* CONTEÚDO */}
              <div className="pl-1">
                {isHidden ? (
                  // ESTADO OCULTO (Spoiler)
                  <div
                    onClick={() => toggleReveal(comment.id)}
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer group hover:border-rose-300 hover:bg-rose-50 transition-all text-center select-none"
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs mb-1 group-hover:text-rose-500 transition-colors">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Spoiler de {comment.series || "uma série"}
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Toque para revelar
                    </p>
                  </div>
                ) : (
                  // ESTADO VISÍVEL
                  <div
                    className={`relative ${
                      comment.isSpoiler
                        ? "bg-yellow-50 p-4 rounded-xl border border-yellow-100"
                        : ""
                    }`}
                  >
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {comment.text}
                    </p>

                    {/* Se for spoiler e estiver revelado, mostra botão para esconder */}
                    {comment.isSpoiler && (
                      <button
                        onClick={() => toggleReveal(comment.id)}
                        className="mt-2 text-[10px] font-bold text-yellow-600 hover:text-yellow-800 flex items-center gap-1 transition-colors"
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                        Ocultar Spoiler
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-6 pt-3 mt-3 border-t border-slate-100 text-slate-400">
                <button className="flex items-center gap-1.5 text-xs font-bold hover:text-rose-500 transition-colors group">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Curtir
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-500 transition-colors group">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Comentar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityFeed;
