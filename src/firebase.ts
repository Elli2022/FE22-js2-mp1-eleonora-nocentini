import type { PlayerRecord } from "./types";

const BASE_URL =
  "https://stensaxpase-d3b57-default-rtdb.europe-west1.firebasedatabase.app/scores";

export async function fetchHighScores(): Promise<PlayerRecord[]> {
  const response = await fetch(`${BASE_URL}/.json`);
  if (!response.ok) {
    throw new Error("Could not load high scores");
  }

  const data: Record<string, PlayerRecord> | null = await response.json();
  if (!data) return [];

  return Object.values(data)
    .filter((entry) => entry?.name)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export async function savePlayerScore(player: PlayerRecord): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(player.name)}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(player),
  });

  if (!response.ok) {
    throw new Error("Could not save score");
  }
}
