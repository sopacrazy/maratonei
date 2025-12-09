//
import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import PublicProfile from "./pages/PublicProfile";
import ProfileConfig from "./pages/ProfileConfig";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import PostDetail from "./pages/PostDetail"; // Nova página de post
import { UserSeries, Series, SeriesStatus, UserProfile } from "./types";

const LayoutWrapper: React.FC<{
  children: React.ReactNode;
  onLogout: () => void;
}> = ({ children, onLogout }) => {
  const location = useLocation();
  const hideLayout =
    location.pathname.startsWith("/profile") ||
    location.pathname === "/login" ||
    location.pathname === "/onboarding";

  if (hideLayout) return <>{children}</>;
  return <Layout onLogout={onLogout}>{children}</Layout>;
};

// Rota Protegida Inteligente
const ProtectedRoute: React.FC<{
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}> = ({ isAuthenticated, needsOnboarding, isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">
        Carregando seu perfil...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  bio: "",
  avatar: "",
  coverTheme: "sunset",
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved).id : null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [myList, setMyList] = useState<UserSeries[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!!userId);

  const fetchUserData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${userId}/full`
      );
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setMyList(data.myList);
        localStorage.setItem("userProfile", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogin = () => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserId(parsed.id);
      setUserProfile(parsed);
      setIsAuthenticated(true);
      setIsLoading(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setMyList([]);
    setUserProfile(DEFAULT_PROFILE);
    localStorage.clear();
  };

  // --- LÓGICA INTELIGENTE DE STATUS E ATIVIDADE ---
  const handleUpdateStatus = async (series: Series, status: SeriesStatus) => {
    // 1. Atualização Otimista (Visual Imediato)
    setMyList((prev) => {
      const existingIndex = prev.findIndex((s) => s.title === series.title);

      if (existingIndex >= 0) {
        const newList = [...prev];
        newList[existingIndex] = { ...newList[existingIndex], status };
        return newList;
      } else {
        return [
          { ...series, status, addedAt: Date.now() } as UserSeries,
          ...prev,
        ];
      }
    });

    // 2. Atualização no Backend (Gera as atividades no feed)
    if (userId) {
      const exists = myList.some((s) => s.title === series.title);

      if (exists) {
        await fetch("http://localhost:3001/api/series/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            seriesTitle: series.title,
            newStatus: status,
            poster: series.poster,
          }),
        });
      } else {
        await fetch("http://localhost:3001/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            series: { ...series, status },
          }),
        });
      }
    }
  };

  const handleRemove = async (id: string) => {
    const seriesToRemove = myList.find((s) => s.id === id);

    if (!seriesToRemove) return;

    setMyList((prev) => prev.filter((s) => s.id !== id));

    if (userId) {
      try {
        const encodedTitle = encodeURIComponent(seriesToRemove.title);
        await fetch(
          `http://localhost:3001/api/series/${userId}/${encodedTitle}`,
          {
            method: "DELETE",
          }
        );
      } catch (err) {
        console.error("Erro ao deletar do banco:", err);
      }
    }
  };

  const handleUpdateNote = (id: string, note: string) =>
    setMyList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, personalNote: note } : s))
    );

  const needsOnboarding =
    !isLoading && (!userProfile.bio || userProfile.bio.trim() === "");

  return (
    <HashRouter>
      <LayoutWrapper onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                <Onboarding
                  user={{ ...userProfile, id: userId || 0 }}
                  onComplete={fetchUserData}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                needsOnboarding={needsOnboarding}
                isLoading={isLoading}
              >
                <Dashboard
                  myList={myList}
                  userProfile={userProfile}
                  onUpdateStatus={handleUpdateStatus}
                  onRemove={handleRemove}
                  onUpdateNote={handleUpdateNote}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                needsOnboarding={needsOnboarding}
                isLoading={isLoading}
              >
                <Search myList={myList} onAdd={handleUpdateStatus} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                needsOnboarding={needsOnboarding}
                isLoading={isLoading}
              >
                <ProfileConfig
                  profile={userProfile}
                  onUpdateProfile={setUserProfile}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PublicProfile myList={myList} userProfile={userProfile} />
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <PublicProfile myList={myList} userProfile={userProfile} />
            }
          />

          {/* Rota para o detalhe do post */}
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                needsOnboarding={needsOnboarding}
                isLoading={isLoading}
              >
                <PostDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </LayoutWrapper>
    </HashRouter>
  );
};

export default App;
