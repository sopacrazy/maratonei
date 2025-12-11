import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/trending-backgrounds"
        );
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setBackgrounds(data);
        } else {
          setBackgrounds([
            "https://images.unsplash.com/photo-1574375927938-d5a98e8efe85?q=80&w=1000&auto=format&fit=crop",
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar backgrounds:", error);
        setBackgrounds([
          "https://images.unsplash.com/photo-1574375927938-d5a98e8efe85?q=80&w=1000&auto=format&fit=crop",
        ]);
      }
    };
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(intervalId);
  }, [backgrounds]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword)
          throw new Error("As senhas não coincidem.");
        if (password.length < 6)
          throw new Error("A senha deve ter no mínimo 6 caracteres.");
        if (!/\d/.test(password))
          throw new Error("A senha precisa conter pelo menos um número.");

        const response = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${name}`,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha no registro");
        setShowSuccess(true);
      } else {
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao entrar.");

        localStorage.setItem("userProfile", JSON.stringify(data.user));
        onLogin();
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    toggleMode();
  };

  return (
    <>
      {/* Importando a Fonte Inter diretamente */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');`}
      </style>

      <div
        className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4"
        style={{ fontFamily: "'Inter', sans-serif" }} // Aplicando a fonte aqui
      >
        <div className="w-full max-w-[1100px] bg-white rounded-[30px] shadow-2xl overflow-hidden flex min-h-[650px] animate-fade-in relative">
          {/* LADO ESQUERDO: SLIDE SHOW */}
          <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-end p-12 overflow-hidden group">
            {backgrounds.map((bg, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentBgIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={bg}
                  alt="Background Series"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[20s]"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

            <div className="relative z-20 text-white text-left animate-fade-in-up">
              <p className="text-white/90 font-medium text-lg leading-relaxed max-w-sm drop-shadow-md border-l-4 border-rose-500 pl-4">
                Descubra, acompanhe e partilhe a sua paixão por cinema e séries
                num só lugar.
              </p>
              <div className="flex gap-2 mt-6">
                {backgrounds.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      idx === currentBgIndex
                        ? "w-8 bg-rose-500"
                        : "w-2 bg-white/30"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
            <div className="max-w-sm mx-auto w-full">
              {/* LOGO EM DESTAQUE */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 text-rose-500 mb-3 shadow-sm hover:scale-110 transition-transform duration-300 cursor-pointer border border-rose-100">
                  <span className="text-4xl">🍿</span>
                </div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                  Mara<span className="text-rose-500">tonei</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">
                  Sua vida em episódios
                </p>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
                {isRegistering ? "Junte-se ao elenco" : "Bem-vindo de volta!"}
              </h2>
              <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">
                {isRegistering
                  ? "Preencha os dados para criar sua conta."
                  : "Insira suas credenciais para continuar."}
              </p>

              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                  <div className="group">
                    <input
                      type="text"
                      required={isRegistering}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
                      placeholder="Nome de usuário"
                    />
                  </div>
                )}

                <div className="group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
                    placeholder="Seu e-mail"
                  />
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 pr-12"
                    placeholder="Senha secreta"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {isRegistering && (
                  <div className="group">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={isRegistering}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
                      placeholder="Confirme a senha"
                    />
                  </div>
                )}

                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-pulse">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-slate-900/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processando...
                    </>
                  ) : isRegistering ? (
                    "Criar Conta Grátis"
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center flex items-center justify-center gap-2 text-sm font-medium">
                <span className="text-slate-400">
                  {isRegistering ? "Já é membro?" : "Ainda não tem conta?"}
                </span>
                <button
                  onClick={toggleMode}
                  className="text-rose-600 font-bold hover:text-rose-700 hover:underline outline-none"
                >
                  {isRegistering ? "Fazer Login" : "Criar Cadastro"}
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">
                Maratonei © 2024
              </p>
            </div>
          </div>
        </div>

        {/* Modal de Sucesso */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCloseSuccess}
            ></div>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center animate-fade-in-up border-4 border-green-50">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                🎉
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                Sucesso!
              </h3>
              <p className="text-slate-500 mb-6 font-medium">
                Sua conta foi criada. Prepare a pipoca!
              </p>
              <button
                onClick={handleCloseSuccess}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
              >
                Ir para Login
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
