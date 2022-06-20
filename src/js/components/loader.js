import Animate from "../helpers/animations";

export default class PageLoader {
  static #loaderDOM = document.querySelector(".loader-cover");
  static #htmlElem = document.querySelector("html");

  static init() {
    window.addEventListener("load", this.#removeLoader.bind(this));
    this.#htmlElem.style.overflowY = "hidden";
    return this;
  }

  static #removeLoader() {
    Animate.hide(this.#loaderDOM, 3500);
    this.#htmlElem.style.overflowY = "visible";
    this.#loaderDOM.remove();
    return this;
  }
}
