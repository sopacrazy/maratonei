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
  // --- NOVOS CAMPOS ---
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
