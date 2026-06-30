/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ArrowRight, Play, CheckCircle, Save, Sparkles, AlertCircle } from 'lucide-react';
import { Game, GameItem } from '../types';
import { Language, translations } from '../translations';

interface CreatePageProps {
  userId: string;
  nickname: string;
  onSaveGame: (game: Game) => void;
  onSelectGame: (gameId: string) => void;
  language: Language;
}

export default function CreatePage({ userId, nickname, onSaveGame, onSelectGame, language }: CreatePageProps) {
  const t = translations[language];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Humor');
  const [coverEmoji, setCoverEmoji] = useState('🎮');
  const [isPublic, setIsPublic] = useState(true);
  const [items, setItems] = useState<GameItem[]>([
    { id: '1', name: '', description: '', image: '🍔' },
    { id: '2', name: '', description: '', image: '🏖️' },
    { id: '3', name: '', description: '', image: '🎧' },
  ]);

  const [savedGameId, setSavedGameId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['Humor', 'Lifestyle', 'Romance', 'Finance', 'Skena', 'Misteri', 'Lainnya'];
  const emojis = ['🎮', '☕', '🍜', '💖', '💸', '🎧', '🍔', '🏖️', '✈️', '🐶', '🚗', '🔥', '📚', '🎬', '👗', '🏠'];

  const categoryTranslations: Record<string, Record<Language, string>> = {
    Humor: { id: 'Humor', en: 'Humor' },
    Lifestyle: { id: 'Lifestyle', en: 'Lifestyle' },
    Romance: { id: 'Romance', en: 'Romance' },
    Finance: { id: 'Finance', en: 'Finance' },
    Skena: { id: 'Skena', en: 'Skena/Scene' },
    Misteri: { id: 'Misteri', en: 'Mystery' },
    Lainnya: { id: 'Lainnya', en: 'Others' }
  };

  const handleAddItem = () => {
    if (items.length >= 10) {
      setErrorMsg(t.create.errorLimitMax);
      return;
    }
    const nextId = (items.length + 1).toString();
    setItems([...items, { id: nextId, name: '', description: '', image: emojis[Math.floor(Math.random() * emojis.length)] }]);
    setErrorMsg('');
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 3) {
      setErrorMsg(t.create.errorLimitMin);
      return;
    }
    setItems(items.filter((item) => item.id !== id));
    setErrorMsg('');
  };

  const handleItemChange = (id: string, field: 'name' | 'description' | 'image', value: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg(t.create.errorTitleDesc);
      return;
    }

    // Verify all items are filled
    const invalidItem = items.find((item) => !item.name.trim());
    if (invalidItem) {
      setErrorMsg(t.create.errorItems);
      return;
    }

    const newGameId = `custom-${Date.now()}`;
    const newGame: Game = {
      id: newGameId,
      title: title.trim(),
      description: description.trim() || (language === 'id' ? 'Kuis kustom buatan komunitas.' : 'Custom community-made quiz.'),
      category,
      creator: nickname || (language === 'id' ? 'Anonim' : 'Anonymous'),
      creatorId: userId,
      createdAt: new Date().toISOString(),
      likes: 0,
      plays: 0,
      shares: 0,
      rating: 5.0,
      isPublic,
      coverEmoji,
      items: items.map((item, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        name: item.name.trim(),
        description: item.description.trim() || (language === 'id' ? 'Item seru untuk di-swipe!' : 'An interesting item to swipe!'),
        image: item.image || '✨',
      })),
    };

    onSaveGame(newGame);
    setSavedGameId(newGameId);
    setErrorMsg('');
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('Humor');
    setCoverEmoji('🎮');
    setIsPublic(true);
    setItems([
      { id: '1', name: '', description: '', image: '🍔' },
      { id: '2', name: '', description: '', image: '🏖️' },
      { id: '3', name: '', description: '', image: '🎧' },
    ]);
    setSavedGameId(null);
  };

  if (savedGameId) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center bg-white border-4 border-black rounded-[32px] mt-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="w-20 h-20 bg-yellow-300 text-black border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          🎉
        </div>
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">{t.create.successTitle}</h2>
        <p className="text-xs text-gray-700 leading-relaxed mb-6 font-bold mt-2">
          {t.create.successDesc.replace('{title}', title)}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onSelectGame(savedGameId)}
            className="w-full bg-[#2ECC71] text-white border-4 border-black hover:-translate-y-0.5 font-black py-3.5 rounded-2xl text-sm transition shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
          >
            <Play size={14} className="fill-white stroke-none" />
            <span>{t.create.tryGameBtn}</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full bg-white hover:bg-gray-100 border-2 border-black text-black font-black py-3 rounded-2xl text-xs transition cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase tracking-wider"
          >
            {t.create.createOtherBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black uppercase italic tracking-tight flex items-center gap-2">
          {t.create.title}
        </h1>
        <p className="text-xs text-gray-700 font-bold">{t.create.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic settings card */}
        <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-4">
          <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-dashed border-black pb-3">
            <Sparkles size={16} className="text-black fill-black" />
            <span>{t.create.formTitle}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase tracking-wider">{t.create.gameTitleLabel}</label>
              <input
                type="text"
                placeholder={t.create.gameTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={45}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase tracking-wider">{t.create.categoryLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryTranslations[cat]?.[language] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase tracking-wider">{t.create.descriptionLabel}</label>
            <textarea
              placeholder={t.create.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={150}
              rows={2}
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            />
          </div>

          {/* Emoji Cover picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-black text-black uppercase tracking-wider">{t.create.emojiLabel}</label>
              <div className="flex flex-wrap gap-2 p-3 bg-purple-100 rounded-xl border-2 border-black max-h-32 overflow-y-auto shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCoverEmoji(emoji)}
                    className={`text-xl p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                      coverEmoji === emoji ? 'bg-yellow-300 scale-110 border-2 border-black' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility option */}
            <div className="flex flex-col justify-center space-y-2">
              <label className="text-xs font-black text-black uppercase tracking-wider">{t.create.visibilityLabel}</label>
              <div className="flex items-center space-x-3 bg-pink-100 border-2 border-black p-3.5 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer"
                />
                <label htmlFor="is-public" className="text-xs font-black text-black uppercase tracking-wider cursor-pointer">
                  {t.create.visibilityCheckbox}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Items Deck list */}
        <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-dashed border-black pb-3">
            <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <span>{t.create.listTitle}</span>
            </h2>
            <span className="text-xs font-black text-black bg-purple-300 border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              {items.length} / 10 {t.create.itemCountLabel}
            </span>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-100 border-2 border-black p-4 rounded-2xl relative grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute -top-2 -right-2 bg-[#FF4D4D] border-2 border-black hover:-translate-y-0.5 text-white p-1.5 rounded-full transition cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    title="Remove Item"
                  >
                    <Trash2 size={12} className="stroke-[2.5px]" />
                  </button>

                  {/* Emoji selector */}
                  <div className="sm:col-span-2 text-center space-y-1">
                    <label className="text-[9px] font-black text-black uppercase tracking-wider block">{t.create.emojiCol}</label>
                    <select
                      value={item.image}
                      onChange={(e) => handleItemChange(item.id, 'image', e.target.value)}
                      className="bg-white border-2 border-black rounded-lg p-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black mx-auto block cursor-pointer"
                    >
                      {emojis.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Name */}
                  <div className="sm:col-span-10 space-y-1">
                    <label className="text-[9px] font-black text-black uppercase tracking-wider block">{t.create.itemNameCol} #{index + 1}</label>
                    <input
                      type="text"
                      placeholder={language === 'id' ? 'Contoh: Motor Klasik Skena' : 'Example: Indie Vinyl Record'}
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      maxLength={30}
                      className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full border-2 border-dashed border-black hover:bg-yellow-100 text-black font-black py-3 rounded-2xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            <Plus size={14} className="stroke-[2.5px]" />
            <span>{t.create.addNewItemBtn}</span>
          </button>
        </div>

        {/* Feedback / Error Alerts */}
        {errorMsg && (
          <div className="bg-red-200 border-2 border-black text-black px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <AlertCircle size={14} className="stroke-[2.5px]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white border-4 border-black hover:-translate-y-0.5 font-black py-4 rounded-2xl text-sm transition shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
        >
          <Save size={16} />
          <span>{t.create.submitBtn}</span>
        </button>
      </form>
    </div>
  );
}
