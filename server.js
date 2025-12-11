//
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import bcrypt from "bcrypt";
import axios from "axios";
import { startNewsBot } from "./services/newsBot.js";

dotenv.config();

<<<<<<< HEAD
// ==========================================
//  LÓGICA DE SELOS (BADGES)
// ==========================================

async function checkAndAwardBadge(userId, db) {
  const badgeKey = "FIRST_5_POSTS";

  // 1. Verificar se o selo já existe
  const [existingBadge] = await db.query(
    "SELECT 1 FROM ma_user_badges WHERE user_id = ? AND badge_key = ?",
    [userId, badgeKey]
  );
  if (existingBadge.length > 0) {
    return null; // Selo já concedido
  }

  // 2. Contar quantos posts o usuário tem
  const [postCountResult] = await db.query(
    "SELECT COUNT(*) AS count FROM ma_posts WHERE user_id = ?",
    [userId]
  );
  const postCount = postCountResult[0].count;

  // 3. Verificar o requisito (>= 5 posts)
  if (postCount >= 5) {
    // 4. Conceder o selo
    await db.query(
      "INSERT INTO ma_user_badges (user_id, badge_key) VALUES (?, ?)",
      [userId, badgeKey]
    );

    // 5. Retornar os dados do novo selo para o Frontend
    return {
      key: badgeKey,
      title: "Maratonista Iniciante",
      description:
        "Parabéns! Você publicou seu 5º post na timeline. Você está engajado!",
      image: "post.png", // Nome do arquivo a ser usado no frontend
    };
  }

  return null;
}

const app = express();
const PORT = 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "http://api.themoviedb.org/3";
=======
const app = express();
const PORT = 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Maratonei (TMDB) rodando! 🚀");
});

// ==========================================
//  AUTENTICAÇÃO
// ==========================================

