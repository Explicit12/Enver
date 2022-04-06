class Template {
    get sliderLineTemplate() {
        return `<div class="_slider-line"></div>`;
    }

    #arrowTemplate(direction) {
        return `<button class="_slider-arrow-btn">
                    <svg class="svg-sprite ${direction}-arrow">
                        <use xlink:href="./svg/sprites.svg#icons--arrow-cin"></use>
                    </svg>
                </button>`;
    }

    get arrowsTemplate() {
        return `<div class="_slider-arrows">
                    ${this.#arrowTemplate("left")}
                    ${this.#arrowTemplate("right")}
                </div>`;
    }

    paginationTemplate(number) {
        const dot = `<button class="_slider-pagination-btn" data-active="false"></button>`
        return `<div class="_slider-pagination">
                    ${dot.repeat(number)}
                </div>`
    }
}

const template = new Template();