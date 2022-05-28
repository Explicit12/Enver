class Template {
    static getSliderLineTemplate() {
        return `<div class="_slider-line"></div>`;
    }

    static #arrowTemplate(direction) {
        return `<button class="_slider-arrow-btn">
                    <svg class="svg-sprite ${direction}-arrow">
                        <use xlink:href="./svg/sprites.svg#icons--arrow-cin"></use>
                    </svg>
                </button>`;
    }

    static getArrowsTemplate() {
        return `<div class="_slider-arrows">
                    ${this.#arrowTemplate("left")}
                    ${this.#arrowTemplate("right")}
                </div>`;
    }

    static getPaginationTemplate(number) {
        const dot = `<button class="_slider-pagination-btn" data-active="false"></button>`;
        return `<div class="_slider-pagination">
                    ${dot.repeat(number)}
                </div>`;
    }

    static getThumbnailTemplate(imgPath) {
        return `<img class="thumbnail" src="${imgPath}" alt="thumbnail" loading="lazy"></img>`;
    }

    static getPlayerBtnTemplate(iconPath) {
        return `<img class="play-btn" src="${iconPath}" alt="Play" loading="lazy">`
    }
}
