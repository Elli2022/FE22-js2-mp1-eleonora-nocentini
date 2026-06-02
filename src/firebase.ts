import type { PlayerRecord } from "./types";

const BASE_URL =
  "https://rock-paper-scissors-d5171-default-rtdb.firebaseio.com/scores";

export async function fetchHighScores(): Promise<PlayerRecord[]> {
  const response = await fetch(`${BASE_URL}/.json`);
  const data: Record<string, PlayerRecord> | { error?: string } | null =
    await response.json();

  const firebaseError =
    data && typeof data === "object" && "error" in data
      ? String((data as { error: string }).error)
      : null;

  if (response.status === 404) {
    return [];
  }

  if (!response.ok || firebaseError) {
    throw new Error(firebaseError ?? `Firebase responded with ${response.status}`);
  }

  if (!data || data === null) {
    return [];
  }

  const scores = data as Record<string, PlayerRecord>;
  return Object.values(scores)
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
