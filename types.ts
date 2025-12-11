//
export enum SeriesStatus {
  WATCHING = "Watching",
  WATCHED = "Watched",
  WANT_TO_WATCH = "Want to Watch",
}

export interface Series {
  id: string;
  title: string;
  year: string;
  synopsis: string;
  genres: string[];
  matchScore?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  avgEpisodeDuration?: number;
  poster?: string | null;
}

export interface UserSeries extends Series {
  status: SeriesStatus;
  addedAt: number;
  personalNote?: string;
  ranking?: number;
  rating?: number;
}

export interface GeminiSearchResult {
  title: string;
  year: string;
  synopsis: string;
  genres: string[];
  totalSeasons: number;
  totalEpisodes: number;
  avgEpisodeDuration: number;
}

export interface GuestComment {
  id: string;
  seriesId: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  coverTheme: string;
<<<<<<< HEAD
=======
  // --- NOVOS CAMPOS ---
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
  followersCount?: number;
  followingCount?: number;
}
export interface Notification {
  id: number;
  actor_name: string;
  actor_avatar: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  activity_id?: number;
  is_read: boolean; // MySQL retorna 0 ou 1, tratar como boolean no front
  created_at: string;
}
<<<<<<< HEAD

export interface UserBadge {
  key: string;
  title: string;
  description: string;
  image: string; // URL ou nome do arquivo
}

// --- NOVO: Interface e Mapeamento Estático (Base de Dados Local) ---
/** Define os metadados de exibição para um selo. */
export interface BadgeMetadata extends Omit<UserBadge, "key"> {}

/** Mapeamento da chave do selo (do banco de dados) para seus metadados visuais. */
export const BADGE_MAP: Record<string, BadgeMetadata> = {
  // Chave do banco de dados
  FIRST_5_POSTS: {
    title: "Maratonista Iniciante",
    description: "Publicou seu 5º post na timeline. Você está engajado!",
    image: "/post.png", // Caminho no servidor (pasta public)
  },
};
=======
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
