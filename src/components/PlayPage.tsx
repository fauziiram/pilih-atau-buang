/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'motion/react';
import { ThumbsUp, ThumbsDown, ArrowLeft, Sparkles, Check, X, HelpCircle } from 'lucide-react';
import { Game, GameItem, SwipeDecision } from '../types';
import { Language, translations } from '../translations';

interface PlayPageProps {
  game: Game;
  nickname: string;
  onBack: () => void;
  onFinishGame: (decisions: SwipeDecision[]) => void;
  language: Language;
}

export default function PlayPage({ game, nickname, onBack, onFinishGame, language }: PlayPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<SwipeDecision[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [manuallySwiped, setManuallySwiped] = useState<string[]>([]);
  const t = translations[language];

  const currentItem = game.items[currentIndex];
  const totalItems = game.items.length;
  const progressPercent = Math.round((currentIndex / totalItems) * 100);

  // Motion values for swipe gesture
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Custom overlays for swipe indicators
  const keepOpacity = useTransform(x, [0, 120], [0, 1]);
  const discardOpacity = useTransform(x, [-120, 0], [1, 0]);

  const controls = useAnimation();

  // Handle automatic slide triggers via buttons
  const handleButtonSwipe = async (direction: 'keep' | 'discard') => {
    if (currentIndex >= totalItems) return;

    setSwipeDirection(direction === 'keep' ? 'right' : 'left');

    // Animate the card out of the screen
    await controls.start({
      x: direction === 'keep' ? 400 : -400,
      opacity: 0,
      rotate: direction === 'keep' ? 25 : -25,
      transition: { duration: 0.35 }
    });

    recordDecision(direction);
  };

  const recordDecision = (type: 'keep' | 'discard') => {
    const newDecision: SwipeDecision = {
      itemId: currentItem.id,
      itemName: currentItem.name,
      decision: type
    };
    const updatedDecisions = [...decisions, newDecision];

    // Check counts of keep vs discard in updatedDecisions
    const keepCount = updatedDecisions.filter(d => d.decision === 'keep').length;
    const discardCount = updatedDecisions.filter(d => d.decision === 'discard').length;
    const halfLimit = Math.ceil(totalItems / 2);

    if (keepCount >= halfLimit || discardCount >= halfLimit) {
      // Game finishes early! Fill the remaining items to the OTHER decision type
      const filledDecisions = [...updatedDecisions];
      const swipedItemIds = new Set(filledDecisions.map(d => d.itemId));
      const finalDecisionType = keepCount >= halfLimit ? 'discard' : 'keep';
      
      const manuallySwipedIds = updatedDecisions.map(d => d.itemId);
      setManuallySwiped(manuallySwipedIds);

      game.items.forEach(item => {
        if (!swipedItemIds.has(item.id)) {
          filledDecisions.push({
            itemId: item.id,
            itemName: item.name,
            decision: finalDecisionType
          });
        }
      });
      
      setDecisions(filledDecisions);
      setShowReview(true);
      return;
    }

    setDecisions(updatedDecisions);

    // Reset coordinates and proceed to next card
    x.set(0);
    y.set(0);
    setSwipeDirection(null);
    setCurrentIndex((prev) => prev + 1);
  };

  // Listen to drag ends
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      // Swipe Right -> Keep
      recordDecision('keep');
    } else if (info.offset.x < -threshold) {
      // Swipe Left -> Discard
      recordDecision('discard');
    } else {
      // Return card to center
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 15 } });
    }
  };

  // Reset animations when card index changes
  useEffect(() => {
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
  }, [currentIndex, controls]);

  // Handle when game completes naturally
  useEffect(() => {
    if (currentIndex > 0 && currentIndex === totalItems && !showReview && !isAnalyzing) {
      setManuallySwiped(decisions.map(d => d.itemId));
      setShowReview(true);
    }
  }, [currentIndex, totalItems, decisions, showReview, isAnalyzing]);

  // Support completing early where remaining items are balanced to keep both categories equal
  const handleCompleteEarly = () => {
    const completeDecisions = [...decisions];
    const halfLimit = Math.ceil(totalItems / 2);
    
    let currentKeep = completeDecisions.filter(d => d.decision === 'keep').length;
    let currentDiscard = completeDecisions.filter(d => d.decision === 'discard').length;
    
    setManuallySwiped(decisions.map(d => d.itemId));

    for (let i = currentIndex; i < totalItems; i++) {
      const item = game.items[i];
      if (!completeDecisions.some((d) => d.itemId === item.id)) {
        const decType = currentKeep < halfLimit ? 'keep' : 'discard';
        if (decType === 'keep') {
          currentKeep++;
        } else {
          currentDiscard++;
        }
        completeDecisions.push({
          itemId: item.id,
          itemName: item.name,
          decision: decType
        });
      }
    }
    setDecisions(completeDecisions);
    setShowReview(true);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-6 text-center">
        <span className="text-6xl mb-4 animate-bounce">🤖</span>
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">{t.play.loadingPersonality}</h2>
        <p className="text-xs text-gray-700 font-bold mt-2">{t.play.loadingPersonalitySub}</p>
        <div className="w-16 h-16 border-4 border-black border-t-yellow-400 rounded-full animate-spin mt-8"></div>
      </div>
    );
  }

  const nextItem = currentIndex + 1 < totalItems ? game.items[currentIndex + 1] : null;

  // Compute real-time chosen and discarded items
  const chosenItems: GameItem[] = [];
  const discardedItems: GameItem[] = [];

  game.items.forEach((item, idx) => {
    const decisionObj = decisions.find((d) => d.itemId === item.id);
    if (showReview) {
      if (decisionObj?.decision === 'discard') {
        discardedItems.push(item);
      } else if (decisionObj?.decision === 'keep') {
        chosenItems.push(item);
      }
    } else {
      if (idx < currentIndex) {
        if (decisionObj?.decision === 'discard') {
          discardedItems.push(item);
        } else if (decisionObj?.decision === 'keep') {
          chosenItems.push(item);
        }
      }
    }
  });

  if (showReview) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8 flex flex-col justify-between min-h-[85vh]">
        {/* Play Header / Back button */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black px-3.5 py-2 rounded-xl cursor-pointer hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            >
              <ArrowLeft size={14} className="stroke-[2.5px]" />
              <span>{t.common.back}</span>
            </button>

            <span className="text-xs font-black uppercase tracking-wider text-black bg-purple-300 border-2 border-black px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <Sparkles size={12} className="animate-spin text-black fill-black" />
              <span>{game.title}</span>
            </span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
              {language === 'id' ? '🔮 Kompilasi Pilihanmu!' : '🔮 Your Choice Compilation!'}
            </h2>
            <p className="text-xs md:text-sm text-gray-700 font-bold mt-2">
              {language === 'id' 
                ? 'Berikut adalah ringkasan kartu yang terpilih dan terbuang. Klik tombol di bawah untuk mendapatkan analisis kepribadian AI!'
                : 'Here is the summary of kept and discarded cards. Click the button below to get your AI personality analysis!'}
            </p>
          </div>
        </div>

        {/* Side-by-side lists with animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start my-4 max-w-4xl mx-auto w-full">
          
          {/* Left Column: Discarded (Kiri) */}
          <div className="bg-[#FDEDEC] border-4 border-black p-6 rounded-[32px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col min-h-[300px] w-full">
            <h3 className="text-sm font-black text-[#FF4D4D] uppercase tracking-wider mb-4 flex items-center justify-between border-b-4 border-black pb-2.5">
              <span>🔴 {t.play.discarded}</span>
              <span className="bg-[#FF4D4D] text-white px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black text-xs">
                {discardedItems.length}
              </span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {discardedItems.map((item, idx) => {
                const isAuto = !manuallySwiped.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                    className="text-xs font-bold text-black bg-white border-2 border-black p-3 rounded-2xl flex items-center justify-between gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg shrink-0">{item.image || '✨'}</span>
                      <div className="truncate text-left">
                        <p className="font-black text-black uppercase truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate">{item.description}</p>
                      </div>
                    </div>
                    {isAuto && (
                      <span className="shrink-0 bg-yellow-200 border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-black">
                        🤖 Auto
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Kept (Kanan) */}
          <div className="bg-[#E8F8F5] border-4 border-black p-6 rounded-[32px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col min-h-[300px] w-full">
            <h3 className="text-sm font-black text-[#27AE60] uppercase tracking-wider mb-4 flex items-center justify-between border-b-4 border-black pb-2.5">
              <span>🟢 {t.play.chosen}</span>
              <span className="bg-[#2ECC71] text-white px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black text-xs">
                {chosenItems.length}
              </span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {chosenItems.map((item, idx) => {
                const isAuto = !manuallySwiped.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                    className="text-xs font-bold text-black bg-white border-2 border-black p-3 rounded-2xl flex items-center justify-between gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg shrink-0">{item.image || '✨'}</span>
                      <div className="truncate text-left">
                        <p className="font-black text-black uppercase truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate">{item.description}</p>
                      </div>
                    </div>
                    {isAuto && (
                      <span className="shrink-0 bg-yellow-200 border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-black">
                        🤖 Auto
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* CTA Trigger Button */}
        <div className="flex flex-col items-center mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsAnalyzing(true);
              onFinishGame(decisions);
            }}
            className="w-full max-w-md bg-yellow-300 text-black border-4 border-black hover:-translate-y-0.5 font-black py-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] cursor-pointer uppercase tracking-wider text-sm"
          >
            <Sparkles size={18} className="fill-black stroke-[2.5px]" />
            <span>
              {language === 'id' ? 'Dapatkan Analisis Kepribadian AI ✦' : 'Get AI Personality Analysis ✦'}
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8 flex flex-col justify-between min-h-[85vh]">
      {/* Play Header / Back button */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black px-3.5 py-2 rounded-xl cursor-pointer hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
          >
            <ArrowLeft size={14} className="stroke-[2.5px]" />
            <span>{t.common.back}</span>
          </button>

          <span className="text-xs font-black uppercase tracking-wider text-black bg-purple-300 border-2 border-black px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Sparkles size={12} className="animate-spin text-black fill-black" />
            <span>{game.title}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="flex justify-between items-center text-xs font-black text-black uppercase tracking-wider mb-2">
            <span>{t.play.progressLabel}</span>
            <span>{currentIndex} / {totalItems} {t.play.itemLabel}</span>
          </div>
          <div className="w-full bg-white h-5 rounded-full overflow-hidden border-2 border-black p-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-yellow-400 h-full rounded-full border-r-2 border-black"
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-6 items-start mt-4">
        
        {/* LEFT COLUMN / BOTTOM-LEFT: Discarded (DISCARD) Column */}
        <div className="col-span-1 md:col-span-3 order-2 md:order-1 bg-[#FDEDEC] border-4 border-black p-4 rounded-[24px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col min-h-[200px] md:min-h-[400px]">
          <div className="text-[10px] md:text-xs font-black text-[#FF4D4D] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b-2 border-[#FF4D4D]/20 pb-2">
            <span>🔴 {t.play.discarded}</span>
            <span className="bg-[#FF4D4D] text-white px-2 py-0.5 rounded text-[10px] border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] font-black">
              {discardedItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[160px] md:max-h-[350px] space-y-2 pr-1">
            {discardedItems.length > 0 ? (
              discardedItems.map((item) => (
                <div
                  key={item.id}
                  className="text-[10px] md:text-xs font-bold text-black bg-white border-2 border-black p-1.5 md:p-2 rounded-xl flex items-center gap-1.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
                >
                  <span className="text-xs shrink-0">{item.image || '✨'}</span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))
            ) : (
              <span className="text-[9px] md:text-[10px] text-gray-400 font-bold italic block text-center mt-6">{t.common.empty}</span>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Swipe Deck Stage & Controls */}
        <div className="col-span-2 md:col-span-6 order-1 md:order-2 flex flex-col items-center">
          {/* Deck Stage */}
          <div className="relative w-full max-w-[340px] h-[360px] flex items-center justify-center select-none">
            {/* Decorative Back Cards */}
            <div className="absolute w-full h-full bg-yellow-200 border-4 border-black rounded-[40px] translate-x-3 translate-y-3"></div>
            <div className="absolute w-full h-full bg-pink-200 border-4 border-black rounded-[40px] translate-x-1.5 translate-y-1.5"></div>

            {/* Current Interactive Card */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{ x, y, rotate, opacity }}
              animate={controls}
              onDragEnd={handleDragEnd}
              className="absolute w-full h-full bg-white border-4 border-black rounded-[40px] p-6 shadow-xl cursor-grab active:cursor-grabbing flex flex-col justify-between z-10"
            >
              {/* Swiping Indicator Overlays */}
              <motion.div
                style={{ opacity: keepOpacity }}
                className="absolute inset-0 bg-emerald-500/10 rounded-[40px] pointer-events-none border-4 border-emerald-500 flex items-center justify-center z-20"
              >
                <div className="bg-[#2ECC71] text-white border-4 border-black font-black text-sm px-4 py-2 rounded-2xl rotate-12 flex items-center gap-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] uppercase tracking-wider">
                  <Check size={16} className="stroke-[3px]" />
                  <span>KEEP</span>
                </div>
              </motion.div>

              <motion.div
                style={{ opacity: discardOpacity }}
                className="absolute inset-0 bg-rose-500/10 rounded-[40px] pointer-events-none border-4 border-rose-500 flex items-center justify-center z-20"
              >
                <div className="bg-[#FF4D4D] text-white border-4 border-black font-black text-sm px-4 py-2 rounded-2xl -rotate-12 flex items-center gap-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] uppercase tracking-wider">
                  <X size={16} className="stroke-[3px]" />
                  <span>DISCARD</span>
                </div>
              </motion.div>

              {currentItem && (
                <div>
                  {/* Visual Cover Accent */}
                  <div className="w-full h-40 bg-gray-50 rounded-2xl flex flex-col items-center justify-center relative mb-4 border-2 border-black border-dashed overflow-hidden">
                    <div className="absolute top-2 right-2 bg-black text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                      Item #{currentIndex + 1}
                    </div>
                    
                    {/* Cover emoji or icon placeholder */}
                    <span className="text-6xl filter drop-shadow-md animate-wiggle">
                      {currentItem.image || (game.coverEmoji || '✨')}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-black leading-snug mb-2 uppercase">
                    {currentItem.name}
                  </h3>
                  
                  <p className="text-xs text-gray-700 font-bold leading-relaxed">
                    {currentItem.description}
                  </p>
                </div>
              )}

              <div className="text-[9px] font-black text-black uppercase tracking-tight text-center flex items-center justify-center gap-1 bg-yellow-100 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <HelpCircle size={10} className="text-black" />
                <span>{t.play.swipeHelp}</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Manual Buttons */}
          <div className="flex items-center justify-center space-x-6 mt-6">
            {/* Discard Button (Left) */}
            <button
              onClick={() => handleButtonSwipe('discard')}
              className="w-16 h-16 bg-[#FF4D4D] border-4 border-black text-white hover:-translate-y-0.5 rounded-full flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer"
              title="Discard"
            >
              <X size={28} className="stroke-[3px]" />
            </button>

            {/* Swipe Hint */}
            <span className="text-xs font-black text-black tracking-widest select-none">
              {language === 'id' ? 'ATAU' : 'OR'}
            </span>

            {/* Keep Button (Right) */}
            <button
              onClick={() => handleButtonSwipe('keep')}
              className="w-16 h-16 bg-[#2ECC71] border-4 border-black text-white hover:-translate-y-0.5 rounded-full flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer"
              title="Keep"
            >
              <Check size={28} className="stroke-[3px]" />
            </button>
          </div>

          {/* Hint / Rules Panel */}
          <div className="w-full max-w-[340px] mt-6 border-4 border-black bg-white rounded-[20px] p-3.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] text-center">
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-tight">
              {t.play.ruleHint.replace('{limit}', Math.ceil(totalItems / 2).toString())}
            </p>
            {/* Finish early button */}
            {currentIndex > 0 && currentIndex < totalItems && (
              <button
                onClick={handleCompleteEarly}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-black hover:-translate-y-0.5 font-black py-2.5 mt-2.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Sparkles size={10} className="fill-white stroke-none" />
                <span>{t.play.finishEarlyBtn.replace('{count}', (totalItems - currentIndex).toString())}</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN / BOTTOM-RIGHT: Chosen (KEEP) Column */}
        <div className="col-span-1 md:col-span-3 order-3 bg-[#E8F8F5] border-4 border-black p-4 rounded-[24px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col min-h-[200px] md:min-h-[400px]">
          <div className="text-[10px] md:text-xs font-black text-[#27AE60] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b-2 border-[#27AE60]/20 pb-2">
            <span>🟢 {t.play.chosen}</span>
            <span className="bg-[#2ECC71] text-white px-2 py-0.5 rounded text-[10px] border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] font-black">
              {chosenItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[160px] md:max-h-[350px] space-y-2 pr-1">
            {chosenItems.length > 0 ? (
              chosenItems.map((item) => {
                const isCurrent = currentItem && item.id === currentItem.id;
                return (
                  <div
                    key={item.id}
                    className={`text-[10px] md:text-xs font-bold text-black p-1.5 md:p-2 rounded-xl flex items-center justify-between gap-1.5 border-2 border-black transition-all ${
                      isCurrent
                        ? 'bg-yellow-200 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] animate-pulse'
                        : 'bg-white shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs shrink-0">{item.image || '✨'}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-[9px] md:text-[10px] text-gray-400 font-bold italic block text-center mt-6">{t.common.empty}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
