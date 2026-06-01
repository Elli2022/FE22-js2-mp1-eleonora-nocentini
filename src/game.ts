import type { Move, RoundResult } from "./types";

const MOVES: Move[] = ["rock", "paper", "scissors"];

const BEATS: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export function randomMove(): Move {
  return MOVES[Math.floor(Math.random() * MOVES.length)]!;
}

export function resolveRound(userMove: Move, computerMove: Move): RoundResult {
  if (userMove === computerMove) {
    return { userMove, computerMove, winner: "tie" };
  }
  const winner = BEATS[userMove] === computerMove ? "user" : "computer";
  return { userMove, computerMove, winner };
}

export const MOVE_LABEL: Record<Move, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};

export const MOVE_EMOJI: Record<Move, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export const WIN_TARGET = 3;
