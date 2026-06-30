/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Game, AIResult, UserStats, SwipeDecision } from './types';
import { DEFAULT_GAMES } from './data';

import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ExplorePage from './components/ExplorePage';
import PlayPage from './components/PlayPage';
import ResultPage from './components/ResultPage';
import CreatePage from './components/CreatePage';
import LeaderboardPage from './components/LeaderboardPage';
import ProfilePage from './components/ProfilePage';
import { Language, translations } from './translations';


// Simple UUID generator for guests
function generateUUID() {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [nickname, setNicknameState] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('swipequest_language') as Language) || 'id';
  });

  useEffect(() => {
    localStorage.setItem('swipequest_language', language);
  }, [language]);


  // Game Data
  const [games, setGames] = useState<Game[]>(DEFAULT_GAMES);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentResult, setCurrentResult] = useState<AIResult | null>(null);
  const [lastDecisions, setLastDecisions] = useState<SwipeDecision[]>([]);
  const [globalResults, setGlobalResults] = useState<any[]>([]);

  // User Statistics & History
  const [likedGames, setLikedGames] = useState<string[]>([]);
  const [savedResults, setSavedResults] = useState<Array<{ gameTitle: string; result: AIResult; decisions?: SwipeDecision[] }>>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    userId: '',
    nickname: '',
    gamesPlayed: 0,
    gamesCreated: 0,
    likedGames: [],
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Load User details and offline cache on mount
  useEffect(() => {
    // 1. Retrieve or generate User ID
    let storedUid = localStorage.getItem('swipequest_uid');
    if (!storedUid) {
      storedUid = generateUUID();
      localStorage.setItem('swipequest_uid', storedUid);
    }
    setUserId(storedUid);

    // 2. Retrieve or generate Nickname
    const storedNickname = localStorage.getItem('swipequest_nickname') || '';
    setNicknameState(storedNickname);

    // 3. Retrieve Liked games
    const storedLikes = JSON.parse(localStorage.getItem('swipequest_liked_games') || '[]');
    setLikedGames(storedLikes);

    // 4. Retrieve saved results history
    const storedResults = JSON.parse(localStorage.getItem('swipequest_saved_results') || '[]');
    setSavedResults(storedResults);

    // 5. Retrieve user stats
    const storedStats = JSON.parse(localStorage.getItem('swipequest_stats') || 'null');
    if (storedStats) {
      setUserStats({ ...storedStats, userId: storedUid });
    } else {
      setUserStats({
        userId: storedUid,
        nickname: storedNickname,
        gamesPlayed: storedResults.length,
        gamesCreated: 0,
        likedGames: storedLikes,
      });
    }

    // Load games from Firestore
    fetchGamesFromFirestore();
    fetchResultsFromFirestore();
  }, []);

  // Update user statistics in State & LocalStorage
  const updateStats = (updated: Partial<UserStats>) => {
    setUserStats((prev) => {
      const nw = { ...prev, ...updated };
      localStorage.setItem('swipequest_stats', JSON.stringify(nw));
      return nw;
    });
  };

  // Sync nickname changes
  const setNickname = (name: string) => {
    setNicknameState(name);
    localStorage.setItem('swipequest_nickname', name);
    updateStats({ nickname: name });
  };

  // Sync liked games changes
  const updateLikesList = (list: string[]) => {
    setLikedGames(list);
    localStorage.setItem('swipequest_liked_games', JSON.stringify(list));
    updateStats({ likedGames: list });
  };

  // Fetch both predefined and user-created games from Backend Database
  const fetchGamesFromFirestore = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const allGames = await response.json();
        setGames(allGames);
      } else {
        throw new Error('Failed to fetch games from API');
      }
    } catch (err) {
      console.warn('Error fetching games from API, using default games:', err);
      setGames(DEFAULT_GAMES);
    } finally {
      setLoading(false);
    }
  };

  // Fetch global play results from Backend Database for leaderboard calculation
  const fetchResultsFromFirestore = async () => {
    try {
      const response = await fetch('/api/results');
      if (response.ok) {
        const fetchedResults = await response.json();
        setGlobalResults(fetchedResults);
      } else {
        throw new Error('Failed to fetch results from API');
      }
    } catch (err) {
      console.warn('Error fetching results from API:', err);
    }
  };

  // Select a game to play
  const handleSelectGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setActiveTab('play');
    }
  };

  // Like or unlike a game topic
  const handleLikeGame = async (gameId: string) => {
    let newLikesList = [...likedGames];
    const index = newLikesList.indexOf(gameId);
    const isLiking = index === -1;

    if (isLiking) {
      newLikesList.push(gameId);
    } else {
      newLikesList.splice(index, 1);
    }

    updateLikesList(newLikesList);

    // Update locally
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          return { ...g, likes: g.likes + (isLiking ? 1 : -1) };
        }
        return g;
      })
    );

    // Persist Like count increment in Database via REST API
    try {
      await fetch(`/api/games/${gameId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiking })
      });
    } catch (err) {
      console.error('Failed to sync likes to database:', err);
    }
  };

  // Increment share count of a game
  const handleShareGame = async (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          return { ...g, shares: g.shares + 1 };
        }
        return g;
      })
    );
    try {
      await fetch(`/api/games/${gameId}/share`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to sync share to database:', err);
    }
  };

  // Submit rating to a game
  const handleRateGame = async (gameId: string, rating: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (response.ok) {
        fetchGamesFromFirestore();
      }
    } catch (err) {
      console.error('Failed to sync rating to database:', err);
    }
  };

  // Submit and analyze result using server-side Gemini AI proxy
  const handleFinishGame = async (decisions: SwipeDecision[]) => {
    if (!selectedGame) return;
    setLastDecisions(decisions);

    try {
      // 1. Call Gemini analysis endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname || (language === 'id' ? 'Pemain Misterius' : 'Mysterious Player'),
          gameTitle: selectedGame.title,
          gameDescription: selectedGame.description,
          decisions: decisions,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis kepribadian via API');
      }

      const resultData: AIResult = await response.json();
      setCurrentResult(resultData);

      // 2. Save result to state & local storage
      const resultObj = { gameTitle: selectedGame.title, result: resultData, decisions: decisions };
      const updatedResults = [resultObj, ...savedResults].slice(0, 10); // Keep last 10 results
      setSavedResults(updatedResults);
      localStorage.setItem('swipequest_saved_results', JSON.stringify(updatedResults));

      // 3. Increment played counts locally & firestore
      updateStats({ gamesPlayed: userStats.gamesPlayed + 1 });
      setGames((prev) =>
        prev.map((g) => {
          if (g.id === selectedGame.id) {
            return { ...g, plays: g.plays + 1 };
          }
          return g;
        })
      );

      try {
        // Increment plays in database
        await fetch(`/api/games/${selectedGame.id}/play`, { method: 'POST' });

        // Save individual results summary for community tracking
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: selectedGame.id,
            gameTitle: selectedGame.title,
            nickname: nickname || 'Anonim',
            userId: userId,
            alias: resultData.alias,
            summary: resultData.summary,
            decisions: decisions,
            timestamp: new Date().toISOString()
          })
        });
      } catch (dbError) {
        console.warn('Failed to sync game play data to database:', dbError);
      }

      // Add to local globalResults state for real-time local updates
      const newResultDoc = {
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        nickname: nickname || 'Anonim',
        userId: userId,
        alias: resultData.alias,
        summary: resultData.summary,
        decisions: decisions,
        timestamp: new Date().toISOString()
      };
      setGlobalResults((prev) => [newResultDoc, ...prev]);

      // Transition to result tab
      setActiveTab('result');

    } catch (error) {
      console.error('Error getting AI analysis result:', error);
      
      // Fallback result in case Gemini fails or server offline
      const fallbackResult: AIResult = {
        nickname: nickname || (language === 'id' ? 'Pemain' : 'Player'),
        alias: language === 'id' ? 'Duta Swiper Misterius' : 'Mysterious Swiper Ambassador',
        summary: language === 'id' 
          ? 'Kamu adalah orang dengan selera unik yang sulit diprediksi bahkan oleh kecerdasan buatan terkuat sekalipun. Keputusan keep dan discard-mu membuktikan bahwa kamu berjiwa bebas, tidak takut beda, dan penuh dengan plot twist!'
          : 'You are someone with a unique taste that is hard to predict even by the strongest artificial intelligence. Your keep and discard choices prove that you are a free spirit, not afraid to be different, and full of plot twists!',
        thinkingStyle: language === 'id' ? 'Antisipatif & Misterius' : 'Anticipative & Mysterious',
        preference: 'YOLO (You Only Live Once)',
        decisionType: language === 'id' ? 'Instingtif' : 'Instinctive',
        greenFlags: language === 'id' 
          ? ['Berani mengambil jalan yang sepi', 'Sangat mandiri dalam memilih']
          : ['Brave enough to take the road less traveled', 'Very independent in making choices'],
        redFlags: language === 'id'
          ? ['Keputusan sulit diprediksi teman sendiri', 'Suka beli diskonan misterius']
          : ['Decisions are hard for friends to predict', 'Likes to buy mysterious discounts'],
        traits: language === 'id' ? [
          { name: 'Kreatif', value: 85 },
          { name: 'Praktis', value: 70 },
          { name: 'Impulsif', value: 55 },
          { name: 'Skena/Jaksel', value: 40 },
          { name: 'Bucin', value: 65 }
        ] : [
          { name: 'Creative', value: 85 },
          { name: 'Practical', value: 70 },
          { name: 'Impulsive', value: 55 },
          { name: 'Hipster/Niche', value: 40 },
          { name: 'Hopeless Romantic', value: 65 }
        ]
      };
      setCurrentResult(fallbackResult);

      const resultObj = { gameTitle: selectedGame.title, result: fallbackResult, decisions: decisions };
      const updatedResults = [resultObj, ...savedResults].slice(0, 10);
      setSavedResults(updatedResults);
      localStorage.setItem('swipequest_saved_results', JSON.stringify(updatedResults));

      // Add to local globalResults state for real-time local updates
      const fallbackResultDoc = {
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        nickname: nickname || 'Anonim',
        userId: userId,
        alias: fallbackResult.alias,
        summary: fallbackResult.summary,
        decisions: decisions,
        timestamp: new Date().toISOString()
      };
      setGlobalResults((prev) => [fallbackResultDoc, ...prev]);

      try {
        // Increment plays in database
        await fetch(`/api/games/${selectedGame.id}/play`, { method: 'POST' });

        // Save individual results summary for community tracking
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: selectedGame.id,
            gameTitle: selectedGame.title,
            nickname: nickname || 'Anonim',
            userId: userId,
            alias: fallbackResult.alias,
            summary: fallbackResult.summary,
            decisions: decisions,
            timestamp: new Date().toISOString()
          })
        });
      } catch (dbError) {
        console.warn('Failed to sync game play data to database:', dbError);
      }

      updateStats({ gamesPlayed: userStats.gamesPlayed + 1 });
      setActiveTab('result');
    }
  };

  // Save customized game
  const handleSaveGame = async (newGame: Game) => {
    // Save to Database
    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame)
      });
      console.log('Custom game persisted in database successfully.');
    } catch (err) {
      console.error('Failed to write custom game to database:', err);
    }

    // Save in local state regardless
    setGames((prev) => [newGame, ...prev]);
    updateStats({ gamesCreated: userStats.gamesCreated + 1 });
  };

  // Re-open saved result from profile history
  const handleViewSavedResult = (resultData: { gameTitle: string; result: AIResult; decisions?: SwipeDecision[] }) => {
    // Find the associated game if possible
    const associatedGame = games.find((g) => g.title === resultData.gameTitle) || DEFAULT_GAMES[0];
    setSelectedGame(associatedGame);
    setCurrentResult(resultData.result);
    setLastDecisions(resultData.decisions || []);
    setActiveTab('result');
  };

  const handleClearHistory = () => {
    if (confirm(translations[language].profile.confirmClearHistory)) {
      setSavedResults([]);
      localStorage.setItem('swipequest_saved_results', '[]');
      updateStats({ gamesPlayed: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Navbar top banner */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} nickname={nickname} language={language} setLanguage={setLanguage} />

      {/* Main Pages router */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            nickname={nickname}
            setNickname={setNickname}
            games={games}
            onSelectGame={handleSelectGame}
            setActiveTab={setActiveTab}
            language={language}
          />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            games={games}
            nickname={nickname}
            onSelectGame={handleSelectGame}
            onLikeGame={handleLikeGame}
            likedGames={likedGames}
            language={language}
          />
        )}

        {activeTab === 'play' && selectedGame && (
          <PlayPage
            game={selectedGame}
            nickname={nickname}
            onBack={() => setActiveTab('explore')}
            onFinishGame={handleFinishGame}
            language={language}
          />
        )}

        {activeTab === 'result' && selectedGame && currentResult && (
          <ResultPage
            game={selectedGame}
            nickname={nickname}
            result={currentResult}
            decisions={lastDecisions}
            onPlayAgain={() => setActiveTab('explore')}
            language={language}
            onShare={() => handleShareGame(selectedGame.id)}
            onRate={(rating) => handleRateGame(selectedGame.id, rating)}
          />
        )}

        {activeTab === 'create' && (
          <CreatePage
            userId={userId}
            nickname={nickname}
            onSaveGame={handleSaveGame}
            onSelectGame={handleSelectGame}
            language={language}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardPage
            games={games}
            globalResults={globalResults}
            onSelectGame={handleSelectGame}
            language={language}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            nickname={nickname}
            setNickname={setNickname}
            userStats={userStats}
            savedResults={savedResults}
            onViewSavedResult={handleViewSavedResult}
            onClearHistory={handleClearHistory}
            language={language}
          />
        )}
      </main>

      {/* Humble aesthetic footer */}
      <footer className="text-center py-8 text-xs text-gray-400 font-bold bg-white/50 border-t border-gray-100 pb-24 md:pb-8 mt-12">
        <p>{language === 'id' ? 'Pilih atau Buang' : 'Keep or Discard'} ✦ AI-Powered Fun Personality Playground</p>
        <p className="text-[10px] text-gray-400 font-medium mt-1">
          {language === 'id' ? 'Dibuat oleh' : 'Created by'}{' '}
          <a
            href="https://www.instagram.com/fauzirammm/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-indigo-500 font-semibold"
          >
            Fauzi Ramdani
          </a>{' '}
          • {language === 'id' ? 'Hubungkan di' : 'Connect on'}{' '}
          <a
            href="https://www.linkedin.com/in/fauzi-ramdani-747978249/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-indigo-500 font-semibold"
          >
            LinkedIn
          </a>
        </p>
        <p className="text-[10px] text-gray-400 font-medium mt-1">
          {language === 'id' ? (
            <span>
              Terinspirasi dari konten Instagram{' '}
              <a
                href="https://www.instagram.com/reel/DaKjM-TBdmf/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-indigo-500 font-semibold text-rose-500"
              >
                @andreasprasetya
              </a>{' '}
              terkait konten "Pilih atau Buang"
            </span>
          ) : (
            <span>
              Inspired by Instagram content by{' '}
              <a
                href="https://www.instagram.com/reel/DaKjM-TBdmf/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-indigo-500 font-semibold text-rose-500"
              >
                @andreasprasetya
              </a>{' '}
              regarding "Keep or Discard" content
            </span>
          )}
        </p>
      </footer>
    </div>
  );
}
