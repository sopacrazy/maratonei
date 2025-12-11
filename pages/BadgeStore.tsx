import React, { useState } from "react";
import { UserBadge } from "../types"; // Assumindo que UserBadge é importado
import { useNavigate } from "react-router-dom";

// Definindo o tipo base para a loja
interface ShopBadge extends UserBadge {
  price: number;
}

// Tipo estendido para selos criados por usuários
interface UserShopBadge extends ShopBadge {
  sellerName: string;
  sellerAvatar: string;
  rarity: "Comum" | "Raro" | "Épico" | "Lendário";
}

// --- FUNÇÃO UTILITÁRIA DE RARIDADE (MOVIDA PARA FORA DO COMPONENTE) ---
const getRarityClass = (rarity: string) => {
  switch (rarity) {
    case "Raro":
      return "bg-blue-100 text-blue-700";
    case "Épico":
      return "bg-purple-100 text-purple-700";
    case "Lendário":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-500";
  }
};
// --- FIM FUNÇÃO UTILITÁRIA ---

// --- SELOS OFICIAIS DA MARATONEI ---
const SHOP_BADGES_MOCK: ShopBadge[] = [
  {
    key: "MASTER_CRITIC",
    title: "Mestre Crítico",
    description: "Avaliou 100 séries e dominou a arte da crítica.",
    image: "/selo1.png",
    price: 500,
  },
  {
    key: "SPOILER_KING",
    title: "Rei do Spoiler",
    description: "Recompensado por criar 10+ posts marcados como spoiler.",
    image: "/post.png",
    price: 250,
  },
  {
    key: "NIGHT_OWL",
    title: "Coruja Noturna",
    description: "Maratonou por mais de 48 horas seguidas.",
    image: "/selo.png",
    price: 1000,
  },
  {
    key: "EARLY_ADOPTER",
    title: "Primeiro Membro",
    description: "Um selo para os que chegaram cedo no Maratonei.",
    image: "/selo1.png",
    price: 100,
  },
];

// --- MOCK DE SELOS VENDIDOS POR USUÁRIOS ---
const USER_SHOP_BADGES_MOCK: UserShopBadge[] = [
  {
    key: "FAN_ART_SERIES_A",
    title: "Fã de Arte - Got",
    description: "Selo colecionável de Game of Thrones (Criado por Fã).",
    image: "/post.png",
    price: 300,
    sellerName: "SopaCrazy",
    sellerAvatar: "http://api.dicebear.com/9.x/micah/svg?seed=SopaCrazy",
    rarity: "Raro",
  },
  {
    key: "EPIC_QUOTE_DARK",
    title: "Citação Épica (Dark)",
    description: "Arte inspirada na série Dark (Edição Limitada).",
    image: "/selo1.png",
    price: 1500,
    sellerName: "Ana Colecionadora",
    sellerAvatar: "http://api.dicebear.com/9.x/micah/svg?seed=Ana",
    rarity: "Lendário",
  },
];

