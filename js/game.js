"use strict";

import PopUp from "./popup.js";

const CARROT_SIZE = 80; // field를 넘지 않게 생성하기 위해, 당근의 크기만큼 -
const CARROT_COUNT = 5;
const BUG_COUNT = 5;
const GAME_DURATION_SEC = 5;

const field = document.querySelector(".game__field");
const fieldRect = field.getBoundingClientRect(); // 필드의 위치를 알아오기
const gameBtn = document.querySelector(".game__button");
const gameTimer = document.querySelector(".game__timer");
const gameScore = document.querySelector(".game__score");

const carrotSound = new Audio("./sound/carrot_pull.mp3");
const alertSound = new Audio("./sound/alert.wav");
const bgSound = new Audio("./sound/bg.mp3");
const bugSound = new Audio("./sound/bug_pull.mp3");
const winSound = new Audio("./sound/game_win.mp3");

let startFlag = false;
let score = 0;
let timer = undefined;

const gameFinishBanner = new PopUp();
gameFinishBanner.setClickListener(() => {
  startGame(); // startGame 이라는 콜백함수 등록 -> 멤버변수에 onClick 할당
});

field.addEventListener("click", onFieldClick);
gameBtn.addEventListener("click", () => {
  if (startFlag) {
    stopGame();
  } else {
    startGame();
  }
});

// == start Game
function startGame() {
  startFlag = true;
  createGame(); // game item 만들기
  showStopButton(); // 정지버튼 보여주기
  showTimerAndScore(); // timer & score 를 game start 하면 보여주기
  startGameTimer(); // game timer 시작
  playSound(bgSound);
}

// == stop Game
function stopGame() {
  startFlag = false;
  stopGameTimer(); // game timer 종료
  hideGameButton();
  gameFinishBanner.showWithText("🥕 REPLAY? 🥕");
  playSound(alertSound);
  stopSound(bgSound);
}

// == finish game
function finishGame(win) {
  startFlag = false;
  hideGameButton();
  if (win) {
    playSound(winSound);
  } else {
    playSound(bugSound);
  }
  stopGameTimer(); // game timer 종료
  stopSound(bgSound);
  gameFinishBanner.showWithText(win ? "✨ YOU WON ✨" : "😝 YOU LOST 😝");
}

function showStopButton() {
  const icon = gameBtn.querySelector(".fas");
  icon.classList.add("fa-stop");
  icon.classList.remove("fa-play");
  gameBtn.style.visibility = "visible";
}

function hideGameButton() {
  gameBtn.style.visibility = "hidden";
}

function showTimerAndScore() {
  gameTimer.style.visibility = "visible";
  gameScore.style.visibility = "visible";
}

function startGameTimer() {
  let remainingTimeSec = GAME_DURATION_SEC;
  updateTimerText(remainingTimeSec);
  timer = setInterval(() => {
    if (remainingTimeSec <= 0) {
      // 남은 시간이 0초 이하라면 타이머 초기화 & game 종료
      clearInterval(timer);
      finishGame(CARROT_COUNT === score);
      return;
    }
    updateTimerText(--remainingTimeSec); // 남은 시간이 있다면, 남은 시간 -
  }, 1000);
}

function stopGameTimer() {
  clearInterval(timer);
}

function updateTimerText(time) {
  const minutes = Math.floor(time / 60); // minutes 소수점 내림 값
  const seconds = time % 60; // seconds / 60 의 나머지 값
  gameTimer.textContent = `${minutes}:${seconds}`;
}

// == create Game
function createGame() {
  // score 초기화
  score = 0;
  // 버튼 클릭 시, 게임 필드 reset
  field.innerHTML = "";

  // game score는 당근의 수
  gameScore.innerText = CARROT_COUNT;

  // 벌레와 당근을 생성한 뒤, field에 추가
  addItem(`carrot`, CARROT_COUNT, `img/carrot.png`);
  addItem(`bug`, BUG_COUNT, `img/bug.png`);
}

function addItem(className, count, imgPath) {
  // 0 ~ fieldRect의 width, height 범위 내에서 랜덤 숫자 생성
  const x1 = 0;
  const y1 = 0;
  const x2 = fieldRect.width - CARROT_SIZE;
  const y2 = fieldRect.height - CARROT_SIZE;
  for (let i = 0; i < count; i++) {
    const item = document.createElement("img");
    item.setAttribute("class", className);
    item.setAttribute("src", imgPath);
    item.style.position = "absolute";
    const x = randomNumber(x1, x2);
    const y = randomNumber(y1, y2);
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    field.appendChild(item);
  }
}

// === find the items
function onFieldClick(event) {
  if (!startFlag) {
    return;
  }
  const target = event.target;
  if (target.matches(".carrot")) {
    // 당근 찾음 !
    target.remove();
    score++;
    playSound(carrotSound);
    updateScoreBoard();
    if (score === CARROT_COUNT) {
      finishGame(true); // game - win
    }
  } else if (target.matches(".bug")) {
    // 벌레 찾음 !
    finishGame(false); // game - lose
  }
}

function playSound(sound) {
  sound.currentTime = 0; // 처음부터 재생
  sound.play();
}

function stopSound(sound) {
  sound.pause();
}

function updateScoreBoard() {
  gameScore.textContent = CARROT_COUNT - score;
}

// 정해진 범위 내에서 숫자 랜덤으로 뽑아오기
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
