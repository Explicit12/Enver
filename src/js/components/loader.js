import Keyframes from "../helpers/animations";

export default class PageLoader {
  static #loaderDOM = document.querySelector(".loader-cover");
  static #htmlElem = document.querySelector("html");

  static init() {
    window.addEventListener("load", this.#removeLoader.bind(this));
    this.#htmlElem.style.overflowY = "hidden";
    return this;
  }

  static #removeLoader() {
    this.#loaderDOM.animate(Keyframes.hide, 1000);
    this.#htmlElem.style.overflowY = "visible";
    this.#loaderDOM.remove();
    return this;
  }
}
