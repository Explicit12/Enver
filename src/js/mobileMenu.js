export default class MobileMenu {
    static #menu = document.querySelector(".mobile-menu");
    static #closeBtn = this.#menu.querySelector(".close-btn");
    static #burgerBtn = document.querySelector(".burger-btn");
    static #htmlElem = document.querySelector("html");

    static init() {
        this.#closeBtn.addEventListener("click", this.#close.bind(this));
        this.#burgerBtn.addEventListener("click", this.#open.bind(this));
        return this;
    }

    static #open() {
        this.#menu.classList.add("mobile-menu-opened");
        this.#htmlElem.style.overflowY = "hidden";
        return this;
    }

    static #close() {
        this.#menu.classList.remove("mobile-menu-opened");
        this.#htmlElem.style.overflowY = "visible";
        return this;
    }
}