import Parser from "rss-parser";
import cron from "node-cron";
import db from "../db.js";

const parser = new Parser();

// CONFIGURAÇÕES
const BOT_USER_ID = 16;
const RSS_FEED_URL =
  "https://news.google.com/rss/search?q=s%C3%A9ries+tv+netflix+hbo+amazon+prime&hl=pt-BR&gl=BR&ceid=BR:pt-419";

const NEWS_TEMPLATES = [
  "🔴 Plantão Maratonei:",
  "🗞️ Destaque do dia:",
  "🎬 Notícia fresca:",
  "⚡ Atualização rápida:",
  "📺 O que está rolando:",
  "🔥 Em alta:",
];

const CURIOSITY_TEMPLATES = [
  "✨ Você sabia?",
  "🔍 Detalhes que amamos:",
  "🧠 Curiosidade:",
  "📂 Arquivo Confidencial:",
  "🎬 Bastidores:",
];

const CURIOSIDADES = [
  {
    series: "Breaking Bad",
    text: "A metanfetamina azul era bala de açúcar triturada.",
  },
  {
    series: "Stranger Things",
    text: "Os Duffer Brothers foram rejeitados por 15 emissoras antes da Netflix.",
  },
  {
    series: "Game of Thrones",
    text: "A língua Dothraki tem mais de 3.000 palavras criadas do zero.",
  },
  {
    series: "The Office",
    text: "John Krasinski filmou a abertura numa viagem pessoal a Scranton.",
  },
  {
    series: "Friends",
    text: "A fonte da abertura não é em NY, mas num estúdio em Los Angeles.",
  },
  {
    series: "La Casa de Papel",
    text: "A série ia ser cancelada na Espanha antes da Netflix comprar.",
  },
  {
    series: "Round 6",
    text: "O roteiro foi rejeitado por 10 anos por ser 'muito violento'.",
  },
  {
    series: "The Last of Us",
    text: "Pedro Pascal jogou o game escondido para estudar o personagem.",
  },
  {
    series: "Succession",
    text: "Muitos insultos de Roman Roy foram improvisados na hora.",
  },
  {
    series: "House of the Dragon",
    text: "Usaram a maior tela de LED do mundo para os cenários.",
  },
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- POSTAR CURIOSIDADE ---
async function postCuriosity(lastPosts) {
  const availableCuriosities = CURIOSIDADES.filter((c) => {
    return !lastPosts.some((post) => {
      try {
        return post.data.includes(c.text);
      } catch {
        return false;
      }
    });
  });

  const targetPool =
    availableCuriosities.length > 0 ? availableCuriosities : CURIOSIDADES;
  const curiosity = getRandom(targetPool);
  const template = getRandom(CURIOSITY_TEMPLATES);

  // Texto limpo (sem o nome da série aqui, pois vai para o CHIP)
  const postText = `${template}\n${curiosity.text}`;

  console.log(`💡 Maratonei Oficial: Curiosidade sobre ${curiosity.series}`);

  const [postResult] = await db.query(
    "INSERT INTO ma_posts (user_id, text, series_title, is_spoiler) VALUES (?, ?, ?, ?)",
    [BOT_USER_ID, postText, curiosity.series, false]
  );

  // MUDANÇA AQUI: Adicionamos 'seriesTitle' ao JSON
  // Isso fará o frontend criar o CHIP "📺 Breaking Bad"
  await db.query(
    "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'POST', ?)",
    [
      BOT_USER_ID,
      JSON.stringify({
        text: postText,
        seriesTitle: curiosity.series, // <--- O SEGREDO DO CHIP ESTÁ AQUI
        newsLink: null,
        newsTitle: "Curiosidade",
        postId: postResult.insertId,
      }),
    ]
  );
}

// --- FUNÇÃO PRINCIPAL ---
async function runBot() {
  console.log("📡 Maratonei Oficial: Buscando atualizações...");

  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    const latestNews =
      feed.items && feed.items.length > 0 ? feed.items[0] : null;

    const [lastPosts] = await db.query(
      "SELECT data FROM ma_activities WHERE user_id = ? AND type = 'POST' ORDER BY created_at DESC LIMIT 10",
      [BOT_USER_ID]
    );

    let isDuplicate = false;
    if (latestNews) {
      isDuplicate = lastPosts.some((post) => {
        try {
          const data =
            typeof post.data === "string" ? JSON.parse(post.data) : post.data;
          return data.newsTitle === latestNews.title;
        } catch (e) {
          return false;
        }
      });
    }

    if (!latestNews || isDuplicate) {
      console.log("💤 Sem notícias novas. Alternando para Curiosidades.");
      await postCuriosity(lastPosts);
      return;
    }

    console.log(`🗞️ Nova Notícia: ${latestNews.title}`);
    const template = getRandom(NEWS_TEMPLATES);
    const postText = `${template} ${latestNews.title}`;

    const [postResult] = await db.query(
      "INSERT INTO ma_posts (user_id, text, series_title, is_spoiler) VALUES (?, ?, ?, ?)",
      [
        BOT_USER_ID,
        `${postText}\n\n🔗 Ler mais: ${latestNews.link}`,
        "Notícias",
        false,
      ]
    );

    // MUDANÇA AQUI TAMBÉM
    await db.query(
      "INSERT INTO ma_activities (user_id, type, data) VALUES (?, 'POST', ?)",
      [
        BOT_USER_ID,
        JSON.stringify({
          text: postText,
          seriesTitle: "Plantão de Séries", // <--- CHIP PARA NOTÍCIAS
          newsLink: latestNews.link,
          newsTitle: latestNews.title,
          postId: postResult.insertId,
        }),
      ]
    );

    console.log("✅ Post Oficial Publicado!");
  } catch (error) {
    console.error("❌ Erro no Serviço de Notícias:", error.message);
  }
}

export const startNewsBot = () => {
  // Configurado para cada 1 minuto para testes (depois muda para */30)
  cron.schedule("*/20 * * * *", () => {
    runBot();
  });

  console.log("⏰ Feed Oficial Iniciado (Modo: Chip Ativado)");

  setTimeout(() => runBot(), 5000);
};
