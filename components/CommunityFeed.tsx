import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Interfaces
interface CommentData {
  id: number;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

interface Activity {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  type: "POST" | "ADD_SERIES" | "UPDATE_STATUS";
  data: any;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_liked: number;
}

const ALL_SERIES_MOCK = [
  "Breaking Bad",
  "Game of Thrones",
  "Succession",
  "The Bear",
  "Stranger Things",
];
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

// --- SUB-COMPONENTE DO ITEM ---
const ActivityItem: React.FC<{
  act: Activity;
  currentUser: any;
  onDelete: (id: number) => void;
  goToProfile: (name: string) => void;
}> = ({ act, currentUser, onDelete, goToProfile }) => {
  const [liked, setLiked] = useState(Boolean(act.has_liked));
  const [likesCount, setLikesCount] = useState(act.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(false);

  const time = new Date(act.created_at).toLocaleDateString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isMyPost = currentUser && act.user_id === currentUser.id;

  const handleLike = async () => {
    if (!currentUser) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    try {
      await fetch(`http://localhost:3001/api/activities/${act.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
    } catch (error) {
      console.error("Erro no like:", error);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (commentsList.length === 0 && act.comments_count > 0) {
        setLoadingComments(true);
        try {
          const res = await fetch(
            `http://localhost:3001/api/activities/${act.id}/comments`
          );
          const data = await res.json();
          setCommentsList(data);
        } catch (error) {
          console.error("Erro comments:", error);
        } finally {
          setLoadingComments(false);
        }
      }
    } else {
      setShowComments(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/activities/${act.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, text: commentText }),
        }
      );
      const newComment = await res.json();
      setCommentsList([...commentsList, newComment]);
      setCommentText("");
    } catch (error) {
      console.error("Erro ao comentar:", error);
    }
  };

  const renderContent = () => {
    if (act.type === "POST") {
      const isSpoilerBool = Boolean(act.data.isSpoiler);
      const [revealed, setRevealed] = useState(false);
      return (
        <div className="mb-2">
          {act.data.seriesTitle && (
            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold mb-3 inline-block border border-rose-100 flex items-center gap-1 w-fit">
              📺 {act.data.seriesTitle}
            </span>
          )}
          {isSpoilerBool && !revealed ? (
            <div
              onClick={() => setRevealed(true)}
              className="bg-slate-50 p-4 rounded-xl text-center text-xs font-bold text-slate-500 border-dashed border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              ⚠️ Spoiler (Toque para ver)
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {act.data.text}
            </p>
          )}
        </div>
      );
    }
    if (act.type === "ADD_SERIES") {
      return (
        <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl mb-2">
          {act.data.poster ? (
            <img
              src={act.data.poster}
              className="w-12 h-16 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-[8px]">
              Sem Capa
            </div>
          )}
          <div>
            <h4 className="font-bold text-rose-600 text-sm">
              {act.data.title}
            </h4>
            <span className="text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              Adicionou à lista
            </span>
          </div>
        </div>
      );
    }
    if (act.type === "UPDATE_STATUS") {
      const statusMap: Record<string, string> = {
        Watched: "Finalizou 🏆",
        Watching: "Começou a ver 👀",
        "Want to Watch": "Quer ver ⭐️",
      };
      return (
        <div className="flex gap-4 items-center bg-green-50/50 p-3 rounded-xl mb-2 border border-green-100">
          {act.data.poster && (
            <img
              src={act.data.poster}
              className="w-10 h-14 object-cover rounded shadow-sm opacity-90"
            />
          )}
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              {act.data.title}
            </h4>
            <span className="text-[10px] font-bold text-green-700">
              {statusMap[act.data.status]}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-4 relative animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div
          onClick={() => goToProfile(act.user_name)}
          className="cursor-pointer shrink-0"
        >
          <img
            src={act.user_avatar}
            className="w-10 h-10 rounded-full object-cover border border-slate-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span
            onClick={() => goToProfile(act.user_name)}
            className="font-bold text-sm text-slate-800 cursor-pointer hover:underline"
          >
            {act.user_name}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
        </div>
        {isMyPost && (
          <div className="relative">
            <button
              onClick={() => setActiveMenuId(!activeMenuId)}
              className="p-2 text-slate-300 hover:text-slate-600 rounded-full"
            >
              ⋮
            </button>
            {activeMenuId && (
              <div className="absolute right-0 mt-1 w-32 bg-white border shadow-xl rounded-xl z-30">
                <button
                  onClick={() => onDelete(act.id)}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {renderContent()}
      <div className="flex items-center gap-6 pt-3 mt-3 border-t border-slate-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors group ${
            liked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
          }`}
        >
          <svg
            className="w-5 h-5 transition-transform active:scale-125"
            fill={liked ? "currentColor" : "none"}
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
          Gostei{" "}
          {likesCount > 0 && <span className="opacity-70">({likesCount})</span>}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors group"
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Comentar{" "}
          {commentsList.length > 0
            ? `(${commentsList.length})`
            : act.comments_count > 0
            ? `(${act.comments_count})`
            : ""}
        </button>
      </div>
      {showComments && (
        <div className="mt-4 bg-slate-50 rounded-xl p-3 animate-fade-in">
          {loadingComments ? (
            <div className="text-center py-2 text-[10px] text-slate-400">
              Carregando...
            </div>
          ) : (
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
              {commentsList.length === 0 ? (
                <p className="text-center text-[10px] text-slate-400 py-2">
                  Seja o primeiro a comentar!
                </p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex gap-2 items-start">
                    <img
                      src={c.user_avatar}
                      className="w-6 h-6 rounded-full mt-0.5"
                    />
                    <div className="bg-white p-2 rounded-r-xl rounded-bl-xl shadow-sm text-xs flex-1">
                      <span className="font-bold text-slate-800 mr-1">
                        {c.user_name}
                      </span>
                      <span className="text-slate-600">{c.text}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-2 text-xs outline-none focus:border-blue-300 transition-colors"
            />
            <button
              disabled={!commentText.trim()}
              type="submit"
              className="text-blue-500 font-bold text-xs disabled:opacity-50 hover:bg-blue-50 px-2 rounded-lg"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CommunityFeed: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");

  // PAGINAÇÃO E CARGA
  const [visibleLimit, setVisibleLimit] = useState(5); // Começa mostrando 5

  const [newPost, setNewPost] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredSeries, setFilteredSeries] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const savedUser = localStorage.getItem("userProfile");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  const loadFeed = () => {
    if (!currentUser) return;
    const url = `http://localhost:3001/api/feed?userId=${currentUser.id}&type=${activeTab}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((act: any) => ({
          ...act,
          data: typeof act.data === "string" ? JSON.parse(act.data) : act.data,
        }));
        setActivities(parsed);
      })
      .catch((err) => console.error("Erro ao carregar feed:", err));
  };

  useEffect(() => {
    loadFeed();
  }, [activeTab]);

  // Função para carregar mais posts
  const handleLoadMore = () => {
    setVisibleLimit((prev) => prev + 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewPost(text);
    const words = text.split(" ");
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("@") && !selectedSeries) {
      const query = lastWord.substring(1).toLowerCase();
      setMentionQuery(query);
      setShowMentions(true);
      if (query === "") setFilteredSeries(ALL_SERIES_MOCK.slice(0, 5));
      else {
        const matches = ALL_SERIES_MOCK.filter((s) =>
          s.toLowerCase().includes(query)
        ).slice(0, 5);
        setFilteredSeries(matches);
      }
    } else setShowMentions(false);
  };
  const selectMention = (s: string) => {
    const words = newPost.split(" ");
    words.pop();
    setNewPost(words.join(" "));
    setSelectedSeries(s);
    setShowMentions(false);
    textareaRef.current?.focus();
  };
  const removeMention = () => setSelectedSeries(null);
  const addEmoji = (e: string) => {
    setNewPost((p) => p + e);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !currentUser) return;
    try {
      const response = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          text: newPost,
          seriesTitle: selectedSeries,
          isSpoiler,
        }),
      });
      if (response.ok) {
        setNewPost("");
        setSelectedSeries(null);
        setIsSpoiler(false);
        loadFeed();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await fetch(`http://localhost:3001/api/posts/${postToDelete}`, {
        method: "DELETE",
      });
      setActivities(
        activities.filter(
          (a) => a.id !== postToDelete && a.data.postId !== postToDelete
        )
      );
      setPostToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Timeline
        </h3>

        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "global"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Comunidade
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "personal"
                ? "bg-white text-rose-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Meus Posts
          </button>
        </div>
      </div>

      {/* Input de Post */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 relative z-20">
        <div className="flex gap-3 mb-3">
          <img
            src={currentUser?.avatar}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
          />
          <div className="flex-1 relative">
            {selectedSeries && (
              <div className="mb-2 inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-100">
                <span>📺 {selectedSeries}</span>
                <button
                  onClick={removeMention}
                  className="hover:bg-rose-200 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={newPost}
              onChange={handleInputChange}
              placeholder="O que você está assistindo?"
              className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-100 resize-none border-0 h-24"
            />
            {showMentions && filteredSeries.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                {filteredSeries.map((s) => (
                  <button
                    key={s}
                    onClick={() => selectMention(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 font-medium transition-colors"
                  >
                    📺 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-yellow-500 rounded-full transition-colors"
            >
              😀
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 grid grid-cols-5 gap-1 z-50 w-56">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => addEmoji(e)}
                    className="text-xl p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsSpoiler(!isSpoiler)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSpoiler
                  ? "bg-red-100 text-red-600"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              {isSpoiler ? "⚠️ Contém Spoiler" : "Alerta de Spoiler"}
            </button>
          </div>
          <button
            onClick={handlePostSubmit}
            disabled={!newPost.trim()}
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 disabled:opacity-50 shadow-md active:scale-95 transition-all"
          >
            Publicar
          </button>
        </div>
      </div>

      {/* FEED LIST */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-3xl border border-slate-100 border-dashed">
            <p>Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          // Exibe apenas a quantidade definida por visibleLimit
          activities
            .slice(0, visibleLimit)
            .map((act) => (
              <ActivityItem
                key={act.id}
                act={act}
                currentUser={currentUser}
                onDelete={(id) => setPostToDelete(id)}
                goToProfile={(n) =>
                  navigate(`/profile/${n.toLowerCase().replace(/\s+/g, "")}`)
                }
              />
            ))
        )}

        {/* BOTÃO MOSTRAR MAIS */}
        {activities.length > visibleLimit && (
          <div className="text-center pt-4 pb-8">
            <button
              onClick={handleLoadMore}
              className="bg-white border border-slate-200 text-slate-500 px-6 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Mostrar Mais
            </button>
          </div>
        )}
      </div>

      {/* MODAL EXCLUIR */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setPostToDelete(null)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center border-4 border-red-50">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