// O Dashboard enviará a lista de selos conquistados para que a loja saiba o que já foi comprado.
const BadgeStore: React.FC<{ userBadges: UserBadge[] }> = ({ userBadges }) => {
  // Mock Saldo Maracoin
  const [maracoinBalance, setMaracoinBalance] = useState(1500);
  const navigate = useNavigate();
  // NOVO ESTADO: Modal de Venda
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Função mock para compra (Front-end apenas)
  const handlePurchase = (badge: ShopBadge | UserShopBadge) => {
    if (maracoinBalance >= badge.price) {
      // Em um sistema real, você chamaria a API de compra aqui.
      alert(`Você comprou ${badge.title} por ${badge.price} Maracoins!`);
      setMaracoinBalance((prev) => prev - badge.price);
      // NOTA: Para ver o selo no mural, o usuário teria que recarregar o app para o App.tsx buscar do backend.
    } else {
      alert("Saldo insuficiente!");
    }
  };

  const isOwned = (key: string) => userBadges.some((b) => b.key === key);

  // Icone Maracoin Mock
  const MaracoinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="text-yellow-500"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9m0 1a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
    </svg>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Painel de Saldo Maracoin */}
      <div className="bg-slate-800 p-6 rounded-3xl text-white shadow-xl mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">
            Mercado de Selos
          </h2>
          <p className="text-slate-400 text-sm">
            Use seus Maracoins para desbloquear colecionáveis.
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold uppercase tracking-wider text-yellow-300 block">
            Seu Saldo
          </span>
          <span className="text-4xl font-black text-yellow-500 flex items-center gap-2 drop-shadow-md">
            <MaracoinIcon />
            {maracoinBalance}
          </span>
        </div>
      </div>

      {/* Botão de Venda e Seção 1 */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2">
          Conquistas Oficiais
        </h3>

        {/* NOVO BOTÃO DE VENDA */}
        <button
          onClick={() => setIsSellModalOpen(true)}
          className="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-rose-600 transition-all flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M4.54.434l1.517 1.488L7.33 4.29a3.298 3.298 0 0 0-.256 1.059L7.96 8.35a.5.5 0 0 0 .998 0l.847-3.003a.5.5 0 1 0-.486-.137L8.71 7.218a2.3 2.3 0 0 1 .45 1.018l-1.077 3.824a.5.5 0 0 0 .616.634l.036-.008 1.458-1.547a.5.5 0 0 0 .584-.069l3.053-3.262a.5.5 0 0 0-.584-.792l-3.23 2.146L8 10.707V2.5a.5.5 0 0 0-1 0v8.207l-1.428-1.429a.5.5 0 0 0-.707.707l1.768 1.768a.5.5 0 0 0 .707 0l4.243-4.243a.5.5 0 0 0-.707-.707L11.515 4.54a.5.5 0 0 0-.583-.069L7.84 6.78a.5.5 0 0 0-.707 0L5.385 4.793a.5.5 0 0 0-.707.707l1.768 1.768a.5.5 0 0 0 .707 0l2.121-2.121a.5.5 0 0 0 0-.707l-2.121-2.121a.5.5 0 0 0-.707 0L.434 4.54a.5.5 0 0 0 .707.707L3.146 3.242a.5.5 0 0 0-.707-.707L.434 4.54z" />
          </svg>
          Vender Selo
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {SHOP_BADGES_MOCK.map((badge) => {
          const owned = isOwned(badge.key);
          return (
            <div
              key={badge.key}
              className={`bg-white p-4 rounded-2xl shadow-lg flex flex-col items-center text-center transition-all ${
                owned
                  ? "opacity-70 border-4 border-green-200"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              <img
                src={badge.image}
                alt={badge.title}
                className={`w-20 h-20 object-contain mb-3 ${
                  owned ? "grayscale" : ""
                }`}
              />
              <h4 className="font-bold text-slate-800 text-base mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-500 mb-4 h-10 overflow-hidden">
                {badge.description}
              </p>

              {owned ? (
                <button className="w-full bg-green-500 text-white font-bold py-2 rounded-xl text-sm opacity-100 cursor-default">
                  Conquistado!
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(badge)}
                  disabled={maracoinBalance < badge.price}
                  className={`w-full font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1 ${
                    maracoinBalance >= badge.price
                      ? "bg-yellow-500 text-slate-900 hover:bg-yellow-600"
                      : "bg-slate-300 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {badge.price}
                  <MaracoinIcon />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* --- SEÇÃO 2: MERCADO DA COMUNIDADE (Usuários) --- */}
      <h3 className="text-2xl font-black text-slate-800 mb-6 border-b border-slate-200 pb-2">
        Mercado da Comunidade
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {USER_SHOP_BADGES_MOCK.map((badge) => {
          const owned = isOwned(badge.key);
          return (
            <div
              key={badge.key}
              className={`bg-white p-4 rounded-2xl shadow-lg flex flex-col items-center text-center transition-all ${
                owned
                  ? "opacity-70 border-4 border-green-200"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              {/* Vendedor e Raridade */}
              <div className="w-full flex justify-between items-center mb-3">
                <div className="flex items-center gap-1">
                  <img
                    src={badge.sellerAvatar}
                    className="w-6 h-6 rounded-full"
                    alt={badge.sellerName}
                  />
                  <span className="text-[10px] font-bold text-slate-600">
                    {badge.sellerName}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getRarityClass(
                    badge.rarity
                  )}`}
                >
                  {badge.rarity}
                </span>
              </div>

              <img
                src={badge.image}
                alt={badge.title}
                className={`w-20 h-20 object-contain mb-3 ${
                  owned ? "grayscale" : ""
                }`}
              />

              <h4 className="font-bold text-slate-800 text-base mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-500 mb-4 h-10 overflow-hidden">
                {badge.description}
              </p>

              {owned ? (
                <button className="w-full bg-green-500 text-white font-bold py-2 rounded-xl text-sm opacity-100 cursor-default">
                  Colecionado!
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(badge)}
                  disabled={maracoinBalance < badge.price}
                  className={`w-full font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1 ${
                    maracoinBalance >= badge.price
                      ? "bg-yellow-500 text-slate-900 hover:bg-yellow-600"
                      : "bg-slate-300 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {badge.price}
                  <MaracoinIcon />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        *Nota: Você precisará adicionar as imagens **maracoin.png**,
        **selo.png**, **post.png** e **selo1.png** na pasta **public** para
        exibição completa.
      </div>

      {/* --- MODAL DE VENDA DE SELO (NOVO) --- */}
      {isSellModalOpen && (
        <SellBadgeModal
          onClose={() => setIsSellModalOpen(false)}
          userBadges={userBadges}
          // Simulação de adição à lista (Para testes)
          onSell={(data) => {
            console.log("SELO PRONTO PARA VENDA:", data);
            alert(
              `Selo ${data.selectedBadge?.title} listado por ${data.price} Maracoins!`
            );
            setIsSellModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default BadgeStore;

// -------------------------------------------
// --- NOVO COMPONENTE: MODAL DE VENDA ---
// -------------------------------------------

interface SellBadgeModalProps {
  onClose: () => void;
  userBadges: UserBadge[];
  onSell: (data: {
    selectedBadge: UserBadge | undefined;
    price: number;
    rarity: string;
  }) => void;
}

const RARITIES = ["Comum", "Raro", "Épico", "Lendário"];

const SellBadgeModal: React.FC<SellBadgeModalProps> = ({
  onClose,
  userBadges,
  onSell,
}) => {
  const [selectedBadgeKey, setSelectedBadgeKey] = useState("");
  const [price, setPrice] = useState(0);
  const [rarity, setRarity] = useState<"Comum" | "Raro" | "Épico" | "Lendário">(
    "Comum"
  );

  // Encontra o selo selecionado para preencher os detalhes
  const selectedBadge = userBadges.find((b) => b.key === selectedBadgeKey);

  // Determina se o botão de venda deve estar ativo
  const isSellDisabled = !selectedBadge || price <= 0 || rarity === "Comum";

  // Icone Maracoin Mock
  const MaracoinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="text-yellow-500"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9m0 1a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
    </svg>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSellDisabled) return;

    // Simulação de envio para a loja (o backend registraria isso)
    onSell({
      selectedBadge,
      price,
      rarity,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 animate-pop-in">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-slate-800">
            Listar Selo para Venda
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. SELEÇÃO DO SELO */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Selecione o Selo
            </label>
            <select
              value={selectedBadgeKey}
              onChange={(e) => setSelectedBadgeKey(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-rose-500 focus:border-rose-500"
              required
            >
              <option value="" disabled>
                — Escolha um selo que você possui —
              </option>
              {userBadges.map((badge) => (
                <option key={badge.key} value={badge.key}>
                  {badge.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. PRÉ-VISUALIZAÇÃO DO SELO */}
          {selectedBadge && (
            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4 border border-slate-200">
              <img
                src={selectedBadge.image}
                alt={selectedBadge.title}
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-bold text-slate-800">
                  {selectedBadge.title}
                </p>
                <p className="text-xs text-slate-500 italic">
                  {selectedBadge.description}
                </p>
              </div>
            </div>
          )}

          {/* 3. PREÇO E RARIDADE */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Preço (Maracoins)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  placeholder="Mínimo 1 Maracoin"
                  min="1"
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 pl-10 focus:ring-rose-500 focus:border-rose-500"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MaracoinIcon />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Raridade
              </label>
              <select
                value={rarity}
                onChange={(e) =>
                  setRarity(
                    e.target.value as "Comum" | "Raro" | "Épico" | "Lendário"
                  )
                }
                // Usando getRarityClass para aplicar cor de fundo ao select
                className={`w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-rose-500 focus:border-rose-500 ${getRarityClass(
                  rarity
                )}`}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. BOTÃO DE ENVIO */}
          <button
            type="submit"
            disabled={isSellDisabled}
            className={`w-full font-bold py-3 rounded-xl transition-all ${
              isSellDisabled
                ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-[1.01]"
            }`}
          >
            Listar para Venda ({price} MC)
          </button>
          {isSellDisabled && (
            <p className="text-center text-xs text-red-500">
              Selecione um selo e defina um preço maior que zero.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
