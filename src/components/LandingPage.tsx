import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Plus, ArrowRight, ThumbsUp } from 'lucide-react';
import { Game } from '../types';
import { Language, translations } from '../translations';

interface LandingPageProps {
  nickname: string;
  setNickname: (name: string) => void;
  games: Game[];
  onSelectGame: (gameId: string) => void;
  setActiveTab: (tab: string) => void;
  language: Language;
}

export default function LandingPage({
  nickname,
  setNickname,
  games,
  onSelectGame,
  setActiveTab,
  language,
}: LandingPageProps) {
  const [tempNickname, setTempNickname] = useState(nickname);
  const [isEditing, setIsEditing] = useState(!nickname);
  const t = translations[language];

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim());
      setIsEditing(false);
    }
  };

  // Sort games by plays to get the popular ones
  const popularGames = [...games].sort((a, b) => b.plays - a.plays).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Hero Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative"
      >
        <span className="inline-flex items-center space-x-1.5 bg-yellow-400 border-2 border-black text-black text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 rotate-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <Sparkles size={12} className="text-black" />
          <span>{t.landing.subtitle}</span>
        </span>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black leading-none mb-6 uppercase italic">
          {t.landing.heroTitleLeft}
          <span className="bg-[#2ECC71] text-white px-3 py-1.5 rounded-2xl border-4 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] rotate-[-1deg] inline-block font-black">
            {t.landing.heroTitleKeep}
          </span>
          {t.landing.heroTitleMiddle}
          <br />
          Swipe{' '}
          <span className="bg-[#FF4D4D] text-white px-3 py-1.5 rounded-2xl border-4 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] rotate-[1.5deg] inline-block font-black mt-2">
            {t.landing.heroTitleDiscard}
          </span>
          {t.landing.heroTitleRight}
        </h1>
        
        <p className="text-base text-gray-700 max-w-xl mx-auto font-bold leading-relaxed">
          {t.landing.heroDesc}
        </p>
      </motion.div>

      {/* Nickname Setter Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-pink-100 border-4 border-black rounded-[32px] p-6 md:p-8 mb-12 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      >
        {isEditing ? (
          <form onSubmit={handleSaveNickname} className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-black text-black mb-2 uppercase tracking-tight">{t.landing.nicknamePrompt}</h2>
            <p className="text-xs text-gray-700 mb-4 font-bold">{t.landing.nicknameSub}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={t.landing.nicknamePlaceholder}
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                maxLength={20}
                className="flex-1 bg-white border-4 border-black rounded-2xl px-5 py-3.5 text-base font-bold text-black focus:outline-none placeholder:text-gray-400 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 border-4 border-black text-black font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer"
              >
                {t.landing.saveNicknameBtn}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-purple-400 border-4 border-black text-black flex items-center justify-center rounded-2xl font-black text-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-purple-800 font-black uppercase tracking-widest">{t.landing.readyToPlay}</div>
                <h3 className="text-2xl font-black text-black">{t.landing.hello}, {nickname}!</h3>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            >
              {t.landing.changeNicknameBtn}
            </button>
          </div>
        )}
      </motion.div>

      {/* Popular Games Featured */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">{t.landing.viralTitle}</h2>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center space-x-1 text-xs font-black uppercase tracking-wider text-black hover:text-yellow-600 cursor-pointer"
          >
            <span>{t.landing.seeAllBtn}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularGames.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -5 }}
              className="bg-white border-4 border-black rounded-[30px] p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 bg-yellow-300 border-2 border-black rounded-2xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">{game.coverEmoji || '🎮'}</span>
                  <span className="text-[10px] font-black uppercase text-black bg-purple-300 px-3 py-1 rounded-full border-2 border-black">
                    {game.category}
                  </span>
                </div>
                <h3 className="text-lg font-black text-black leading-snug mb-2 uppercase">{game.title}</h3>
                <p className="text-xs text-gray-700 font-bold line-clamp-3 leading-relaxed mb-4">{game.description}</p>
              </div>

              <div>
                {/* Stats Bar */}
                <div className="flex items-center justify-between text-xs font-black text-black mb-4 pt-4 border-t-2 border-dashed border-black">
                  <div className="flex items-center space-x-1">
                    <Play size={12} className="text-black fill-black" />
                    <span>{game.plays.toLocaleString()}{t.landing.playsCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp size={12} className="text-black fill-black" />
                    <span>{game.likes.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!nickname) {
                      setIsEditing(true);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    } else {
                      onSelectGame(game.id);
                    }
                  }}
                  className="w-full bg-[#2ECC71] border-4 border-black hover:-translate-y-0.5 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] cursor-pointer"
                >
                  <Play size={14} className="fill-white stroke-none" />
                  <span>{t.landing.playGameBtn}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-blue-500 border-4 border-black rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      >
        <div className="z-10 text-center md:text-left">
          <h3 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-2 uppercase italic tracking-tight">
            {t.landing.ctaTitle}
          </h3>
          <p className="text-white/95 max-w-md text-sm font-bold leading-relaxed">
            {t.landing.ctaDesc}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="bg-yellow-400 text-black border-4 border-black hover:-translate-y-0.5 font-black px-6 py-4 rounded-2xl text-xs uppercase tracking-wider transition shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center space-x-2 z-10 cursor-pointer"
        >
          <Plus size={16} />
          <span>{t.landing.ctaButton}</span>
        </button>
      </motion.div>
    </div>
  );
}
