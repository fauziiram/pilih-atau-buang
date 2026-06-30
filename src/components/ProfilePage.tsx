import React, { useState } from 'react';
import { User, Award, Play, Edit2, Check, Sparkles, BookOpen, Clock, Heart, Trash2 } from 'lucide-react';
import { UserStats, AIResult, SwipeDecision } from '../types';
import { Language, translations } from '../translations';

interface ProfilePageProps {
  nickname: string;
  setNickname: (name: string) => void;
  userStats: UserStats;
  savedResults: Array<{ gameTitle: string; result: AIResult; decisions?: SwipeDecision[] }>;
  onViewSavedResult: (resultData: { gameTitle: string; result: AIResult; decisions?: SwipeDecision[] }) => void;
  onClearHistory: () => void;
  language: Language;
}

export default function ProfilePage({
  nickname,
  setNickname,
  userStats,
  savedResults,
  onViewSavedResult,
  onClearHistory,
  language,
}: ProfilePageProps) {
  const [tempNickname, setTempNickname] = useState(nickname);
  const [isEditing, setIsEditing] = useState(false);
  const t = translations[language];

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Profile Header */}
      <div className="bg-white border-4 border-black rounded-[32px] p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-20 h-20 bg-yellow-300 text-black border-4 border-black flex items-center justify-center rounded-[24px] font-black text-4xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            {nickname ? nickname.charAt(0).toUpperCase() : '?'}
          </div>

          <div>
            {isEditing ? (
              <form onSubmit={handleSaveNickname} className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  maxLength={15}
                  className="bg-white border-2 border-black rounded-xl px-4 py-2 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#2ECC71] hover:bg-[#27AE60] text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition"
                >
                  <Check size={12} className="stroke-[3px]" />
                  <span>{t.common.save}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl font-black text-black uppercase tracking-tight italic">
                    {nickname || (language === 'id' ? 'Pemain Misterius' : 'Mysterious Player')}
                  </h2>
                  <button
                    onClick={() => {
                      setTempNickname(nickname);
                      setIsEditing(true);
                    }}
                    className="text-gray-500 hover:text-black hover:scale-110 p-1.5 rounded-lg transition border border-transparent hover:border-black hover:bg-yellow-100"
                    title="Edit Nickname"
                  >
                    <Edit2 size={14} className="stroke-[2.5px]" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                  UID: {t.profile.guestPrefix}-{(userStats.userId || '123').slice(0, 8)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 border-t-2 md:border-t-0 border-black pt-4 md:pt-0 w-full md:w-auto justify-around">
          <div className="text-center">
            <div className="text-2xl font-black text-black uppercase">{userStats.gamesPlayed}</div>
            <div className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{t.profile.statPlayed}</div>
          </div>
          <div className="w-1 h-8 bg-black"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-black uppercase">{userStats.gamesCreated}</div>
            <div className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{t.profile.statCreated}</div>
          </div>
          <div className="w-1 h-8 bg-black"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-black uppercase">{userStats.likedGames.length}</div>
            <div className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{t.profile.statLiked}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Play History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-black">
              <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-1.5 uppercase italic">
                <BookOpen size={18} className="text-black stroke-[2.5px]" />
                <span>{t.profile.historyTitle}</span>
              </h3>

              {savedResults.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] font-black text-black bg-red-300 hover:bg-red-400 border-2 border-black px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  <Trash2 size={12} className="stroke-[2.5px]" />
                  <span>{t.profile.clearHistoryBtn}</span>
                </button>
              )}
            </div>

            {savedResults.length > 0 ? (
              <div className="space-y-4">
                {savedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 border-black bg-purple-50 hover:bg-purple-100 transition group shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-black bg-yellow-300 border-2 border-black px-2 py-0.5 rounded-md uppercase tracking-tight">
                          {item.gameTitle}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <Clock size={10} className="stroke-[2.5px]" /> {t.profile.timeJustNow}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-black uppercase">"{item.result.alias}"</h4>
                      <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed font-bold">
                        {item.result.summary}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewSavedResult(item)}
                      className="mt-3 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-black py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] uppercase tracking-wider"
                    >
                      <Sparkles size={11} className="fill-white stroke-none" />
                      <span>{t.profile.viewResultBtn}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👻</div>
                <h4 className="text-sm font-black text-black uppercase tracking-tight">{t.profile.emptyHistoryTitle}</h4>
                <p className="text-xs text-gray-700 mt-1 max-w-xs mx-auto font-bold">
                  {t.profile.emptyHistorySub}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Badges */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black text-black uppercase tracking-widest mb-4 flex items-center gap-1">
              <Award size={12} className="stroke-[2.5px]" />
              <span>{t.profile.badgesTitle}</span>
            </h3>

            <div className="space-y-4">
              {/* Badge 1: Newbie */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-yellow-100 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="text-2xl">🌱</div>
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-tight">{t.profile.badge1Title}</h4>
                  <p className="text-[10px] text-gray-700 font-bold leading-tight">{t.profile.badge1Sub}</p>
                </div>
                <div className="ml-auto text-emerald-600 font-black text-xs uppercase italic">{t.common.active}</div>
              </div>

              {/* Badge 2: Creator */}
              <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                userStats.gamesCreated > 0
                  ? 'bg-pink-100 text-black'
                  : 'bg-gray-100 opacity-50'
              }`}>
                <div className="text-2xl">🎨</div>
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-tight">{t.profile.badge2Title}</h4>
                  <p className="text-[10px] text-gray-700 font-bold leading-tight">{t.profile.badge2Sub}</p>
                </div>
                {userStats.gamesCreated > 0 && <div className="ml-auto text-pink-600 font-black text-xs uppercase italic">{t.common.active}</div>}
              </div>

              {/* Badge 3: Swiper Master */}
              <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                userStats.gamesPlayed >= 3
                  ? 'bg-purple-100 text-black'
                  : 'bg-gray-100 opacity-50'
              }`}>
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-tight">{t.profile.badge3Title}</h4>
                  <p className="text-[10px] text-gray-700 font-bold leading-tight">{t.profile.badge3Sub}</p>
                </div>
                {userStats.gamesPlayed >= 3 && <div className="ml-auto text-purple-600 font-black text-xs uppercase italic">{t.common.active}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
