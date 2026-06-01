export type Move = "rock" | "paper" | "scissors";

export interface PlayerRecord {
  name: string;
  score: number;
}

export interface RoundResult {
  userMove: Move;
  computerMove: Move;
  winner: "user" | "computer" | "tie";
}
