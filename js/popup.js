"use strict";

export default class PopUp {
  constructor() {
    // PopUp class에 멤버변수(클래스 내부의 캡슐화된 변수)를 생성
    this.popUp = document.querySelector(".pop-up");
    this.popUpText = document.querySelector(".pop-up__message");
    this.popUpRefreshBtn = document.querySelector(".pop-up__refresh");
    this.popUpRefreshBtn.addEventListener("click", () => {
      this.onClick && this.onClick();
      this.hide();
    });
  }

  // onClick 이라는 콜백함수 등록 -> 멤버변수에 onClick 할당
  setClickListener(onClick) {
    this.onClick = onClick;
  }

  showWithText(text) {
    this.popUpText.textContent = text;
    this.popUp.classList.remove("pop-up__hide");
  }

  hide() {
    this.popUp.classList.add("pop-up__hide");
  }
}
