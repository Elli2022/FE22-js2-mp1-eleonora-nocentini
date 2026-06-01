import "./styles/main.css";
import { fetchHighScores, getScoreSource, savePlayerScore } from "./scores";
import {
  MOVE_EMOJI,
  MOVE_LABEL,
  WIN_TARGET,
  randomMove,
  resolveRound,
} from "./game";
import type { Move, PlayerRecord } from "./types";

interface GameState {
  playerName: string;
  userScore: number;
  computerScore: number;
  active: boolean;
}

const state: GameState = {
  playerName: "",
  userScore: 0,
  computerScore: 0,
  active: false,
};

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="site-header">
    <h1>Rock Paper Scissors</h1>
    <p>First to ${WIN_TARGET} wins — scores sync to Firebase</p>
    <a class="legacy-link" href="/legacy/index.html">View original 2022 version →</a>
  </header>
  <div class="layout">
    <section class="card game-panel" aria-live="polite">
      <form class="setup-form" id="setup-form">
        <label for="player-name">Your name</label>
        <input id="player-name" name="name" type="text" placeholder="Enter your name" maxlength="32" required />
        <button class="btn btn-primary" type="submit" id="start-btn">Start game</button>
      </form>
      <div class="scoreboard">
        <div>
          <p class="player-name">You<br /><strong id="display-name">Player</strong></p>
          <p class="score-value" id="user-score">0</p>
        </div>
        <span class="vs">VS</span>
        <div>
          <p class="player-name">Computer</p>
          <p class="score-value" id="computer-score">0</p>
        </div>
      </div>
      <p class="last-round" id="last-round">Pick a move to begin.</p>
      <div class="moves" id="moves">
        ${(["rock", "paper", "scissors"] as Move[])
          .map(
            (move) => `
          <button type="button" class="move-btn" data-move="${move}" disabled
            aria-label="${MOVE_LABEL[move]}">
            ${MOVE_EMOJI[move]}
            <span>${MOVE_LABEL[move]}</span>
          </button>`
          )
          .join("")}
      </div>
      <p class="status-banner" id="status-banner" role="status"></p>
    </section>
    <aside class="card highscores">
      <h2>High scores</h2>
      <p class="highscores-note" id="highscores-note" hidden></p>
      <ol id="highscore-list"></ol>
    </aside>
  </div>
`;

const setupForm = document.querySelector<HTMLFormElement>("#setup-form")!;
const nameInput = document.querySelector<HTMLInputElement>("#player-name")!;
const displayName = document.querySelector<HTMLSpanElement>("#display-name")!;
const userScoreEl = document.querySelector<HTMLParagraphElement>("#user-score")!;
const computerScoreEl = document.querySelector<HTMLParagraphElement>("#computer-score")!;
const lastRoundEl = document.querySelector<HTMLParagraphElement>("#last-round")!;
const statusBanner = document.querySelector<HTMLParagraphElement>("#status-banner")!;
const highscoreList = document.querySelector<HTMLOListElement>("#highscore-list")!;
const highscoresNote = document.querySelector<HTMLParagraphElement>("#highscores-note")!;
const moveButtons = document.querySelectorAll<HTMLButtonElement>(".move-btn");

function showError(message: string) {
  const toast = document.createElement("div");
  toast.className = "error-toast";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 4000);
}

function bumpScore(el: HTMLElement) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function setMoveButtonsEnabled(enabled: boolean) {
  moveButtons.forEach((btn) => {
    btn.disabled = !enabled;
  });
}

function renderHighScores(scores: PlayerRecord[]) {
  if (scores.length === 0) {
    highscoreList.innerHTML = `<li class="empty">No scores yet — win a match!</li>`;
    return;
  }
  highscoreList.innerHTML = scores
    .map(
      (entry) =>
        `<li><span>${escapeHtml(entry.name)}</span><span class="points">${entry.score} pts</span></li>`
    )
    .join("");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateHighscoresNote() {
  const source = getScoreSource();
  if (source === "local") {
    highscoresNote.hidden = false;
    highscoresNote.textContent =
      "Firebase database is offline — showing scores saved in this browser.";
  } else {
    highscoresNote.hidden = true;
    highscoresNote.textContent = "";
  }
}

async function refreshHighScores() {
  try {
    const scores = await fetchHighScores();
    updateHighscoresNote();
    renderHighScores(scores);
  } catch {
    highscoreList.innerHTML = `<li class="empty">Could not load scores.</li>`;
    highscoresNote.hidden = false;
    highscoresNote.textContent =
      "Firebase database is unavailable. Scores will be saved locally after you win.";
  }
}

function showStatus(text: string, variant: "win" | "lose" | "tie-round" | "") {
  statusBanner.textContent = text;
  statusBanner.className = "status-banner";
  if (variant) {
    statusBanner.classList.add(variant, "visible");
  }
}

function resetMatch() {
  state.userScore = 0;
  state.computerScore = 0;
  userScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  lastRoundEl.textContent = "Pick a move to play.";
  showStatus("", "");
}

async function endMatch(winner: "user" | "computer") {
  setMoveButtonsEnabled(false);

  if (winner === "user") {
    const record: PlayerRecord = {
      name: state.playerName,
      score: state.userScore,
    };
    showStatus(`${state.playerName} wins the match!`, "win");
    try {
      const existing = await fetchHighScores();
      const previous = existing.find((e) => e.name === state.playerName);
      if (!previous || state.userScore > previous.score) {
        await savePlayerScore(record);
      }
      await refreshHighScores();
    } catch {
      showError("Match won, but saving the high score failed.");
    }
  } else {
    showStatus("Computer wins the match.", "lose");
  }

  setTimeout(() => {
    resetMatch();
    setMoveButtonsEnabled(true);
  }, 2200);
}

function handleMove(userMove: Move) {
  if (!state.active) return;

  const computerMove = randomMove();
  const result = resolveRound(userMove, computerMove);

  lastRoundEl.innerHTML = `You: <strong>${MOVE_EMOJI[userMove]} ${MOVE_LABEL[userMove]}</strong> · Computer: <strong>${MOVE_EMOJI[computerMove]} ${MOVE_LABEL[computerMove]}</strong>`;

  if (result.winner === "tie") {
    showStatus("Round tied — no points.", "tie-round");
    return;
  }

  if (result.winner === "user") {
    state.userScore += 1;
    userScoreEl.textContent = String(state.userScore);
    bumpScore(userScoreEl);
    showStatus("You win this round!", "win");
  } else {
    state.computerScore += 1;
    computerScoreEl.textContent = String(state.computerScore);
    bumpScore(computerScoreEl);
    showStatus("Computer wins this round.", "lose");
  }

  if (state.userScore >= WIN_TARGET) {
    void endMatch("user");
  } else if (state.computerScore >= WIN_TARGET) {
    void endMatch("computer");
  }
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  state.playerName = name;
  state.active = true;
  displayName.textContent = name;
  resetMatch();
  setMoveButtonsEnabled(true);
  nameInput.disabled = true;
  document.querySelector<HTMLButtonElement>("#start-btn")!.disabled = true;
});

moveButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const move = btn.dataset.move as Move;
    handleMove(move);
  });
});

void refreshHighScores();
