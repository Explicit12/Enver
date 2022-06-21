import Keyframes from "./animations";

export default class showInView {
  static #observer = null;

  static init() {
    this.#observer = new IntersectionObserver(this.#showAnimation);
    return this;
  }

  static show(element) {
    if (Array.isArray(element)) {
      element.forEach((targetElement) => {
        this.#observer.observe(targetElement);
      });
      return this;
    }

    this.#observer.observe(element);
    return this;
  }

  static #showAnimation(entries) {
    entries.forEach((element) => {
      element.target.animate(Keyframes.showFrames, {
          duration: 1000,
          delay: 250,
        });
    });
  }
}
