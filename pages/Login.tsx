import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // --- LÓGICA DE REGISTRO ---
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        if (password.length < 4) {
          throw new Error("Senha muito curta (mínimo 4 caracteres).");
        }

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

        setShowSuccess(true); // Mostra o modal de sucesso
      } else {
        // --- LÓGICA DE LOGIN (Agora Real!) ---
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha ao entrar.");
        }

        // Se o login deu certo:
        // 1. Salva os dados do usuário no navegador para o app usar
        localStorage.setItem("userProfile", JSON.stringify(data.user));

        // 2. Avisa o App.tsx que estamos logados
        onLogin();

        // 3. Redireciona
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
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
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    toggleMode(); // Vai para a tela de login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-100/60 blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-100/60 blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-yellow-100/60 blur-3xl opacity-60 mix-blend-multiply"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md p-6">
        {/* Logo Area */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500 shadow-lg shadow-rose-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="text-3xl">🍿</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight font-heading">
            Mara<span className="text-rose-500">tonei</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Sua vida em episódios.
          </p>
        </div>

        {/* Clean Light Card */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/50 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 font-heading">
            {isRegistering ? "Nova Assinatura" : "De volta ao sofá?"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {isRegistering
              ? "Crie seu perfil para rastrear suas maratonas."
              : "Faça login para continuar de onde parou."}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <div className="relative group">
                  <input
                    type="text"
                    required={isRegistering}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all font-medium"
                    placeholder="Como quer ser chamado?"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all font-medium"
                placeholder={
                  isRegistering ? "Seu melhor email" : "Email ou usuário"
                }
              />
            </div>

            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all font-medium"
                placeholder="Senha"
              />
            </div>

            {isRegistering && (
              <div className="relative group">
                <input
                  type="password"
                  required={isRegistering}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all font-medium"
                  placeholder="Confirme a senha"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
                <svg
                  className="w-4 h-4 shrink-0"
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-slate-900/10 transition-all transform active:scale-95 flex items-center justify-center mt-6"
            >
              {loading ? (
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
              ) : isRegistering ? (
                "Criar Perfil"
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm">
              {isRegistering ? "Já tem conta?" : "Primeira vez aqui?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-rose-600 font-bold hover:text-rose-700 transition-colors hover:underline"
              >
                {isRegistering ? "Faça login" : "Cadastre-se"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2024 Maratonei. Feito para maratonistas.
        </p>
      </div>

      {/* Modal de Sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={handleCloseSuccess}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 animate-fade-in-up text-center border-4 border-rose-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 font-heading">
              Sucesso!
            </h3>
            <p className="text-slate-500 mb-6 font-medium">
              Sua conta foi criada. Agora você faz parte do elenco! 🎬
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
            >
              Ir para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
