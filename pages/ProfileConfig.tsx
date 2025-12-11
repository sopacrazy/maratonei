//
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

// --- LISTA EXPANDIDA DE AVATARES (Vários Estilos) ---
const AVATARS = [
  // Estilo Micah (Clean)
  "http://api.dicebear.com/9.x/micah/svg?seed=Felix",
  "http://api.dicebear.com/9.x/micah/svg?seed=Aneka",
  // Estilo Notionists (Preto e Branco Moderno)
  "http://api.dicebear.com/9.x/notionists/svg?seed=Callie",
  "http://api.dicebear.com/9.x/notionists/svg?seed=Bandit",
  // Estilo Adventurer (RPG / Cartoon)
  "http://api.dicebear.com/9.x/adventurer/svg?seed=Cookie",
  "http://api.dicebear.com/9.x/adventurer/svg?seed=Gizmo",
  // Estilo Avataaars (Clássico Tech)
  "http://api.dicebear.com/9.x/avataaars/svg?seed=Scooby",
  "http://api.dicebear.com/9.x/avataaars/svg?seed=Velma",
  // Estilo Lorelei (Artístico)
  "http://api.dicebear.com/9.x/lorelei/svg?seed=Sasha",
  "http://api.dicebear.com/9.x/lorelei/svg?seed=Willow",
  // Estilo Open Peeps (Desenhado a Mão)
  "http://api.dicebear.com/9.x/open-peeps/svg?seed=Buddy",
  "http://api.dicebear.com/9.x/open-peeps/svg?seed=Granny",
  // Estilo Pixel Art (Retro)
  "http://api.dicebear.com/9.x/pixel-art/svg?seed=Mario",
  // Estilo Robôs (Fun)
  "http://api.dicebear.com/9.x/bottts/svg?seed=C3PO",
];

const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserProfile>({
    name: profile?.name || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
    coverTheme: profile?.coverTheme || "sunset",
  });

  const [customAvatar, setCustomAvatar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // NOVO: Estado de sucesso
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Link dinâmico
  const profileLink = `${
    window.location.origin
  }/#/profile/${formData.name.replace(/\s+/g, "")}`;

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
    // Limpa mensagens ao digitar
    if (field === "name") {
      setError("");
      setSuccess("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const storedUser = localStorage.getItem("userProfile");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) throw new Error("Usuário não identificado.");

      const response = await fetch(
        `http://72.61.57.51:3001/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar perfil.");
      }

      const updatedUserComplete = {
        ...JSON.parse(storedUser || "{}"),
        ...formData,
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedUserComplete));

      onUpdateProfile(formData);

      // MUDANÇA: Não navega mais. Mostra sucesso.
      setSuccess("Perfil salvo com sucesso!");

      // Remove a mensagem de sucesso depois de 3 segundos (opcional)
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverTheme"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string")
          handleChange(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileLink);
    alert("Link copiado!");
  };

  const getCoverStyle = () => {
    const theme = formData.coverTheme || "sunset";
    if (THEMES[theme]) return THEMES[theme];
    return `url('${theme}')`;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
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
        <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative group shadow-sm">
          <div
            className={`h-48 w-full bg-cover bg-center transition-all ${
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

          <div className="px-8 pb-8 -mt-16 relative flex flex-col sm:flex-row items-end gap-6">
            <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl relative z-10 shrink-0">
              <img
                src={
                  formData.avatar ||
                  "http://api.dicebear.com/9.x/micah/svg?seed=placeholder"
                }
                alt="Avatar"
                className="w-full h-full rounded-full bg-slate-200 object-cover"
              />
            </div>
            <div className="pb-2 w-full">
              <h3 className="font-black text-slate-800 text-3xl leading-tight flex items-center gap-2">
                {formData.name || "Seu Nome"}
              </h3>
              <p className="text-slate-500 font-medium truncate max-w-md">
                {formData.bio || "Sua bio aparece aqui..."}
              </p>
            </div>
          </div>
        </div>

        {/* Link Share Box */}
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
            <div className="bg-white p-2 rounded-full shadow-sm text-rose-500 shrink-0">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-800 text-sm">
                Seu Link Único
              </h4>
              <p className="text-slate-500 text-xs truncate">{profileLink}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors shadow-sm w-full sm:w-auto shrink-0"
          >
            Copiar
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Seu Nome / Apelido
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-800 border outline-none transition-all ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : success
                    ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    : "border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                }`}
                placeholder="Ex: sopacrazy"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>

            {/* LÓGICA DE FEEDBACK (Erro ou Sucesso) */}
            {error ? (
              <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1 animate-pulse">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </p>
            ) : success ? (
              <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1 animate-pulse">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {success}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-2 ml-1">
                Este nome será usado no seu login e link público.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Bio / Frase de Efeito
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all resize-none"
              rows={1}
              style={{ height: "50px" }}
              placeholder="Ex: Adoro sci-fi..."
            />
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Escolha seu Avatar
          </label>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {AVATARS.map((url) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => handleChange("avatar", url)}
                    className={`relative rounded-xl aspect-square overflow-hidden border-2 transition-all hover:scale-105 ${
                      formData.avatar === url
                        ? "border-rose-500 ring-2 ring-rose-200 shadow-md scale-105"
                        : "border-slate-100 opacity-80 hover:opacity-100 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt="Avatar option"
                      className="w-full h-full object-cover bg-slate-50"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-slate-100 hidden md:block"></div>

            <div className="md:w-1/3">
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
                className="w-full h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-xl p-4 text-slate-500 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex flex-col items-center justify-center gap-2 group bg-slate-50"
              >
                <span className="text-sm font-bold">Enviar Própria</span>
              </button>
              <div className="mt-3">
                <input
                  type="text"
                  value={customAvatar}
                  onChange={(e) => {
                    setCustomAvatar(e.target.value);
                    if (e.target.value) handleChange("avatar", e.target.value);
                  }}
                  placeholder="Ou cole um link..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-rose-300 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Selection (Mantido Igual) */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Papel de Parede (Capa)
          </label>
          <div className="space-y-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {(Object.keys(THEMES) as Array<string>).map((themeKey) => (
                <button
                  type="button"
                  key={themeKey}
                  onClick={() => handleChange("coverTheme", themeKey)}
                  className={`h-16 rounded-xl transition-all shadow-sm flex items-center justify-center relative overflow-hidden group ${
                    formData.coverTheme === themeKey
                      ? "ring-4 ring-slate-100 scale-105 border-2 border-slate-800"
                      : "hover:scale-105 border border-transparent"
                  }`}
                >
                  <div className={`absolute inset-0 ${THEMES[themeKey]}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving || !!error}
            className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileConfig;
