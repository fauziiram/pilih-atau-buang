/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameItem {
  id: string;
  name: string;
  description: string;
  image?: string; // Optional URL/emoji
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string; // Nickname or 'Official'
  creatorId?: string;
  createdAt: string; // ISO string
  likes: number;
  plays: number;
  shares: number;
  rating: number; // 1-5
  isPublic: boolean;
  items: GameItem[];
  coverEmoji?: string;
}

export interface SwipeDecision {
  itemId: string;
  itemName: string;
  decision: 'keep' | 'discard';
}

export interface TraitRating {
  name: string;
  value: number; // 0 to 100
}

export interface AIResult {
  nickname: string;
  summary: string;
  thinkingStyle: string;
  preference: string;
  decisionType: string;
  greenFlags: string[];
  redFlags: string[];
  traits: TraitRating[];
  alias: string;
}

export interface UserStats {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  gamesPlayed: number;
  gamesCreated: number;
  likedGames: string[]; // list of game IDs
}
