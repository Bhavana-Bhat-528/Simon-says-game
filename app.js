let gameSeq = [];
let userSeq = [];
const btns = ["yellow", "red", "blue", "green"];

let started = false;
let level = 0;
let isUserTurn = false;

let highScore = localStorage.getItem("simonHighScore Ultimate") || 0;
document.getElementById("high-score").innerText = highScore;

const h2 = document.getElementById("status-heading");
const currentScoreEl = document.getElementById("current-score");
const panel = document.getElementById("main-panel");

let audioCtx = null;

function playTone(color, duration = 350) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const frequencies = {
    red: 310,
    yellow: 252,
    green: 415,
    blue: 209,
    error: 120,
  };
  const freq = frequencies[color] || 200;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = color === "error" ? "sawtooth" : "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration / 1000,
  );

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration / 1000);
}

function startGame() {
  if (!started) {
    started = true;
    levelUp();
  }
}

document.addEventListener("keypress", startGame);
document.body.addEventListener("click", function (e) {
  if (!e.target.classList.contains("btn") && !started) {
    startGame();
  }
});

function levelUp() {
  isUserTurn = false;
  userSeq = [];
  level++;
  h2.innerHTML = `Level <span style="color:#00f2fe; font-weight:bold;">${level}</span>`;
  currentScoreEl.innerText = level - 1;

  const randIdx = Math.floor(Math.random() * 4);
  const randColor = btns[randIdx];
  const randBtn = document.getElementById(randColor);

  gameSeq.push(randColor);

  const flashDelay = Math.max(250, 500 - level * 15);

  setTimeout(() => {
    gameFlash(randBtn, randColor, flashDelay);
    setTimeout(() => {
      isUserTurn = true;
    }, flashDelay);
  }, 500);
}

function gameFlash(btn, color, delay) {
  playTone(color, delay);
  btn.classList.add("flash");
  setTimeout(() => btn.classList.remove("flash"), delay - 50);
}

function userFlash(btn, color) {
  playTone(color, 200);
  btn.classList.add("userFlash");
  setTimeout(() => btn.classList.remove("userFlash"), 150);
}

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", btnPress);
});

function btnPress() {
  if (!started || !isUserTurn) return;

  const btn = this;
  const userColor = btn.id;
  userFlash(btn, userColor);

  userSeq.push(userColor);
  checkAns(userSeq.length - 1);
}

function checkAns(idx) {
  if (userSeq[idx] !== gameSeq[idx]) {
    isUserTurn = false;
    playTone("error", 600);

    const finalScore = level - 1;

    if (finalScore > highScore) {
      highScore = finalScore;
      localStorage.setItem("simonHighScore Ultimate", highScore);
      document.getElementById("high-score").innerText = highScore;
    }

    h2.innerHTML = `<span style="color:#ff3344; font-weight:bold;">GAME OVER</span><br>Score: <b>${finalScore}</b><br><span style="font-size:0.9rem; color:#8a8a9e;">Press any key or tap background to try again</span>`;

    panel.classList.add("shake");
    setTimeout(() => panel.classList.remove("shake"), 400);

    reset();
  } else {
    if (userSeq.length === gameSeq.length) {
      setTimeout(levelUp, 400);
    }
  }
}

function reset() {
  started = false;
  gameSeq = [];
  userSeq = [];
  level = 0;
  isUserTurn = false;
}
