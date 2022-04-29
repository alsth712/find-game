import Field from "./field.js";
import * as sound from "./sound.js";

export const Reason = Object.freeze({
  // Object.freeze : 객체를 고정(freeze)
  win: "win",
  lose: "lose",
  cancel: "cancel",
});

// Builder Pattern - obj 관리
export class GameBuilder {
  withGameDuration(duration) {
    this.gameDuration = duration;
    return this;
  }

  withCarrotCount(num) {
    this.carrotCount = num;
    return this;
  }

  withBugCount(num) {
    this.bugCount = num;
    return this;
  }

  // build 함수 호출 시, Game class 생성 후 값을 return
  build() {
    return new Game(
      this.gameDuration, //
      this.carrotCount, //
      this.bugCount
    );
  }
}

// Game class 노출 X
class Game {
  constructor(gameDuration, carrotCount, bugCount) {
    this.gameDuration = gameDuration;
    this.carrotCount = carrotCount;
    this.bugCount = bugCount;

    this.gameTimer = document.querySelector(".game__timer");
    this.gameScore = document.querySelector(".game__score");
    this.gameBtn = document.querySelector(".game__button");
    this.gameBtn.addEventListener("click", () => {
      if (this.startFlag) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.gameField = new Field(carrotCount, bugCount);
    this.gameField.setClickListener(this.onItemClick);

    this.startFlag = false;
    this.score = 0;
    this.timer = undefined;
  }

  setGameStopListener(onGameStop) {
    this.onGameStop = onGameStop;
  }

  // == start Game
  start() {
    this.startFlag = true;
    this.createGame(); // game item 만들기
    this.showStopButton(); // 정지버튼 보여주기
    this.showTimerAndScore(); // timer & score 를 game start 하면 보여주기
    this.startGameTimer(); // game timer 시작
    sound.playBackground();
  }

  // == stop Game
  stop() {
    this.startFlag = false;
    this.stopGameTimer(); // game timer 종료
    this.hideGameButton();
    sound.playAlert();
    sound.stopBackground();
    this.onGameStop && this.onGameStop(Reason.cancel);
  }

  // == finish game
  finish(win) {
    this.startFlag = false;
    this.hideGameButton();
    if (win) {
      sound.playWin();
    } else {
      sound.playBug();
    }
    this.stopGameTimer(); // game timer 종료
    sound.stopBackground();
    this.onGameStop && this.onGameStop(win ? Reason.win : Reason.lose);
  }

  // === find the items
  onItemClick = (item) => {
    if (!this.startFlag) {
      return;
    }
    if (item === "carrot") {
      // item = 당근
      this.score++;
      this.updateScoreBoard();
      if (this.score === this.carrotCount) {
        this.finish(true); // game - win
      }
    } else if (item === "bug") {
      // item = 벌레
      this.finish(false); // game - lose
    }
  };

  showStopButton() {
    const icon = this.gameBtn.querySelector(".fas");
    icon.classList.add("fa-stop");
    icon.classList.remove("fa-play");
    this.gameBtn.style.visibility = "visible";
  }

  hideGameButton() {
    this.gameBtn.style.visibility = "hidden";
  }

  showTimerAndScore() {
    this.gameTimer.style.visibility = "visible";
    this.gameScore.style.visibility = "visible";
  }

  startGameTimer() {
    let remainingTimeSec = this.gameDuration;
    this.updateTimerText(remainingTimeSec);
    this.timer = setInterval(() => {
      if (remainingTimeSec <= 0) {
        // 남은 시간이 0초 이하라면 타이머 초기화 & game 종료
        clearInterval(this.timer);
        this.finish(this.carrotCount === this.score);
        return;
      }
      this.updateTimerText(--remainingTimeSec); // 남은 시간이 있다면, 남은 시간 -
    }, 1000);
  }

  stopGameTimer() {
    clearInterval(this.timer);
  }

  updateTimerText(time) {
    const minutes = Math.floor(time / 60); // minutes 소수점 내림 값
    const seconds = time % 60; // seconds / 60 의 나머지 값
    this.gameTimer.textContent = `${minutes}:${seconds}`;
  }

  // == create Game
  createGame() {
    // score 초기화
    this.score = 0;

    // game score는 당근의 수
    this.gameScore.innerText = this.carrotCount;

    // gameField 에서 create
    this.gameField.create();
  }

  updateScoreBoard() {
    this.gameScore.textContent = this.carrotCount - this.score;
  }
}
