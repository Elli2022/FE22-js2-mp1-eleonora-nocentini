import type { LeaderboardEntry } from "./types";

const BASE_URL =
  "https://rock-paper-scissors-d5171-default-rtdb.firebaseio.com/scores";

const TOP_N = 10;

type RawEntry = Partial<LeaderboardEntry> & { score?: number };

function normalizeEntry(key: string, raw: RawEntry): LeaderboardEntry {
  const legacyScore = typeof raw.score === "number" ? raw.score : 0;
  const points = typeof raw.points === "number" ? raw.points : legacyScore;
  const wins =
    typeof raw.wins === "number" ? raw.wins : legacyScore >= 3 ? 1 : 0;

  return {
    name: raw.name?.trim() || key,
    wins,
    points,
  };
}

function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries
    .filter((entry) => entry.name)
    .sort((a, b) => b.wins - a.wins || b.points - a.points)
    .slice(0, TOP_N);
}

async function fetchAllRaw(): Promise<Record<string, RawEntry>> {
  const response = await fetch(`${BASE_URL}/.json`);
  const data: Record<string, RawEntry> | { error?: string } | null =
    await response.json();

  const firebaseError =
    data && typeof data === "object" && "error" in data
      ? String((data as { error: string }).error)
      : null;

  if (response.status === 404) {
    return {};
  }

  if (!response.ok || firebaseError) {
    throw new Error(firebaseError ?? `Firebase responded with ${response.status}`);
  }

  if (!data || data === null || "error" in data) {
    return {};
  }

  return data as Record<string, RawEntry>;
}

export async function fetchHighScores(): Promise<LeaderboardEntry[]> {
  const raw = await fetchAllRaw();
  const entries = Object.entries(raw).map(([key, value]) =>
    normalizeEntry(key, value)
  );
  return sortLeaderboard(entries);
}

export async function saveLeaderboardEntry(
  key: string,
  entry: LeaderboardEntry
): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(key)}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error("Could not save score");
  }
}

export async function fetchEntry(key: string): Promise<LeaderboardEntry | null> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(key)}.json`);
  if (response.status === 404) return null;

  const raw: RawEntry | null = await response.json();
  if (!raw || typeof raw !== "object") return null;

  return normalizeEntry(key, raw);
}
