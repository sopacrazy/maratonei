import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { useNavigate } from "react-router-dom";

interface ProfileConfigProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const THEMES: Record<string, string> = {
  sunset: "bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500",
  ocean: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",
  forest: "bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400",
  berry: "bg-gradient-to-br from-fuchsia-600 via-purple-500 to-pink-400",
  midnight: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  minimal: "bg-slate-800",
};

const AVATARS = [
  "https://api.dicebear.com/9.x/micah/svg?seed=Felix",
  "https://api.dicebear.com/9.x/micah/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Callie",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Bandit",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Cookie",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Gizmo",
];

const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const navigate = useNavigate();

  // Inicializa com os dados do perfil OU valores padrão seguros
  const [formData, setFormData] = useState<UserProfile>({
    name: profile?.name || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
    coverTheme: profile?.coverTheme || "sunset",
  });

  const [customAvatar, setCustomAvatar] = useState("");
  const [seriesSearch, setSeriesSearch] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o formulário se o perfil carregar depois (ex: refresh da página)
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
        coverTheme: profile.coverTheme || "sunset",
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Salva no Backend (Assumindo que o App.tsx passa uma função que já faz isso ou fazemos aqui)
    // Se onUpdateProfile apenas atualizar o estado local, idealmente deveríamos chamar a API aqui também.
    // Mas para manter a consistência com seu App.tsx atual, vamos confiar na prop.

    // DICA: O ideal seria ter o ID do usuário aqui para salvar no banco:
    // await fetch(`http://localhost:3001/api/users/${userId}`, ...)

    onUpdateProfile(formData);
    navigate("/");
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverTheme"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleChange(field, reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSeriesCoverSearch = () => {
    if (seriesSearch.trim()) {
      const formattedQuery = seriesSearch
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const simulatedCoverUrl = `https://picsum.photos/seed/${formattedQuery}-cover/1200/500`;
      handleChange("coverTheme", simulatedCoverUrl);
    }
  };

  const getCoverStyle = () => {
    const theme = formData.coverTheme || "sunset";
    if (THEMES[theme]) return THEMES[theme];
    return `url('${theme}')`;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Personalize seu Espaço
        </h1>
        <p className="text-slate-500">
          Deixe seu perfil público com a sua cara.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 border border-slate-100 space-y-8"
      >
        {/* Preview Section */}
        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
          <div
            className={`h-32 w-full bg-cover bg-center transition-all ${
              THEMES[formData.coverTheme] ? THEMES[formData.coverTheme] : ""
            }`}
            style={
              !THEMES[formData.coverTheme]
                ? { backgroundImage: getCoverStyle() }
                : {}
            }
          >
            {!THEMES[formData.coverTheme] && (
              <div className="absolute inset-0 bg-black/20"></div>
            )}
          </div>

          <div className="px-6 pb-6 -mt-10 relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-full p-1 bg-white shadow-lg relative z-10">
              <img
                src={
                  formData.avatar ||
                  "https://api.dicebear.com/9.x/micah/svg?seed=placeholder"
                }
                alt="Avatar"
                className="w-full h-full rounded-full bg-slate-200 object-cover"
              />
            </div>
            <div className="pt-10">
              <h3 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-1">
                {formData.name || "Seu Nome"}
                <svg
                  className="w-5 h-5 text-blue-500 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                {formData.bio || "Sua bio aparece aqui..."}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Seu Nome / Apelido
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 border border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
              placeholder="Ex: Mestre das Séries"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Bio / Frase de Efeito
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 border border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all resize-none"
              rows={2}
              placeholder="Ex: Adoro sci-fi..."
            />
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Sua Foto de Perfil
          </label>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((url) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => handleChange("avatar", url)}
                    className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all hover:scale-105 ${
                      formData.avatar === url
                        ? "border-rose-500 ring-2 ring-rose-200"
                        : "border-slate-100 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt="Avatar option"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-slate-100 hidden sm:block"></div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, "avatar")}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-slate-500 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex flex-col items-center justify-center gap-2 group bg-white"
              >
                <span className="text-sm font-bold">Enviar Foto</span>
              </button>

              <div className="mt-2">
                <input
                  type="text"
                  value={customAvatar}
                  onChange={(e) => {
                    setCustomAvatar(e.target.value);
                    if (e.target.value) handleChange("avatar", e.target.value);
                  }}
                  placeholder="Cole um link..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white text-slate-800 border border-slate-200 focus:border-rose-300 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Selection */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Papel de Parede (Capa)
          </label>

          <div className="space-y-6">
            {/* Gradients */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {(Object.keys(THEMES) as Array<string>).map((themeKey) => (
                <button
                  type="button"
                  key={themeKey}
                  onClick={() => handleChange("coverTheme", themeKey)}
                  className={`h-12 rounded-lg transition-all shadow-sm flex items-center justify-center relative overflow-hidden group ${
                    formData.coverTheme === themeKey
                      ? "ring-2 ring-slate-800 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <div className={`absolute inset-0 ${THEMES[themeKey]}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Salvar Perfil
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileConfig;
