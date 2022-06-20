export default class Slide {
  #slideDOM;

  constructor(slideDOM) {
    this.#slideDOM = slideDOM;

    this.#addSliderClass();
  }

  #addSliderClass() {
    this.#slideDOM.classList.add("_slider-slide");
  }

  getWidth() {
    return this.#slideDOM.offsetWidth;
  }

  getSlideDOM() {
    return this.#slideDOM;
  }
}
