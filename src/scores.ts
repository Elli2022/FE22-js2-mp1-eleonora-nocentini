import {
  fetchEntry as fetchFromFirebase,
  fetchHighScores as fetchListFromFirebase,
  saveLeaderboardEntry as saveToFirebase,
} from "./firebase";
import { COMPUTER_NAME, type LeaderboardEntry } from "./types";

const LOCAL_KEY = "fe22-rps-highscores";
const TOP_N = 10;

let scoreSource: "firebase" | "local" | null = null;

function loadLocalMap(): Record<string, LeaderboardEntry> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LeaderboardEntry>;
  } catch {
    return {};
  }
}

function saveLocalMap(map: Record<string, LeaderboardEntry>): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries
    .filter((entry) => entry?.name)
    .sort((a, b) => b.wins - a.wins || b.points - a.points)
    .slice(0, TOP_N);
}

function getLocalEntry(map: Record<string, LeaderboardEntry>, key: string, name: string) {
  return map[key] ?? { name, wins: 0, points: 0 };
}

export function getScoreSource(): "firebase" | "local" | null {
  return scoreSource;
}

export async function fetchHighScores(): Promise<LeaderboardEntry[]> {
  if (scoreSource !== "local") {
    try {
      const scores = await fetchListFromFirebase();
      scoreSource = "firebase";
      return scores;
    } catch {
      scoreSource = "local";
    }
  }
  return sortLeaderboard(Object.values(loadLocalMap()));
}

async function getEntry(key: string, name: string): Promise<LeaderboardEntry> {
  if (scoreSource !== "local") {
    try {
      const existing = await fetchFromFirebase(key);
      scoreSource = "firebase";
      return existing ?? { name, wins: 0, points: 0 };
    } catch {
      scoreSource = "local";
    }
  }
  const map = loadLocalMap();
  return getLocalEntry(map, key, name);
}

async function persistEntry(key: string, entry: LeaderboardEntry): Promise<void> {
  if (scoreSource !== "local") {
    try {
      await saveToFirebase(key, entry);
      return;
    } catch {
      scoreSource = "local";
    }
  }
  const map = loadLocalMap();
  map[key] = entry;
  saveLocalMap(map);
}

export async function recordMatchResult(
  winner: "user" | "computer",
  playerName: string,
  userRoundWins: number,
  computerRoundWins: number
): Promise<void> {
  const playerKey = playerName;
  const computerKey = COMPUTER_NAME;

  const [player, computer] = await Promise.all([
    getEntry(playerKey, playerName),
    getEntry(computerKey, COMPUTER_NAME),
  ]);

  player.points += userRoundWins;
  computer.points += computerRoundWins;

  if (winner === "user") {
    player.wins += 1;
  } else {
    computer.wins += 1;
  }

  await Promise.all([
    persistEntry(playerKey, player),
    persistEntry(computerKey, computer),
  ]);
}
