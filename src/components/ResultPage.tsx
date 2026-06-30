/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  Twitter,
  MessageSquare,
  Facebook,
  RotateCcw,
  Flag,
  Heart,
  TrendingUp,
  BrainCircuit,
  Smile,
  Star
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Game, AIResult, SwipeDecision } from '../types';
import { Language, translations } from '../translations';

interface ResultPageProps {
  game: Game;
  nickname: string;
  result: AIResult;
  decisions?: SwipeDecision[];
  onPlayAgain: () => void;
  language: Language;
  onShare?: () => void;
  onRate?: (rating: number) => void;
}

export default function ResultPage({ game, nickname, result, decisions = [], onPlayAgain, language, onShare, onRate }: ResultPageProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[language];

  const chosenDecisions = decisions.filter((d) => d.decision === 'keep');
  const discardedDecisions = decisions.filter((d) => d.decision === 'discard');

  const getGameItem = (itemId: string) => {
    return game.items.find((item) => item.id === itemId);
  };

  // Trigger HTML5 Canvas Confetti on Mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Confetti particles
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 6 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
    }));

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
          p.tilt = Math.random() * 10 - 5;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // End confetti after 5 seconds to save resources
    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, 5000);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  const handleCopyLink = () => {
    const brandName = language === 'id' ? 'Pilih atau Buang' : 'Keep or Discard';
    const textToCopy = `${language === 'id' ? 'Hasil AI Personality Quiz-ku di' : 'My AI Personality Quiz result on'} ${brandName}! \n${language === 'id' ? 'Julukanku' : 'My title'}: "${result.alias}" \n\n${language === 'id' ? 'Mainkan di sini' : 'Play here'}: ${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onShare) onShare();
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    setDownloading(true);
    try {
      // Ensure fonts and images are fully loaded
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2.5, // Crisp resolution for mobile share
        useCORS: true,
        backgroundColor: '#111827', // Rich dark slate theme for card
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const brandName = language === 'id' ? 'PilihAtauBuang' : 'KeepOrDiscard';
      link.download = `${brandName}_${nickname}_${result.alias.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      if (onShare) onShare();
    } catch (err) {
      console.error('Gagal membuat gambar share card:', err);
    } finally {
      setDownloading(false);
    }
  };

  const brandHashtag = language === 'id' ? '#PilihAtauBuang' : '#KeepOrDiscard';
  const shareText = `${language === 'id' ? 'Hasil AI Personality-ku' : 'My AI Personality result'}: "${result.alias}". Analisis: ${result.summary} ${brandHashtag}`;
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      {/* Absolute Confetti Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Hero Spark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-10"
      >
        <span className="inline-flex items-center space-x-1 bg-yellow-400 border-2 border-black text-black text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full mb-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <Sparkles size={12} className="text-black fill-black" />
          <span>{t.result.completedBadge}</span>
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-black uppercase italic tracking-tight">
          {t.result.pageTitle}
        </h1>
        <p className="text-xs text-gray-700 mt-1 font-bold">{t.result.pageDesc}</p>
      </motion.div>

      {/* Detail Pilihan (Dipilih vs Dibuang) - Full Width at Very Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] mb-8"
      >
        <h3 className="text-lg font-black text-black tracking-tight mb-2 flex items-center gap-1.5 uppercase italic">
          <Sparkles size={18} className="text-yellow-500 fill-yellow-300 stroke-black stroke-[2.5px]" />
          <span>{t.result.basisLabel}</span>
        </h3>
        <p className="text-xs text-gray-600 font-bold mb-4">
          {t.result.basisDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DIPILIH (KEEP) */}
          <div className="bg-[#E8F8F5] border-2 border-black p-4 rounded-2xl flex flex-col">
            <div className="text-xs font-black text-[#27AE60] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#27AE60]/20 pb-2">
              <span>🟢 {language === 'id' ? 'DIPILIH' : 'KEPT'} ({chosenDecisions.length})</span>
              <span className="bg-[#2ECC71] text-white px-2 py-0.5 rounded-lg text-[10px] border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] font-black">
                KEEP
              </span>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {chosenDecisions.length > 0 ? (
                chosenDecisions.map((dec) => {
                  const itemDetails = getGameItem(dec.itemId);
                  return (
                    <div key={dec.itemId} className="bg-white border-2 border-black/10 p-2.5 rounded-xl flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{itemDetails?.image || '✨'}</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black text-black leading-tight truncate">{dec.itemName}</h5>
                        {itemDetails?.description && (
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-snug break-words">{itemDetails.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 font-bold italic block text-center py-4">{t.result.noItemChosen}</span>
              )}
            </div>
          </div>

          {/* DIBUANG (DISCARD) */}
          <div className="bg-[#FDEDEC] border-2 border-black p-4 rounded-2xl flex flex-col">
            <div className="text-xs font-black text-[#FF4D4D] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#FF4D4D]/20 pb-2">
              <span>🔴 {language === 'id' ? 'DIBUANG' : 'DISCARDED'} ({discardedDecisions.length})</span>
              <span className="bg-[#FF4D4D] text-white px-2 py-0.5 rounded-lg text-[10px] border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] font-black">
                DISCARD
              </span>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {discardedDecisions.length > 0 ? (
                discardedDecisions.map((dec) => {
                  const itemDetails = getGameItem(dec.itemId);
                  return (
                    <div key={dec.itemId} className="bg-white border-2 border-black/10 p-2.5 rounded-xl flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{itemDetails?.image || '✨'}</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black text-black leading-tight truncate">{dec.itemName}</h5>
                        {itemDetails?.description && (
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-snug break-words">{itemDetails.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 font-bold italic block text-center py-4">{t.result.noItemDiscarded}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Modern UI Results Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Summary Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-4 border-black rounded-[32px] p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-dashed border-black">
              <span className="text-xs font-black text-black bg-purple-300 border-2 border-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <Smile size={14} className="stroke-[2.5px]" /> {nickname}
              </span>
              <span className="text-xs font-black text-black uppercase tracking-wider">{t.result.gameLabel}: {game.title}</span>
            </div>

            <div className="mb-6">
              <span className="text-xs text-gray-500 font-black uppercase tracking-widest">{t.result.aliasLabel}</span>
              <div className="block mt-2">
                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight bg-yellow-300 px-4 py-2.5 border-4 border-black rounded-2xl inline-block shadow-[4px_4px_0_0_rgba(0,0,0,1)] uppercase italic">
                  "{result.alias}"
                </h2>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs text-gray-500 font-black uppercase tracking-widest">{t.result.summaryLabel}</span>
              <p className="text-black text-sm md:text-base leading-relaxed font-bold mt-2 bg-pink-100 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {result.summary}
              </p>
            </div>
          </motion.div>

          {/* Traits Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          >
            <h3 className="text-lg font-black text-black tracking-tight mb-4 flex items-center gap-1.5 uppercase italic">
              <TrendingUp size={18} className="text-black stroke-[2.5px]" />
              <span>{t.result.traitsLabel}</span>
            </h3>

            <div className="space-y-4">
              {result.traits.map((trait, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black text-black uppercase tracking-wider">
                    <span>{trait.name}</span>
                    <span className="text-purple-600">{trait.value}%</span>
                  </div>
                  <div className="w-full bg-white h-5 rounded-full overflow-hidden p-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trait.value}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * idx }}
                      className="bg-yellow-400 h-full rounded-full border-r-2 border-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Flag Lists (Green Flags / Red Flags) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Green Flags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#E8F8F5] border-4 border-black rounded-[30px] p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <h4 className="text-emerald-800 font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="bg-[#A2D9CE] border border-black p-1.5 rounded-xl text-black">🟢</span>
                <span>{t.result.greenFlagsLabel}</span>
              </h4>
              <ul className="space-y-3">
                {result.greenFlags.map((flag, idx) => (
                  <li key={idx} className="text-black text-xs font-bold leading-relaxed flex items-start gap-2">
                    <span className="mt-0.5 font-black text-emerald-600">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Red Flags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#FDEDEC] border-4 border-black rounded-[30px] p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <h4 className="text-rose-800 font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="bg-[#F5B7B1] border border-black p-1.5 rounded-xl text-black">🔴</span>
                <span>{t.result.redFlagsLabel}</span>
              </h4>
              <ul className="space-y-3">
                {result.redFlags.map((flag, idx) => (
                  <li key={idx} className="text-black text-xs font-bold leading-relaxed flex items-start gap-2">
                    <span className="mt-0.5 font-black text-rose-600">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-purple-100 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <span className="text-[10px] text-gray-700 font-black uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit size={10} className="stroke-[2px]" /> {t.result.thinkingStyle}
              </span>
              <div className="text-sm font-black text-black uppercase tracking-tight mt-1">{result.thinkingStyle}</div>
            </div>

            <div className="bg-purple-100 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <span className="text-[10px] text-gray-700 font-black uppercase tracking-wider flex items-center gap-1">
                <Heart size={10} className="stroke-[2px]" /> {t.result.preference}
              </span>
              <div className="text-sm font-black text-black uppercase tracking-tight mt-1">{result.preference}</div>
            </div>

            <div className="bg-purple-100 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <span className="text-[10px] text-gray-700 font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="stroke-[2px]" /> {t.result.decisionType}
              </span>
              <div className="text-sm font-black text-black uppercase tracking-tight mt-1">{result.decisionType}</div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Spotify-Wrapped style Share Card & Sharing controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Share Card to Render to Image */}
          <div className="relative group">
            {/* Visual Spotify Wrapped-like Dark Card */}
            <div
              ref={shareCardRef}
              id="share-card-container"
              className="w-full bg-[#111827] text-white rounded-[32px] p-6 md:p-8 aspect-[3/4] flex flex-col justify-between relative overflow-hidden shadow-2xl border-4 border-black"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-xl bg-yellow-400 text-black border-2 border-black p-1.5 rounded-xl font-black">⚡</span>
                  <span className="text-xs font-black tracking-widest text-white">{language === 'id' ? 'PILIH BUANG AI' : 'KEEP DISCARD AI'}</span>
                </div>
                <span className="text-[9px] font-black uppercase text-yellow-400 border border-yellow-400 px-2.5 py-0.5 rounded-full">#{game.category}</span>
              </div>

              {/* Card Main Body */}
              <div className="my-auto py-4 z-10">
                <div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">
                  {language === 'id' ? `Kepribadian @${nickname}` : `@${nickname}'s Personality`}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-3 uppercase italic">
                  "{result.alias}"
                </h2>
                <div className="w-16 h-1.5 bg-yellow-400 border border-black rounded-full mb-4"></div>
                <p className="text-xs text-white leading-relaxed font-bold bg-slate-900 border-2 border-black p-3.5 rounded-2xl line-clamp-4">
                  {result.summary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="z-10 flex items-center justify-between border-t-2 border-dashed border-slate-800 pt-4">
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{language === 'id' ? 'Topik Game' : 'Game Topic'}</div>
                  <div className="text-xs font-black text-white uppercase">{game.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{language === 'id' ? 'Dibuat di' : 'Created at'}</div>
                  <div className="text-xs font-black text-yellow-400">{language === 'id' ? 'pilihataubuang.fun' : 'keepordiscard.fun'}</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2 border-black uppercase tracking-widest">
              {t.result.shareCardPreview}
            </div>
          </div>

          {/* Share Actions Panel */}
          <div className="bg-white border-4 border-black rounded-[30px] p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-black text-black uppercase tracking-wider mb-1">{t.result.shareTitle}</h3>

            {/* Main CTA buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex items-center justify-center space-x-1.5 bg-[#2ECC71] text-white border-4 border-black hover:-translate-y-0.5 font-black py-3 px-4 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
              >
                <Download size={14} className="stroke-[2.5px]" />
                <span>{downloading ? t.result.downloading : t.result.downloadBtn}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-1.5 bg-yellow-400 text-black border-4 border-black hover:-translate-y-0.5 font-black py-3 px-4 rounded-xl text-xs transition cursor-pointer shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
              >
                {copied ? <Check size={14} className="stroke-[2.5px]" /> : <Copy size={14} className="stroke-[2.5px]" />}
                <span>{copied ? t.result.copied : t.result.copyBtn}</span>
              </button>
            </div>

            {/* Social Share grid */}
            <div className="pt-2 border-t-2 border-dashed border-black">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-3">
                {t.result.socialShareSub}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                  target="_blank; noreferrer"
                  onClick={onShare}
                  className="flex items-center justify-center space-x-1 bg-white border-2 border-black text-black font-black py-2 px-3 rounded-xl text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-50"
                >
                  <Twitter size={12} className="fill-black stroke-none" />
                  <span>X (Twitter)</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodedText}`}
                  target="_blank; noreferrer"
                  onClick={onShare}
                  className="flex items-center justify-center space-x-1 bg-white border-2 border-black text-black font-black py-2 px-3 rounded-xl text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-50"
                >
                  <MessageSquare size={12} className="stroke-[2.5px]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                  target="_blank; noreferrer"
                  onClick={onShare}
                  className="flex items-center justify-center space-x-1 bg-white border-2 border-black text-black font-black py-2 px-3 rounded-xl text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-50"
                >
                  <Facebook size={12} className="fill-black stroke-none" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            {/* Rating Section */}
            <div className="pt-4 border-t-2 border-dashed border-black">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-2">
                {language === 'id' ? 'Beri Rating Topik Ini:' : 'Rate this Topic:'}
              </span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setSelectedRating(star);
                      if (onRate) onRate(star);
                    }}
                    className="p-1 hover:scale-125 transition cursor-pointer text-yellow-400"
                  >
                    <Star
                      size={24}
                      className={star <= (selectedRating || 0) ? "fill-yellow-400 stroke-black stroke-2" : "text-gray-300 stroke-black stroke-2"}
                    />
                  </button>
                ))}
                {selectedRating > 0 && (
                  <span className="text-xs font-black text-black uppercase ml-2 animate-bounce">
                    {language === 'id' ? 'Terima kasih!' : 'Thank you!'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Play Again button */}
          <button
            onClick={onPlayAgain}
            className="w-full bg-blue-500 text-white border-4 border-black hover:-translate-y-0.5 font-black py-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] cursor-pointer uppercase tracking-wider text-sm"
          >
            <RotateCcw size={16} className="stroke-[2.5px]" />
            <span>{t.result.playAgainBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
