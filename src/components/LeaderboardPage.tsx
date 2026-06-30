/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Flame, ThumbsUp, Play, Heart, Star, PieChart, ChevronRight } from 'lucide-react';
import { Game } from '../types';
import { Language, translations } from '../translations';

interface LeaderboardPageProps {
  games: Game[];
  globalResults: any[];
  onSelectGame: (gameId: string) => void;
  language: Language;
}

export default function LeaderboardPage({ games, globalResults = [], onSelectGame, language }: LeaderboardPageProps) {
  const t = translations[language];
  
  // Most Popular by Plays
  const popularGames = [...games].sort((a, b) => b.plays - a.plays).slice(0, 5);
  
  // Highest Rated
  const highestLiked = [...games].sort((a, b) => b.likes - a.likes).slice(0, 5);

  // Calculate actual fun swipe stats from games and globalResults
  const totalPlays = globalResults.length > 0 ? globalResults.length : games.reduce((sum, g) => sum + g.plays, 0);
  const totalLikes = games.reduce((sum, g) => sum + g.likes, 0);

  // Compute decisions ratio (Keep vs Discard)
  let totalKeeps = 0;
  let totalDiscards = 0;
  globalResults.forEach((res) => {
    if (res.decisions && Array.isArray(res.decisions)) {
      res.decisions.forEach((dec: any) => {
        if (dec.decision === 'keep') totalKeeps++;
        if (dec.decision === 'discard') totalDiscards++;
      });
    }
  });
  const totalDecisions = totalKeeps + totalDiscards;
  const keepRatio = totalDecisions > 0 ? Math.round((totalKeeps / totalDecisions) * 100) : 50;
  const discardRatio = totalDecisions > 0 ? 100 - keepRatio : 50;

  // Compute item frequencies for fun facts
  const itemStats: { [key: string]: { name: string; keeps: number; total: number } } = {};
  globalResults.forEach((res) => {
    if (res.decisions && Array.isArray(res.decisions)) {
      res.decisions.forEach((dec: any) => {
        const key = `${res.gameId}_${dec.itemId}`;
        if (!itemStats[key]) {
          itemStats[key] = { name: dec.itemName || dec.itemId, keeps: 0, total: 0 };
        }
        itemStats[key].total++;
        if (dec.decision === 'keep') {
          itemStats[key].keeps++;
        }
      });
    }
  });

  const itemStatsArray = Object.values(itemStats).filter((item) => item.total > 0);

  // Find most kept and most discarded
  const mostKept = [...itemStatsArray]
    .sort((a, b) => (b.keeps / b.total) - (a.keeps / a.total) || b.total - a.total)
    .shift();

  const mostDiscarded = [...itemStatsArray]
    .sort((a, b) => ((a.keeps / a.total) - (b.keeps / b.total)) || b.total - a.total)
    .shift();

  // Dynamic Fun Facts array
  const funFacts = [];

  if (mostKept && mostKept.total > 0) {
    const pct = Math.round((mostKept.keeps / mostKept.total) * 100);
    funFacts.push({
      emoji: '🟢',
      text: language === 'id'
        ? `Item "${mostKept.name}" terpilih sebanyak ${pct}% dari seluruh permainan!`
        : `Item "${mostKept.name}" was chosen in ${pct}% of all games played!`,
      bgColor: 'bg-purple-50'
    });
  } else {
    funFacts.push({
      emoji: '🍜',
      text: language === 'id'
        ? 'Belum ada data cukup untuk menentukan item favorit pilihan komunitas.'
        : 'Not enough play data yet to determine the community\'s favorite item.',
      bgColor: 'bg-purple-50'
    });
  }

  if (mostDiscarded && mostDiscarded.total > 0) {
    const discardPct = Math.round(((mostDiscarded.total - mostDiscarded.keeps) / mostDiscarded.total) * 100);
    funFacts.push({
      emoji: '🔴',
      text: language === 'id'
        ? `Item "${mostDiscarded.name}" dibuang sebanyak ${discardPct}% oleh para pemain!`
        : `Item "${mostDiscarded.name}" was discarded ${discardPct}% of the time!`,
      bgColor: 'bg-pink-50'
    });
  } else {
    funFacts.push({
      emoji: '💔',
      text: language === 'id'
        ? 'Mulai bermain untuk melihat item mana yang paling sering dibuang.'
        : 'Start playing to see which items get discarded most frequently.',
      bgColor: 'bg-pink-50'
    });
  }

  const topGame = popularGames[0];
  if (topGame && topGame.plays > 0) {
    funFacts.push({
      emoji: '🔥',
      text: language === 'id'
        ? `Topik "${topGame.title}" saat ini menjadi yang paling hits dengan ${topGame.plays} total permainan.`
        : `Topic "${topGame.title}" is currently trending with ${topGame.plays} total plays.`,
      bgColor: 'bg-yellow-50'
    });
  } else {
    funFacts.push({
      emoji: '💸',
      text: language === 'id'
        ? 'Nantikan data analisis tren permainan terbaru dari komunitas!'
        : 'Stay tuned for trending game analysis from the community!',
      bgColor: 'bg-yellow-50'
    });
  }

  // Generate top creators list
  const creatorsMap = games.reduce((acc: { [key: string]: { name: string; count: number; likes: number } }, game) => {
    if (!acc[game.creator]) {
      acc[game.creator] = { name: game.creator, count: 0, likes: 0 };
    }
    acc[game.creator].count += 1;
    acc[game.creator].likes += game.likes;
    return acc;
  }, {});

  const topCreators = Object.values(creatorsMap)
    .sort((a, b) => b.likes - a.likes || b.count - a.count)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black uppercase italic tracking-tight flex items-center gap-2">
          {t.leaderboard.title}
        </h1>
        <p className="text-xs text-gray-700 font-bold">{t.leaderboard.subtitle}</p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-yellow-200 border-4 border-black p-5 rounded-[30px] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">{t.leaderboard.statPlayed}</span>
          <div className="text-3xl font-black text-black uppercase">{totalPlays.toLocaleString()}</div>
          <p className="text-[10px] text-gray-700 font-bold mt-1">{t.leaderboard.statPlayedSub}</p>
        </div>

        <div className="bg-pink-200 border-4 border-black p-5 rounded-[30px] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">{t.leaderboard.statLikes}</span>
          <div className="text-3xl font-black text-black uppercase">{totalLikes.toLocaleString()}</div>
          <p className="text-[10px] text-gray-700 font-bold mt-1">{t.leaderboard.statLikesSub}</p>
        </div>

        <div className="bg-purple-200 border-4 border-black p-5 rounded-[30px] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">{t.leaderboard.statRatio}</span>
          <div className="text-3xl font-black text-black uppercase">{keepRatio}% vs {discardRatio}%</div>
          <p className="text-[10px] text-gray-700 font-bold mt-1">{t.leaderboard.statRatioSub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Popular Games List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black text-black tracking-tight mb-4 flex items-center gap-1.5 uppercase italic">
              <Flame size={18} className="text-black fill-black animate-pulse" />
              <span>{t.leaderboard.popularTitle}</span>
            </h3>

            <div className="space-y-4">
              {popularGames.map((game, idx) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-black bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer group shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl border-2 border-black font-black text-sm flex items-center justify-center shadow-[1px_1px_0_0_rgba(0,0,0,1)] ${
                      idx === 0 ? 'bg-yellow-300 text-black' :
                      idx === 1 ? 'bg-pink-300 text-black' :
                      idx === 2 ? 'bg-purple-300 text-black' : 'bg-white text-black'
                    }`}>
                      #{idx + 1}
                    </div>

                    {/* Emoji Cover */}
                    <span className="text-2xl p-1 bg-white border-2 border-black rounded-lg">{game.coverEmoji || '🎮'}</span>

                    {/* Title */}
                    <div>
                      <h4 className="text-sm font-black text-black leading-snug uppercase group-hover:underline transition">
                        {game.title}
                      </h4>
                      <p className="text-[10px] text-gray-700 font-bold uppercase tracking-tight">{language === 'id' ? 'Kategori' : 'Category'}: {game.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs font-black text-black uppercase">{game.plays.toLocaleString()}</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{t.leaderboard.dimainkan}</div>
                    </div>
                    <ChevronRight size={14} className="text-black stroke-[2.5px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Rated */}
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black text-black tracking-tight mb-4 flex items-center gap-1.5 uppercase italic">
              <Star size={18} className="text-black fill-yellow-400" />
              <span>{t.leaderboard.likedTitle}</span>
            </h3>

            <div className="space-y-4">
              {highestLiked.map((game, idx) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-black bg-pink-100 hover:bg-pink-200 transition cursor-pointer group shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-xl border-2 border-black font-black text-sm flex items-center justify-center bg-white text-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      ❤️
                    </div>
                    <span className="text-2xl p-1 bg-white border-2 border-black rounded-lg">{game.coverEmoji || '🎮'}</span>
                    <div>
                      <h4 className="text-sm font-black text-black leading-snug uppercase group-hover:underline transition">
                        {game.title}
                      </h4>
                      <p className="text-[10px] text-gray-700 font-bold uppercase tracking-tight">{t.common.by} @{game.creator}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-600 flex items-center justify-end gap-0.5 uppercase">
                        <Heart size={10} className="fill-rose-600 stroke-none animate-pulse" />
                        <span>{game.likes.toLocaleString()}</span>
                      </div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{t.leaderboard.suka}</div>
                    </div>
                    <ChevronRight size={14} className="text-black stroke-[2.5px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Creators Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] text-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider mb-5 flex items-center gap-1.5 text-yellow-400 italic">
              <Award size={16} className="stroke-[2.5px]" />
              <span>{t.leaderboard.topCreatorsTitle}</span>
            </h3>

            <div className="space-y-4">
              {topCreators.map((creator, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border-2 border-black">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full border-2 border-black font-black text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">@{creator.name}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{creator.count} {t.leaderboard.gamesCreated}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-yellow-400 flex items-center justify-end gap-0.5 uppercase">
                      <ThumbsUp size={10} className="fill-yellow-400 stroke-none" />
                      <span>{creator.likes}</span>
                    </div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{t.leaderboard.totalLikes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swipe Fun Facts */}
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black text-black uppercase tracking-widest mb-4 flex items-center gap-1">
              <PieChart size={12} className="stroke-[2.5px]" />
              <span>{t.leaderboard.funFactsTitle}</span>
            </h3>

            <ul className="space-y-4 text-xs font-bold text-black">
              {funFacts.map((fact, idx) => (
                <li key={idx} className={`flex items-start gap-2 ${fact.bgColor} p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}>
                  <span className="text-base">{fact.emoji}</span>
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