app.post("/api/register", async (req, res) => {
  const { name, email, password, avatar } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Dados incompletos" });

  try {
    const [existing] = await db.query(
      "SELECT * FROM ma_users WHERE email = ? OR name = ?",
      [email, name]
    );

    if (existing.length > 0) {
      const userExists = existing[0];
      if (userExists.email === email) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }
      if (userExists.name === name) {
        return res
          .status(409)
          .json({ error: "Este nome de usuário já está em uso" });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO ma_users (name, email, password, avatar) VALUES (?, ?, ?, ?)",
      [name, email, hash, avatar]
    );
    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no registro" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Preencha e-mail e senha." });

  try {
    const [users] = await db.query("SELECT * FROM ma_users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(401).json({ error: "Usuário não encontrado" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Senha incorreta" });

    res.json({
      message: "Logado",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coverTheme: user.cover_theme,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==========================================
<<<<<<< HEAD
//  POSTS (MODIFICADO)
// ==========================================

app.post("/api/posts", async (req, res) => {
  const { userId, text, seriesTitle, isSpoiler } = req.body;

  try {
    // 1. Salva na tabela de posts (legado/backup)
    const [postResult] = await db.query(
      "INSERT INTO ma_posts (user_id, text, series_title, is_spoiler) VALUES (?, ?, ?, ?)",
      [userId, text, seriesTitle, isSpoiler]
    );

    // 2. Salva na tabela de Atividades
    await db.query(
      "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'POST', ?)",
      [
        userId,
        JSON.stringify({
          text,
          seriesTitle,
          isSpoiler,
          postId: postResult.insertId,
        }),
      ]
    );

    // 3. Verifica e concede o selo! (AQUI ESTÁ A MUDANÇA)
    const newBadge = await checkAndAwardBadge(userId, db);

    res.json({ success: true, newBadge }); // Retorna o novo selo se houver
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao postar" });
  }
});

// ==========================================
//  PERFIL & USUÁRIOS
// ==========================================

// Rota para buscar os selos do usuário
app.get("/api/users/:userId/badges", async (req, res) => {
  const { userId } = req.params;
  try {
    const [badges] = await db.query(
      "SELECT badge_key, awarded_at FROM ma_user_badges WHERE user_id = ?",
      [userId]
    );
    res.json(badges);
  } catch (error) {
    console.error("Erro ao buscar selos:", error);
    res.status(500).json({ error: "Erro ao buscar selos" });
  }
});

=======
//  PERFIL & USUÁRIOS
// ==========================================

>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
app.get("/api/users/:identifier/full", async (req, res) => {
  const { identifier } = req.params;

  try {
    const isId = /^\d+$/.test(identifier);
    const query = isId
      ? "SELECT id, name, email, avatar, bio, cover_theme FROM ma_users WHERE id = ?"
      : "SELECT id, name, email, avatar, bio, cover_theme FROM ma_users WHERE name = ?";

    const [users] = await db.query(query, [identifier]);

    if (users.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const user = users[0];

    const [series] = await db.query(
      "SELECT * FROM ma_user_series WHERE user_id = ?",
      [user.id]
    );
    const formattedSeries = series.map((s) => ({
      ...s,
      genres:
        typeof s.genres === "string" ? JSON.parse(s.genres || "[]") : s.genres,
      ranking: s.favorite_rank || 0,
    }));

    // Contagem de Seguidores
    const [followers] = await db.query(
      "SELECT COUNT(*) as count FROM ma_follows WHERE following_id = ?",
      [user.id]
    );
    const [following] = await db.query(
      "SELECT COUNT(*) as count FROM ma_follows WHERE follower_id = ?",
      [user.id]
    );

    res.json({
      user: {
        ...user,
        coverTheme: user.cover_theme,
        followersCount: followers[0].count,
        followingCount: following[0].count,
      },
      myList: formattedSeries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar, coverTheme } = req.body;

  try {
    if (name) {
      const [existing] = await db.query(
        "SELECT id FROM ma_users WHERE name = ? AND id != ?",
        [name, id]
      );
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ error: "Este nome de usuário já está em uso." });
      }
    }

    await db.query(
      "UPDATE ma_users SET name = ?, bio = ?, avatar = ?, cover_theme = ? WHERE id = ?",
      [name, bio, avatar, coverTheme, id]
    );
    res.json({ success: true, message: "Perfil atualizado!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==========================================
//  NOTIFICAÇÕES (AQUI ESTAVA O ERRO 404!)
// ==========================================

// Buscar notificações
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [notifs] = await db.query(
      `
      SELECT n.*, u.name as actor_name, u.avatar as actor_avatar
      FROM ma_notifications n
      JOIN ma_users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 20
    `,
      [userId]
    );
    res.json(notifs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
});

app.delete("/api/notifications/clear/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("DELETE FROM ma_notifications WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao limpar notificações" });
  }
});

// Marcar como lida
app.patch("/api/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE ma_notifications SET is_read = TRUE WHERE id = ?", [
      id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// ==========================================
//  SEGUIDORES (ATUALIZADO COM NOTIFICAÇÃO)
// ==========================================

app.post("/api/users/:id/follow", async (req, res) => {
  const { followerId } = req.body;
  const followingId = req.params.id;

  if (followerId == followingId)
    return res.status(400).json({ error: "Não pode seguir a si mesmo" });

  try {
    const [result] = await db.query(
      "INSERT IGNORE INTO ma_follows (follower_id, following_id) VALUES (?, ?)",
      [followerId, followingId]
    );

    // GERA NOTIFICAÇÃO SE REALMENTE SEGUIU (affectedRows > 0)
    if (result.affectedRows > 0) {
      await db.query(
        "INSERT INTO ma_notifications (user_id, actor_id, type) VALUES (?, ?, 'FOLLOW')",
        [followingId, followerId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao seguir" });
  }
});

app.delete("/api/users/:id/follow", async (req, res) => {
  const { followerId } = req.body;
  const followingId = req.params.id;

  try {
    await db.query(
      "DELETE FROM ma_follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deixar de seguir" });
  }
});

app.get("/api/users/:id/is_following", async (req, res) => {
  const { followerId } = req.query;
  const followingId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT 1 FROM ma_follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );
    res.json({ isFollowing: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: "Erro ao checar seguidor" });
  }
});

// ==========================================
//  ATIVIDADES & FEED
// ==========================================

// --- Feed Inteligente (Corrigido: Separação total de conteúdos) ---
app.get("/api/feed", async (req, res) => {
  const { userId, type } = req.query;

  try {
    // --- QUERY CORRIGIDA: Agora busca também a contagem de likes e se eu dei like ---
    let query = `
      SELECT 
        a.*, 
        u.name as user_name, 
        u.avatar as user_avatar,
        (SELECT COUNT(*) FROM ma_likes WHERE activity_id = a.id) as likes_count,
        (SELECT COUNT(*) FROM ma_likes WHERE activity_id = a.id AND user_id = ?) as has_liked,
        (SELECT COUNT(*) FROM ma_comments WHERE activity_id = a.id) as comments_count
      FROM ma_activities a
      JOIN ma_users u ON a.user_id = u.id
    `;

    // O primeiro parametro da query é o userId para o 'has_liked'
    const params = [userId];

    if (type === "personal") {
      query += " WHERE a.user_id = ?";
      params.push(userId);
    } else if (type === "following") {
      query += `
        WHERE a.user_id IN (
          SELECT following_id FROM ma_follows WHERE follower_id = ?
        ) OR a.user_id = ?
      `;
      params.push(userId, userId);
    }
    // 'global' pega tudo

    query += " ORDER BY a.created_at DESC LIMIT 50";

    const [activities] = await db.query(query, params);
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar feed" });
  }
});

// ==========================================
//  INTERAÇÕES (ATUALIZADO COM NOTIFICAÇÃO)
// ==========================================

app.post("/api/activities/:id/like", async (req, res) => {
  const { userId } = req.body;
  const activityId = req.params.id;
  // ... (Mantenha a lógica de like que você já tem)
  // Vou resumir para não ficar gigante, use a que já estava funcionando ou copie do anterior
  try {
    const [existing] = await db.query(
      "SELECT 1 FROM ma_likes WHERE user_id = ? AND activity_id = ?",
      [userId, activityId]
    );
    if (existing.length > 0) {
      await db.query(
        "DELETE FROM ma_likes WHERE user_id = ? AND activity_id = ?",
        [userId, activityId]
      );
      res.json({ liked: false });
    } else {
      await db.query(
        "INSERT INTO ma_likes (user_id, activity_id) VALUES (?, ?)",
        [userId, activityId]
      );
      // ... (Lógica de notificação aqui) ...
      // Bloco de notificação de Like:
      const [activity] = await db.query(
        "SELECT user_id FROM ma_activities WHERE id = ?",
        [activityId]
      );
      if (activity.length && activity[0].user_id != userId) {
        await db.query(
          "INSERT INTO ma_notifications (user_id, actor_id, type, activity_id) VALUES (?, ?, 'LIKE', ?)",
          [activity[0].user_id, userId, activityId]
        );
      }
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no like" });
  }
});

// ==========================================
//  ROTA NOVA: BUSCAR UMA ÚNICA ATIVIDADE (Para o clique da notificação)
// ==========================================
app.get("/api/activities/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*, 
        u.name as user_name, 
        u.avatar as user_avatar,
        (SELECT COUNT(*) FROM ma_likes WHERE activity_id = a.id) as likes_count,
        (SELECT COUNT(*) FROM ma_likes WHERE activity_id = a.id AND user_id = ?) as has_liked,
        (SELECT COUNT(*) FROM ma_comments WHERE activity_id = a.id) as comments_count
      FROM ma_activities a
      JOIN ma_users u ON a.user_id = u.id
      WHERE a.id = ?
    `,
      [userId, id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Post não encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar atividade" });
  }
});

// --- CORREÇÃO IMPORTANTE AQUI: Era POST, agora é GET ---
// Rota para LISTAR os comentários
app.get("/api/activities/:id/comments", async (req, res) => {
  const activityId = req.params.id;
  try {
    const [comments] = await db.query(
      `
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM ma_comments c
      JOIN ma_users u ON c.user_id = u.id
      WHERE c.activity_id = ?
      ORDER BY c.created_at ASC
    `,
      [activityId]
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
});

// Rota para ADICIONAR comentário
app.post("/api/activities/:id/comments", async (req, res) => {
  const { userId, text } = req.body;
  const activityId = req.params.id;

  try {
    const [result] = await db.query(
      "INSERT INTO ma_comments (user_id, activity_id, text) VALUES (?, ?, ?)",
      [userId, activityId, text]
    );

    // Notificação
    const [activity] = await db.query(
      "SELECT user_id FROM ma_activities WHERE id = ?",
      [activityId]
    );
    if (activity.length && activity[0].user_id != userId) {
      await db.query(
        "INSERT INTO ma_notifications (user_id, actor_id, type, activity_id) VALUES (?, ?, 'COMMENT', ?)",
        [activity[0].user_id, userId, activityId]
      );
    }

    const [newComment] = await db.query(
      `
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM ma_comments c
      JOIN ma_users u ON c.user_id = u.id
      WHERE c.id = ?
    `,
      [result.insertId]
    );

    res.json(newComment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao comentar" });
  }
});

// ==========================================
//  POSTS
// ==========================================

app.post("/api/posts", async (req, res) => {
  const { userId, text, seriesTitle, isSpoiler } = req.body;

  try {
    // 1. Salva na tabela de posts (legado/backup)
    const [postResult] = await db.query(
      "INSERT INTO ma_posts (user_id, text, series_title, is_spoiler) VALUES (?, ?, ?, ?)",
      [userId, text, seriesTitle, isSpoiler]
    );

    // 2. Salva na tabela de Atividades
    await db.query(
      "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'POST', ?)",
      [
        userId,
        JSON.stringify({
          text,
          seriesTitle,
          isSpoiler,
          postId: postResult.insertId,
        }),
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao postar" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM ma_posts WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

// ==========================================
//  API DE SÉRIES (TMDB & LISTA)
// ==========================================

app.post("/api/search", async (req, res) => {
  const { query, page } = req.body;
  if (!query) return res.status(400).json({ error: "Faltou a busca" });
  const pageNumber = page || 1;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: "pt-BR",
        page: pageNumber,
      },
    });

    const formattedResults = response.data.results.map((item) => ({
      title: item.name,
      year: item.first_air_date ? item.first_air_date.split("-")[0] : "N/A",
      synopsis: item.overview || "Sem sinopse.",
      genres: ["TV Show"],
      totalSeasons: 1,
      totalEpisodes: 10,
      avgEpisodeDuration: 45,
      poster: item.poster_path
<<<<<<< HEAD
        ? `http://image.tmdb.org/t/p/w500${item.poster_path}`
=======
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
        : null,
      id: item.id.toString(),
    }));

    res.json({
      results: formattedResults,
      total_pages: response.data.total_pages,
    });
  } catch (error) {
    console.error("Erro TMDB:", error.message);
    res.status(500).json({ error: "Erro ao buscar na TMDB" });
  }
});

app.post("/api/recommendations", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR", page: 1 },
    });
    const formattedResults = response.data.results.slice(0, 4).map((item) => ({
      title: item.name,
      year: item.first_air_date ? item.first_air_date.split("-")[0] : "N/A",
      synopsis: item.overview,
      genres: ["Popular"],
      poster: item.poster_path
<<<<<<< HEAD
        ? `http://image.tmdb.org/t/p/w500${item.poster_path}`
=======
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
        : null,
      id: item.id.toString(),
    }));
    res.json(formattedResults);
  } catch (error) {
    res.json([]);
  }
});

