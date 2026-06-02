export type Move = "rock" | "paper" | "scissors";

export interface LeaderboardEntry {
  name: string;
  wins: number;
  points: number;
}

export interface RoundResult {
  userMove: Move;
  computerMove: Move;
  winner: "user" | "computer" | "tie";
}

export const COMPUTER_NAME = "Computer";
