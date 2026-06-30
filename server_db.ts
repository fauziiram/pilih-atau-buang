import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Game } from './src/types';
import { DEFAULT_GAMES } from './src/data';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

// Initialize local JSON file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ games: [], results: [] }, null, 2));
}

// Read env variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

if (isSupabaseConfigured) {
  console.log('Supabase detected in .env. Using Supabase for persistent storage.');
} else {
  console.log('Using local JSON file (local_db.json) for persistent storage.');
}

// Helper to read local JSON database
function readLocalDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local database file:', err);
    return { games: [], results: [] };
  }
}

// Helper to write local JSON database
function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local database file:', err);
  }
}

export async function getGames(): Promise<Game[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('createdAt', { ascending: false });
        
      if (error) throw error;
      
      // Combine with default games
      const dbGames = data || [];
      const allGames = [...DEFAULT_GAMES];
      dbGames.forEach((fg: any) => {
        const existsIdx = allGames.findIndex((ag) => ag.id === fg.id);
        if (existsIdx > -1) {
          allGames[existsIdx] = fg;
        } else {
          allGames.push(fg);
        }
      });
      return allGames;
    } catch (err) {
      console.error('Supabase getGames error, falling back to local storage:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  const allGames = [...DEFAULT_GAMES];
  db.games.forEach((fg: Game) => {
    const existsIdx = allGames.findIndex((ag) => ag.id === fg.id);
    if (existsIdx > -1) {
      allGames[existsIdx] = fg;
    } else {
      allGames.push(fg);
    }
  });
  return allGames;
}

export async function saveGame(newGame: Game): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from('games').upsert(newGame);
      if (error) throw error;
      return;
    } catch (err) {
      console.error('Supabase saveGame error, saving to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  const existsIdx = db.games.findIndex((g: Game) => g.id === newGame.id);
  if (existsIdx > -1) {
    db.games[existsIdx] = newGame;
  } else {
    db.games.push(newGame);
  }
  writeLocalDb(db);
}

export async function likeGame(gameId: string, isLiking: boolean): Promise<void> {
  if (supabase) {
    try {
      // First get current likes
      const { data, error } = await supabase
        .from('games')
        .select('likes')
        .eq('id', gameId)
        .single();
        
      if (!error && data) {
        const currentLikes = data.likes || 0;
        const newLikes = Math.max(0, currentLikes + (isLiking ? 1 : -1));
        await supabase.from('games').update({ likes: newLikes }).eq('id', gameId);
        return;
      } else {
        // If not present in Supabase games table, upsert it from default games first
        const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
        if (defaultGame) {
          const newLikes = Math.max(0, defaultGame.likes + (isLiking ? 1 : -1));
          await supabase.from('games').upsert({ ...defaultGame, likes: newLikes });
          return;
        }
      }
    } catch (err) {
      console.error('Supabase likeGame error, falling back to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  let game = db.games.find((g: Game) => g.id === gameId);
  if (game) {
    game.likes = Math.max(0, game.likes + (isLiking ? 1 : -1));
    writeLocalDb(db);
    return;
  }
  const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
  if (defaultGame) {
    const copiedGame = { ...defaultGame, likes: Math.max(0, defaultGame.likes + (isLiking ? 1 : -1)) };
    db.games.push(copiedGame);
    writeLocalDb(db);
  }
}

export async function playGame(gameId: string): Promise<void> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('plays')
        .eq('id', gameId)
        .single();
        
      if (!error && data) {
        const currentPlays = data.plays || 0;
        await supabase.from('games').update({ plays: currentPlays + 1 }).eq('id', gameId);
        return;
      } else {
        const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
        if (defaultGame) {
          await supabase.from('games').upsert({ ...defaultGame, plays: defaultGame.plays + 1 });
          return;
        }
      }
    } catch (err) {
      console.error('Supabase playGame error, falling back to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  let game = db.games.find((g: Game) => g.id === gameId);
  if (game) {
    game.plays += 1;
    writeLocalDb(db);
    return;
  }
  const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
  if (defaultGame) {
    const copiedGame = { ...defaultGame, plays: defaultGame.plays + 1 };
    db.games.push(copiedGame);
    writeLocalDb(db);
  }
}

export async function getResults(): Promise<any[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase getResults error, falling back to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  return [...db.results].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function saveResult(result: any): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from('results').insert(result);
      if (error) throw error;
      return;
    } catch (err) {
      console.error('Supabase saveResult error, saving to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  db.results.push(result);
  writeLocalDb(db);
}

export async function shareGame(gameId: string): Promise<void> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('shares')
        .eq('id', gameId)
        .single();
        
      if (!error && data) {
        const currentShares = data.shares || 0;
        await supabase.from('games').update({ shares: currentShares + 1 }).eq('id', gameId);
        return;
      } else {
        const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
        if (defaultGame) {
          await supabase.from('games').upsert({ ...defaultGame, shares: defaultGame.shares + 1 });
          return;
        }
      }
    } catch (err) {
      console.error('Supabase shareGame error, falling back to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  let game = db.games.find((g: Game) => g.id === gameId);
  if (game) {
    game.shares += 1;
    writeLocalDb(db);
    return;
  }
  const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
  if (defaultGame) {
    const copiedGame = { ...defaultGame, shares: defaultGame.shares + 1 };
    db.games.push(copiedGame);
    writeLocalDb(db);
  }
}

export async function rateGame(gameId: string, rating: number): Promise<void> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('rating, plays')
        .eq('id', gameId)
        .single();
        
      if (!error && data) {
        const currentRating = Number(data.rating) || 0.0;
        const currentPlays = Number(data.plays) || 0;
        const newRating = Number((((currentRating * currentPlays) + rating) / (currentPlays + 1)).toFixed(1));
        await supabase.from('games').update({ rating: newRating }).eq('id', gameId);
        return;
      } else {
        const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
        if (defaultGame) {
          const currentRating = Number(defaultGame.rating) || 0.0;
          const currentPlays = Number(defaultGame.plays) || 0;
          const newRating = Number((((currentRating * currentPlays) + rating) / (currentPlays + 1)).toFixed(1));
          await supabase.from('games').upsert({ ...defaultGame, rating: newRating });
          return;
        }
      }
    } catch (err) {
      console.error('Supabase rateGame error, falling back to local database:', err);
    }
  }

  // Fallback to local JSON
  const db = readLocalDb();
  let game = db.games.find((g: Game) => g.id === gameId);
  if (game) {
    const currentRating = Number(game.rating) || 0.0;
    const currentPlays = Number(game.plays) || 0;
    game.rating = Number((((currentRating * currentPlays) + rating) / (currentPlays + 1)).toFixed(1));
    writeLocalDb(db);
    return;
  }
  const defaultGame = DEFAULT_GAMES.find((g) => g.id === gameId);
  if (defaultGame) {
    const currentRating = Number(defaultGame.rating) || 0.0;
    const currentPlays = Number(defaultGame.plays) || 0;
    const copiedGame = { ...defaultGame, rating: Number((((currentRating * currentPlays) + rating) / (currentPlays + 1)).toFixed(1)) };
    db.games.push(copiedGame);
    writeLocalDb(db);
  }
}

