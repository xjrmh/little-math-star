export type GameMode = 'home' | 'counting' | 'addition' | 'story';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  mode: GameMode;
  score: number;
  streak: number;
}

export interface Question {
  id: string;
  questionText: string;
  visualItems: string[]; // Emojis
  visualItemsSecond?: string[]; // For addition (e.g., 2 apples + 3 apples)
  correctAnswer: number;
  options: number[];
}

export interface StoryState {
  isLoading: boolean;
  storyText: string;
  selectedNumber: number | null;
}