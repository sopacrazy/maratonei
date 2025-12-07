import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Cria uma "piscina" de conexões (Pool)
// Isso é melhor que criar uma conexão única, pois gerencia o tráfego automaticamente
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Teste rápido para ver se conectou (aparecerá no terminal)
db.getConnection()
  .then((connection) => {
    console.log("✅ Conectado ao banco de dados MySQL!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err.message);
  });

export default db;
