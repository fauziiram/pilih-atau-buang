import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Play, Heart, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { Game } from '../types';
import { Language, translations } from '../translations';

interface ExplorePageProps {
  games: Game[];
  nickname: string;
  onSelectGame: (gameId: string) => void;
  onLikeGame: (gameId: string) => void;
  likedGames: string[];
  language: Language;
}

export default function ExplorePage({
  games,
  nickname,
  onSelectGame,
  onLikeGame,
  likedGames,
  language,
}: ExplorePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const t = translations[language];

  // List of all unique categories present plus 'Semua'
  const categories = ['Semua', ...Array.from(new Set(games.map((g) => g.category)))];

  // Filtered list
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight flex items-center gap-2 uppercase italic">
            {t.explore.title}
          </h1>
          <p className="text-sm text-gray-700 font-bold">{t.explore.subtitle}</p>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black z-10">
            <Search size={18} className="stroke-[2.5px]" />
          </div>
          <input
            type="text"
            placeholder={t.explore.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-4 border-black rounded-2xl pl-10 pr-4 py-3 text-sm text-black font-bold focus:outline-none placeholder:text-gray-400 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-gray-200">
        <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap mr-2">
          <Filter size={12} className="stroke-[2.5px]" /> {t.explore.filterLabel}
        </span>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                isActive
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {category === 'Semua' ? t.explore.allCategory : category}
            </button>
          );
        })}
      </div>

      {/* Games List Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredGames.map((game, idx) => {
            const isLiked = likedGames.includes(game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white border-4 border-black rounded-[30px] p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-3 bg-yellow-300 border-2 border-black rounded-2xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">{game.coverEmoji || '🎮'}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase text-black bg-purple-300 px-3 py-1 rounded-full border-2 border-black">
                        {game.category}
                      </span>
                      {game.creator === 'Tim Game Seru' && (
                        <span className="text-[10px] font-black uppercase text-white bg-blue-500 px-3 py-1 rounded-full border-2 border-black flex items-center gap-0.5">
                          <Sparkles size={10} className="fill-white stroke-none" /> {t.common.official}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-black leading-snug mb-2 hover:text-yellow-600 transition cursor-pointer uppercase" onClick={() => onSelectGame(game.id)}>
                    {game.title}
                  </h3>
                  <p className="text-xs text-gray-700 font-bold line-clamp-3 leading-relaxed mb-4">
                    {game.description}
                  </p>
                  
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-4">
                    {t.explore.dibuatOleh} <span className="text-black font-black underline">@{game.creator}</span>
                  </div>
                </div>

                <div>
                  {/* Action row & stats */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-black">
                    <div className="flex space-x-3 text-xs font-black text-black">
                      <div className="flex items-center space-x-1">
                        <Play size={12} className="text-black fill-black" />
                        <span>{game.plays.toLocaleString()} {t.explore.plays}</span>
                      </div>
                      <button
                        onClick={() => onLikeGame(game.id)}
                        className="flex items-center space-x-1 hover:text-rose-500 cursor-pointer group transition"
                      >
                        <Heart
                          size={12}
                          className={`transition ${
                            isLiked
                              ? 'text-rose-500 fill-rose-500 stroke-rose-500'
                              : 'text-black group-hover:text-rose-500'
                          }`}
                        />
                        <span className={isLiked ? 'text-rose-600' : ''}>{game.likes.toLocaleString()}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="bg-[#2ECC71] border-4 border-black hover:-translate-y-0.5 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                    >
                      <Play size={10} className="fill-white stroke-none" />
                      <span>{t.explore.playBtn}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border-4 border-black rounded-[30px] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-black text-black uppercase">{t.explore.noGame}</h3>
          <p className="text-xs text-gray-700 font-bold mt-1 mb-4">{t.explore.noGameSub}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Semua');
            }}
            className="inline-flex items-center space-x-1 bg-yellow-400 border-4 border-black text-black font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-500 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer transition-all"
          >
            <RefreshCw size={12} className="stroke-[2.5px]" />
            <span>{t.explore.resetSearch}</span>
          </button>
        </div>
      )}
    </div>
  );
}
