import React from 'react';
import { Compass, Flame, Award, PlusCircle, User, Zap } from 'lucide-react';
import { Language, translations } from '../translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nickname: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Navbar({ activeTab, setActiveTab, nickname, language, setLanguage }: NavbarProps) {
  const t = translations[language];
  const navItems = [
    { id: 'landing', label: t.nav.home, icon: Zap },
    { id: 'explore', label: t.nav.explore, icon: Compass },
    { id: 'leaderboard', label: t.nav.leaderboard, icon: Award },
    { id: 'create', label: t.nav.create, icon: PlusCircle },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 md:px-8 py-3.5 flex justify-between items-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 hover:opacity-90 cursor-pointer text-left"
        >
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center rotate-3 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className="text-xl font-black text-black">{t.brandLogo}!</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-black uppercase italic">
            {t.brandLeft}<span className="text-yellow-500">{t.brandRight}</span>
          </h1>
        </button>

        {/* Tab Links - Desktop */}
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border-2 ${
                  isActive
                    ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] -translate-y-[1px]'
                    : 'text-black border-transparent hover:bg-gray-100 hover:border-black'
                }`}
              >
                <Icon size={14} className="stroke-[2.5px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language & User Badge */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center space-x-1 bg-white border-2 border-black px-2.5 py-1.5 rounded-xl text-xs font-black text-black cursor-pointer hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            title={language === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
          >
            <span>{t.langSwitcher}</span>
          </button>

          {nickname ? (
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 bg-purple-400 border-2 border-black px-3.5 py-1.5 rounded-xl text-xs font-black text-black cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-black animate-pulse"></div>
              <span className="truncate max-w-[100px]">{nickname}</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="bg-pink-300 border-2 border-black px-3.5 py-1.5 rounded-xl text-xs font-black text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer transition-all uppercase"
            >
              {language === 'id' ? 'Atur Nickname' : 'Set Nickname'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation - Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t-4 border-black py-2.5 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex justify-around items-center rounded-t-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black' 
                  : 'text-gray-700 font-bold border-2 border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
