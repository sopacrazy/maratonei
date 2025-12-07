import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import bcrypt from "bcrypt";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
      "SELECT * FROM ma_users WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Email já cadastrado" });

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
//  API DE SÉRIES (TMDB)
// ==========================================

// --- Busca na TMDB ---
app.post("/api/search", async (req, res) => {
  const { query, page } = req.body; // Recebe a página
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
      synopsis: item.overview || "Sem sinopse disponível.",
      genres: ["TV Show"],
      totalSeasons: 1,
      totalEpisodes: 10,
      avgEpisodeDuration: 45,
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
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

// --- Recomendações (CORRIGIDO: Agora retorna Poster) ---
app.post("/api/recommendations", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "pt-BR",
        page: 1,
      },
    });

    const formattedResults = response.data.results
      .map((item) => ({
        title: item.name,
        year: item.first_air_date ? item.first_air_date.split("-")[0] : "N/A",
        synopsis: item.overview,
        genres: ["Popular"],
        totalSeasons: 1,
        totalEpisodes: 10,
        avgEpisodeDuration: 45,
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null, // ADICIONADO
        id: item.id.toString(),
      }))
      .slice(0, 4);

    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

// --- Salvar Série ---
app.post("/api/series", async (req, res) => {
  const { user_id, series } = req.body;

  try {
    const [exists] = await db.query(
      "SELECT id FROM ma_user_series WHERE user_id = ? AND title = ?",
      [user_id, series.title]
    );
    if (exists.length > 0)
      return res.status(200).json({ message: "Série já está na lista" });

    await db.query(
      `INSERT INTO ma_user_series 
       (user_id, series_id, title, year, synopsis, genres, status, total_seasons, total_episodes, avg_duration, poster) 
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
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar série:", error);
    res.status(500).json({ error: "Erro ao salvar série" });
  }
});

// --- Remover Série ---
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
    console.error("Erro ao remover série:", error);
    res.status(500).json({ error: "Erro ao remover do banco" });
  }
});

// --- Rota User Full ---
app.get("/api/users/:id/full", async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query(
      "SELECT id, name, email, avatar, bio, cover_theme FROM ma_users WHERE id = ?",
      [id]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const [series] = await db.query(
      "SELECT * FROM ma_user_series WHERE user_id = ?",
      [id]
    );
    const formattedSeries = series.map((s) => ({
      ...s,
      genres:
        typeof s.genres === "string" ? JSON.parse(s.genres || "[]") : s.genres,
    }));

    res.json({
      user: { ...users[0], coverTheme: users[0].cover_theme },
      myList: formattedSeries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// --- Atualizar Perfil ---
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar, coverTheme } = req.body;
  try {
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

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
