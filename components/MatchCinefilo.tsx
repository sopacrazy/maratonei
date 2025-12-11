<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { UserSeries, SeriesStatus } from "../types";
=======
import React, { useState, useMemo } from 'react';
import { UserSeries, SeriesStatus } from '../types';
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02

interface MatchCinefiloProps {
  myList: UserSeries[];
}

const SIMULATED_FRIEND = {
<<<<<<< HEAD
  name: "Ana Cineasta",
  avatar: "http://api.dicebear.com/9.x/micah/svg?seed=Ana",
  // Generates a list that is likely to match partially
  favorites: [
    "Dark",
    "Breaking Bad",
    "The Bear",
    "Succession",
    "Severance",
    "Friends",
  ],
=======
  name: 'Ana Cineasta',
  avatar: 'https://api.dicebear.com/9.x/micah/svg?seed=Ana',
  // Generates a list that is likely to match partially
  favorites: ['Dark', 'Breaking Bad', 'The Bear', 'Succession', 'Severance', 'Friends']
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
};

const MatchCinefilo: React.FC<MatchCinefiloProps> = ({ myList }) => {
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Logic to calculate match
  const matchData = useMemo(() => {
<<<<<<< HEAD
    const myTitles = myList.map((s) => s.title);
    const friendTitles = SIMULATED_FRIEND.favorites;

    // Find intersection (shared shows)
    const shared = myTitles.filter((title) =>
      friendTitles.some((ft) => ft.toLowerCase() === title.toLowerCase())
=======
    const myTitles = myList.map(s => s.title);
    const friendTitles = SIMULATED_FRIEND.favorites;
    
    // Find intersection (shared shows)
    const shared = myTitles.filter(title => 
      friendTitles.some(ft => ft.toLowerCase() === title.toLowerCase())
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
    );

    // If no real match in list, simulate one for the demo effect if the user has added common shows
    // otherwise use the real intersection
    const displayShared = shared.length > 0 ? shared : [];
<<<<<<< HEAD

    // Calculate percentage (heuristic)
    // Base 40% + (15% per shared show) capped at 95%
    let percentage = 40 + displayShared.length * 15;
=======
    
    // Calculate percentage (heuristic)
    // Base 40% + (15% per shared show) capped at 95%
    let percentage = 40 + (displayShared.length * 15);
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
    if (displayShared.length === 0 && myList.length > 0) percentage = 15; // Low match
    if (percentage > 98) percentage = 98;

    return { percentage, shared: displayShared };
  }, [myList]);

  const handleMatch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1500);
  };

  if (myList.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
<<<<<<< HEAD

=======
      
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-white/20 p-2 rounded-lg text-xl">🤝</span>
          <h3 className="font-bold text-lg">Match Cinéfilo</h3>
        </div>

        {!showResult ? (
          <div className="text-center py-4">
            <p className="text-indigo-100 text-sm mb-6">
              Descubra sua compatibilidade com outros maratonistas da rede.
            </p>
            <button
              onClick={handleMatch}
              disabled={loading}
              className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
<<<<<<< HEAD
                  <svg
                    className="animate-spin h-4 w-4 text-indigo-700"
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
=======
                  <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
                  </svg>
                  Calculando...
                </>
              ) : (
<<<<<<< HEAD
                "Comparar com Amigo"
=======
                'Comparar com Amigo'
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
              )}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in bg-white/10 rounded-2xl p-4 border border-white/20">
<<<<<<< HEAD
            <div className="flex items-center gap-3 mb-3">
              <img
                src={SIMULATED_FRIEND.avatar}
                alt="Friend"
                className="w-10 h-10 rounded-full border-2 border-white bg-indigo-200"
              />
              <div>
                <p className="text-xs text-indigo-200 font-bold uppercase">
                  Comparado com
                </p>
                <p className="font-bold text-sm">{SIMULATED_FRIEND.name}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-2xl font-black text-green-300">
                  {matchData.percentage}%
                </span>
              </div>
            </div>

            {matchData.shared.length > 0 ? (
              <div className="text-xs text-indigo-100">
                <p className="mb-2">Vocês amam:</p>
                <div className="flex flex-wrap gap-2">
                  {matchData.shared.map((title) => (
                    <span
                      key={title}
                      className="bg-white/20 px-2 py-1 rounded-md font-bold"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-indigo-100 italic">
                Gostos opostos! Vocês têm muito a ensinar um ao outro.
              </p>
            )}

            <button
              onClick={() => setShowResult(false)}
              className="mt-4 w-full text-xs font-bold text-indigo-200 hover:text-white py-2"
            >
              Tentar outro perfil
            </button>
=======
             <div className="flex items-center gap-3 mb-3">
               <img src={SIMULATED_FRIEND.avatar} alt="Friend" className="w-10 h-10 rounded-full border-2 border-white bg-indigo-200" />
               <div>
                 <p className="text-xs text-indigo-200 font-bold uppercase">Comparado com</p>
                 <p className="font-bold text-sm">{SIMULATED_FRIEND.name}</p>
               </div>
               <div className="ml-auto text-right">
                  <span className="text-2xl font-black text-green-300">{matchData.percentage}%</span>
               </div>
             </div>

             {matchData.shared.length > 0 ? (
               <div className="text-xs text-indigo-100">
                 <p className="mb-2">Vocês amam:</p>
                 <div className="flex flex-wrap gap-2">
                   {matchData.shared.map(title => (
                     <span key={title} className="bg-white/20 px-2 py-1 rounded-md font-bold">{title}</span>
                   ))}
                 </div>
               </div>
             ) : (
               <p className="text-xs text-indigo-100 italic">
                 Gostos opostos! Vocês têm muito a ensinar um ao outro.
               </p>
             )}
             
             <button 
               onClick={() => setShowResult(false)}
               className="mt-4 w-full text-xs font-bold text-indigo-200 hover:text-white py-2"
             >
               Tentar outro perfil
             </button>
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
          </div>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default MatchCinefilo;
=======
export default MatchCinefilo;
>>>>>>> 6ecbef1f8035315057e2f76abad02ee127fa1a02