// ADICIONAR SÉRIE + ATIVIDADE
app.post("/api/series", async (req, res) => {
  const { user_id, series } = req.body;

  try {
    const [exists] = await db.query(
      "SELECT id FROM ma_user_series WHERE user_id = ? AND title = ?",
      [user_id, series.title]
    );
    if (exists.length > 0)
      return res.status(200).json({ message: "Já na lista", id: exists[0].id });

    const [result] = await db.query(
      `INSERT INTO ma_user_series (user_id, series_id, title, year, synopsis, genres, status, total_seasons, total_episodes, avg_duration, poster) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        series.title,
        series.title,
        series.year,
        series.synopsis,
        JSON.stringify(series.genres),
        series.status || "Watching",
        series.totalSeasons,
        series.totalEpisodes,
        series.avgEpisodeDuration,
        series.poster,
      ]
    );

    // Salva Atividade: ADICIONOU
    await db.query(
      "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'ADD_SERIES', ?)",
      [
        user_id,
        JSON.stringify({
          title: series.title,
          poster: series.poster,
          status: series.status,
        }),
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Erro salvar série:", error);
    res.status(500).json({ error: "Erro ao salvar série" });
  }
});

// ATUALIZAR STATUS + ATIVIDADE (ROTA QUE FALTAVA/ESTAVA INCOMPLETA)
app.patch("/api/series/status", async (req, res) => {
  const { userId, seriesTitle, newStatus, poster } = req.body;

  try {
    await db.query(
      "UPDATE ma_user_series SET status = ? WHERE user_id = ? AND title = ?",
      [newStatus, userId, seriesTitle]
    );

    // Salva Atividade: ATUALIZOU
    await db.query(
      "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'UPDATE_STATUS', ?)",
      [
        userId,
        JSON.stringify({
          title: seriesTitle,
          status: newStatus,
          poster: poster,
        }),
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

app.patch("/api/series/:id/rank", async (req, res) => {
  const { id } = req.params;
  const { userId, rank } = req.body;
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      if (rank > 0)
        await connection.query(
          "UPDATE ma_user_series SET favorite_rank = 0 WHERE user_id = ? AND favorite_rank = ?",
          [userId, rank]
        );
      await connection.query(
        "UPDATE ma_user_series SET favorite_rank = ? WHERE id = ?",
        [rank, id]
      );
      await connection.commit();
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.delete("/api/series/:userId/:title", async (req, res) => {
  const { userId, title } = req.params;
  try {
    const decodedTitle = decodeURIComponent(title);
    await db.query(
      "DELETE FROM ma_user_series WHERE user_id = ? AND title = ?",
      [userId, decodedTitle]
    );
    res.json({ success: true, message: "Série removida!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover" });
  }
});

app.get("/api/trending", async (req, res) => {
  try {
    // Busca as 5 séries que mais aparecem na tabela ma_user_series
    const [rows] = await db.query(`
      SELECT title, poster, COUNT(*) as total_users
      FROM ma_user_series
      GROUP BY title, poster
      ORDER BY total_users DESC
      LIMIT 5
    `);

    // Formata para o frontend
    const trending = rows.map((row, index) => ({
      id: index + 1, // Ranking 1, 2, 3...
      title: row.title,
      count: row.total_users, // Quantas pessoas têm na lista
      poster: row.poster,
      trend: index < 2 ? "up" : "stable", // Decorativo: 2 primeiros sobem
    }));

    res.json(trending);
  } catch (error) {
    console.error("Erro ao buscar trending:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// --- Buscar Usuários (Para a barra de pesquisa) ---
app.get("/api/users/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    // Busca usuários onde o nome parece com a query (LIKE)
    const [users] = await db.query(
      "SELECT id, name, avatar, bio FROM ma_users WHERE name LIKE ? LIMIT 20",
      [`%${query}%`]
    );
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar" });
  }
});

// ==========================================
//  ROTA PARA O SLIDE SHOW (LOGIN)
// ==========================================

app.get("/api/trending-backgrounds", async (req, res) => {
  try {
    // Busca séries em "Trending" (Tendência) da semana
    const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });

    // Pega as 10 primeiras e extrai apenas a URL da imagem em alta resolução
    const images = response.data.results
      .slice(0, 10)
      .map((item) =>
        item.poster_path
<<<<<<< HEAD
          ? `http://image.tmdb.org/t/p/original${item.poster_path}`
=======
          ? `https://image.tmdb.org/t/p/original${item.poster_path}`
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
          : null
      )
      .filter(Boolean); // Remove nulos

    res.json(images);
  } catch (error) {
    console.error("Erro ao buscar backgrounds:", error.message);
    // Retorna array vazio em caso de erro (o front vai usar a imagem padrão)
    res.json([]);
  }
});

// ==========================================
//  AVALIAÇÃO (RATING)
// ==========================================

app.patch("/api/series/:id/rating", async (req, res) => {
  const { id } = req.params; // ID da tabela ma_user_series
  const { userId, rating, seriesTitle, poster } = req.body;

  try {
    // 1. Salva a nota
    await db.query("UPDATE ma_user_series SET rating = ? WHERE id = ?", [
      rating,
      id,
    ]);

    // 2. Se a nota for positiva, gera atividade no Feed
    if (rating > 0) {
      await db.query(
        "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'RATE', ?)",
        [
          userId,
          JSON.stringify({
            title: seriesTitle,
            poster: poster,
            rating: rating,
          }),
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao avaliar:", error);
    res.status(500).json({ error: "Erro ao salvar nota" });
  }
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve os arquivos estáticos da pasta dist (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "dist")));

// Rota coringa "Nuclear" (Pega tudo e manda pro React)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Inicia o Bot de Notícias
startNewsBot();

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`✅ Servidor rodando em http://72.61.57.51:${PORT}`);
=======
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
});
