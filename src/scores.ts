import { fetchHighScores as fetchFromFirebase, savePlayerScore as saveToFirebase } from "./firebase";
import type { PlayerRecord } from "./types";

const LOCAL_KEY = "fe22-rps-highscores";

let scoreSource: "firebase" | "local" | null = null;

function loadLocalScores(): PlayerRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Record<string, PlayerRecord>;
    return Object.values(data)
      .filter((entry) => entry?.name)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function saveLocalScore(player: PlayerRecord): void {
  const existing = loadLocalScores();
  const map: Record<string, PlayerRecord> = {};
  for (const entry of existing) {
    map[entry.name] = entry;
  }
  const previous = map[player.name];
  if (!previous || player.score > previous.score) {
    map[player.name] = player;
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

export function getScoreSource(): "firebase" | "local" | null {
  return scoreSource;
}

export async function fetchHighScores(): Promise<PlayerRecord[]> {
  if (scoreSource !== "local") {
    try {
      const scores = await fetchFromFirebase();
      scoreSource = "firebase";
      return scores;
    } catch {
      scoreSource = "local";
    }
  }
  return loadLocalScores();
}

export async function savePlayerScore(player: PlayerRecord): Promise<void> {
  if (scoreSource !== "local") {
    try {
      await saveToFirebase(player);
      return;
    } catch {
      scoreSource = "local";
    }
  }
  saveLocalScore(player);
}
