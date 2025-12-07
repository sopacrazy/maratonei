export enum SeriesStatus {
  WATCHING = "Watching",
  WATCHED = "Watched",
  WANT_TO_WATCH = "Want to Watch",
}

export interface Series {
  id: string; // generated via title-year-slug
  title: string;
  year: string;
  synopsis: string;
  genres: string[];
  matchScore?: number; // Simulated "match" percentage
  totalSeasons?: number;
  totalEpisodes?: number; // New: Total episodes count
  avgEpisodeDuration?: number; // New: Average minutes per episode
  poster?: string | null; // Nova propriedade para a imagem da capa (TMDB)
}

export interface UserSeries extends Series {
  status: SeriesStatus;
  addedAt: number;
  personalNote?: string; // O comentário do dono do perfil
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
  // Alterado para string para aceitar URLs personalizadas ou os nomes dos temas 'sunset', 'ocean', etc.
  coverTheme: string;
}
