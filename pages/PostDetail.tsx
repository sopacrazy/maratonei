import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [act, setAct] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsList, setCommentsList] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");

  const savedUser = localStorage.getItem("userProfile");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    if (!id || !currentUser) return;

    // 1. Busca os dados do Post
<<<<<<< HEAD
    fetch(
      `http://72.61.57.51:3001/api/activities/${id}?userId=${currentUser.id}`
    )
=======
    fetch(`http://localhost:3001/api/activities/${id}?userId=${currentUser.id}`)
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return; // Tratar erro

        // Corrige o formato do JSON se vier como string
        const parsedData =
          typeof data.data === "string" ? JSON.parse(data.data) : data.data;

        setAct({ ...data, data: parsedData });
        setLiked(Boolean(data.has_liked));
        setLikesCount(data.likes_count);
      })
      .finally(() => setLoading(false));

    // 2. Busca os comentários (AGORA VAI FUNCIONAR COM O GET NO SERVER)
<<<<<<< HEAD
    fetch(`http://72.61.57.51:3001/api/activities/${id}/comments`)
=======
    fetch(`http://localhost:3001/api/activities/${id}/comments`)
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
      .then((r) => r.json())
      .then((c) => {
        if (Array.isArray(c)) setCommentsList(c);
      });
  }, [id]);

  const handleLike = async () => {
    if (!currentUser || !act) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
<<<<<<< HEAD
    await fetch(`http://72.61.57.51:3001/api/activities/${act.id}/like`, {
=======
    await fetch(`http://localhost:3001/api/activities/${act.id}/like`, {
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !act) return;

    const res = await fetch(
<<<<<<< HEAD
      `http://72.61.57.51:3001/api/activities/${act.id}/comments`,
=======
      `http://localhost:3001/api/activities/${act.id}/comments`,
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, text: commentText }),
      }
    );
    const newComment = await res.json();
    setCommentsList([...commentsList, newComment]);
    setCommentText("");
  };

  const goToProfile = (name: string) =>
    navigate(`/profile/${name.toLowerCase().replace(/\s+/g, "")}`);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Carregando...
      </div>
    );
  if (!act)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Post não encontrado.
      </div>
    );

  const time = new Date(act.created_at).toLocaleDateString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderContent = () => {
    if (act.type === "POST") {
      return (
        <div className="mb-2">
          {act.data.seriesTitle && (
            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold mb-3 inline-block border border-rose-100">
              📺 {act.data.seriesTitle}
            </span>
          )}
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {act.data.text}
          </p>
        </div>
      );
    }
    if (act.type === "ADD_SERIES") {
      return (
        <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl mb-2">
          {act.data.poster && (
            <img
              src={act.data.poster}
              className="w-12 h-16 object-cover rounded-lg shadow-sm"
            />
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
      const statusMap: any = {
        Watched: "Finalizou 🏆",
        Watching: "Começou a ver 👀",
        "Want to Watch": "Quer ver ⭐️",
      };
      return (
        <div className="flex gap-4 items-center bg-green-50/50 p-3 rounded-xl mb-2 border border-green-100">
          {act.data.poster && (
            <img
              src={act.data.poster}
              className="w-10 h-14 object-cover rounded shadow-sm"
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
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white px-4 py-2 rounded-full shadow-sm w-fit"
      >
        ← Voltar para o Feed
      </button>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={act.user_avatar}
            onClick={() => goToProfile(act.user_name)}
            className="w-12 h-12 rounded-full border border-slate-100 cursor-pointer"
          />
          <div>
            <h3
              onClick={() => goToProfile(act.user_name)}
              className="font-bold text-slate-800 cursor-pointer hover:underline"
            >
              {act.user_name}
            </h3>
            <p className="text-xs text-slate-400">{time}</p>
          </div>
        </div>

        {renderContent()}

        <div className="flex items-center gap-6 pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
              liked ? "text-rose-500" : "text-slate-400"
            }`}
          >
            <svg
              className="w-5 h-5"
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
            {likesCount} Gostei
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
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
            {commentsList.length} Comentários
          </div>
        </div>

        {/* Lista de Comentários */}
        <div className="mt-6 bg-slate-50 rounded-2xl p-4">
          {commentsList.length === 0 ? (
            <p className="text-center text-xs text-slate-400 mb-4">
              Nenhum comentário ainda.
            </p>
          ) : (
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
              {commentsList.map((c) => (
                <div key={c.id} className="flex gap-3 items-start">
                  <img
                    src={c.user_avatar}
                    className="w-8 h-8 rounded-full mt-1 border border-white shadow-sm"
                  />
                  <div className="bg-white p-3 rounded-r-2xl rounded-bl-2xl shadow-sm text-sm flex-1 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1 text-xs">
                      {c.user_name}
                    </span>
                    <span className="text-slate-600 leading-relaxed text-xs">
                      {c.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submitComment} className="flex gap-2 items-center">
            <img
              src={currentUser?.avatar}
              className="w-8 h-8 rounded-full border border-slate-200"
            />
            <div className="flex-1 relative">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="w-full bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all pr-12"
              />
              <button
                disabled={!commentText.trim()}
                type="submit"
                className="absolute right-1 top-1 bottom-1 text-blue-600 font-bold text-xs px-3 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
