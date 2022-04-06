class Slide {
    #slideDOM;
    #width;

    constructor(slideDOM) {
        this.#slideDOM = slideDOM;

        this.#addSliderClass();
    }

    #addSliderClass() {
        this.#slideDOM.classList.add("_slider-slide");
    }

    get width() {
        return this.#slideDOM.offsetWidth;
    }

    get getSlideDOM() {
        return this.#slideDOM;
    }
}

class Slider {
    #initialSettings;

    #sliderDOM;
    #slides;
    #sliderLineDOM;
    #positionX;

    #slidesToShow;
    #slidesToScroll;
    #firstSlideIndex;
    #margins;
    #transition;
    #pagination;
    #navigationArrows;
    #responsive;

    #arrowsDOM;
    #paginationDOM;

    constructor(
        selector, 
        {
          slidesToShow = 1,
          slidesToScroll = 1,
          firstSlideIndex = 0,
          margins = 0,
          transition = 0,
          pagination = false,
          navigationArrows = true,
          responsive = false
        } = {}
        ) {
        this.#sliderDOM = document.querySelector(selector);
        this.#sliderDOM.classList.add("_slider");

        this.#slides = [];
        Array.from(this.#sliderDOM.children).forEach((slideDOM) => {
            this.#slides.push(new Slide(slideDOM));
        });

        this.#slidesToShow = slidesToShow;
        this.#slidesToScroll = slidesToScroll;
        this.#firstSlideIndex = firstSlideIndex;
        this.#margins = margins;
        this.#transition = transition;
        this.#pagination = pagination;
        this.#navigationArrows = navigationArrows;
        this.#responsive = responsive;

        this.#initialSettings = {
            slidesToShow: slidesToShow,
            slidesToScroll: slidesToScroll,
            margins: margins,
            transition: transition,
            pagination: pagination,
            navigationArrows: navigationArrows,
        }

        this.#addSliderLine()
            .#applySettings()
            .#makeResponsive();
    }

    #applySettings() {
        this.#setSliderWidth()
            .#setMargins()
            .#setTransition()
            .#addArrows()
            .#addPagination();
        
        return this;
    }

    #addSliderLine() {
        this.#sliderDOM.insertAdjacentHTML("afterBegin", template.sliderLineTemplate);
        this.#sliderLineDOM = this.#sliderDOM.children[0];
        this.#slides.forEach(slide => this.#sliderLineDOM.append(slide.getSlideDOM));

        this.#sliderLineDOM.style.transform = `translate(${0}px)`;
        this.#positionX = Number(this.#sliderLineDOM.style.transform.match(/\d/g));

        return this;
    }

    #makeResponsive() {
        if (!this.#responsive) return this; 
        this.#responsive["0"] = Object.assign({}, this.#initialSettings);

        function setBreakpointSettings() {
            let currentWidth = window.innerWidth;
            let currentBreakpointSettings = {};

            Object.keys(this.#responsive)
                .filter(key => key < currentWidth)
                .map(key => +key)
                .forEach(key => Object.assign(currentBreakpointSettings, this.#responsive[key]));

            this.#slidesToShow = currentBreakpointSettings.slidesToShow;
            this.#slidesToScroll = currentBreakpointSettings.slidesToScroll;
            this.#margins = currentBreakpointSettings.margins;
            this.#transition = currentBreakpointSettings.transition;
            this.#pagination = currentBreakpointSettings.pagination;
            this.#navigationArrows = currentBreakpointSettings.navigationArrows;
            
            // if (this.#firstSlideIndex - this.#slidesToScroll > 0) {
            //     this.setCurrentSlide(this.#firstSlideIndex - this.#slidesToScroll + 1);
            // } else {
            //     this.setCurrentSlide();
            // }

            this.#applySettings();
        }

        setBreakpointSettings.call(this);
        window.addEventListener("resize", () => setBreakpointSettings.call(this));
        return this;
    }

    #setSliderWidth() {
        let newSliderWidth = 0;
        this.#slides.forEach((slide, index) => {
            if (index > this.#firstSlideIndex &&
                index === this.#firstSlideIndex + this.#slidesToShow) {
                newSliderWidth += slide.width;
            }

            if (index > this.#firstSlideIndex &&
                index < this.#firstSlideIndex + this.#slidesToShow) {
                newSliderWidth += slide.width + this.#margins;
            }
        });

        this.#sliderDOM.style.width = newSliderWidth + "px";
        return this;
    }

    #setMargins() {
        this.#slides.forEach((slide, index) => {
            if (index > 0) {
                slide.getSlideDOM.style.marginLeft = this.#margins + "px";
            }
        });

        return this;
    }

    #setTransition() {
        this.#sliderLineDOM.style.transition = this.#transition + "ms";

        return this;
    }

    #setActiveArrow() {
        if (!this.#arrowsDOM) return this;

        if (this.#firstSlideIndex <= 0) {
            this.#arrowsDOM.children[0].setAttribute("disabled", "true");
        } else {
            this.#arrowsDOM.children[0].removeAttribute("disabled");
        }

        if (this.#firstSlideIndex >= this.#slides.length - this.#slidesToScroll) {
            this.#arrowsDOM.children[1].setAttribute("disabled", "true");
        } else {
            this.#arrowsDOM.children[1].removeAttribute("disabled");
        }

        return this;
    }

    #addArrows() {
        if (this.#navigationArrows && this.#arrowsDOM) return this;
        if (!this.#navigationArrows && this.#arrowsDOM) {
            this.#arrowsDOM.remove();
            this.#arrowsDOM = null;
            return this;
        }
        if (!this.#navigationArrows) return this;

        this.#sliderDOM.insertAdjacentHTML("beforeEnd", template.arrowsTemplate);
        this.#arrowsDOM = this.#sliderDOM.querySelector("._slider-arrows");

        Array.from(this.#arrowsDOM.children).forEach(arrowDOM => {
            if ([...arrowDOM.children].some(elemDOM => elemDOM.classList.contains("left-arrow"))) {
                arrowDOM.addEventListener("click", () => { this.prevSlide(); });
            }

            if ([...arrowDOM.children].some(elemDOM => elemDOM.classList.contains("right-arrow"))) {
                arrowDOM.addEventListener("click", () => { this.nextSlide(); });
            }
        });

        this.#setActiveArrow();
        return this;
    }

    #setActivePaginationBtn() {
        if (!this.#paginationDOM) return this;

        Array.from(this.#paginationDOM.children).forEach((paginationBtnDOM, index) => {
            if (index === this.#firstSlideIndex / this.#slidesToScroll) {
                paginationBtnDOM.setAttribute("data-active", true);
            } else {
                paginationBtnDOM.setAttribute("data-active", false);
            }
        });

        return this;
    }

    #addPagination() {
        if (!this.#pagination && this.#paginationDOM) {
            this.#paginationDOM.remove();
            this.#paginationDOM = null;
            return this;
        }
        if (!this.#pagination) return this;

        if (this.#paginationDOM) this.#paginationDOM.remove();
        this.#sliderDOM.insertAdjacentHTML(
            "beforeEnd", 
            template.paginationTemplate(Math.ceil(this.#slides.length / this.#slidesToScroll))
        );
        
        this.#paginationDOM = this.#sliderDOM.querySelector("._slider-pagination");
        this.#setActivePaginationBtn();

        Array.from(this.#paginationDOM.children).forEach((paginationBtnDOM, index) => {
            paginationBtnDOM.addEventListener("click", () => {
                this.setCurrentSlide(Math.ceil(index * this.#slidesToScroll))
                    .#setActivePaginationBtn();
            });
        });

        return this;
    }

    // It's the first slide index if SlidesToShow bigger then 1
    setCurrentSlide(number = this.#firstSlideIndex) {
        this.#firstSlideIndex = number;
        this.#positionX = (this.#slides[0].width + this.#margins) * this.#firstSlideIndex * -1;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;

        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
    }

    nextSlide() {
        this.#firstSlideIndex += this.#slidesToScroll;
        this.#positionX -= (this.#slides[0].width + this.#margins) * this.#slidesToScroll;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;
        
        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
    }

    prevSlide() {
        this.#firstSlideIndex -= this.#slidesToScroll;
        this.#positionX += (this.#slides[0].width + this.#margins) * this.#slidesToScroll;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;

        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
    }

    get getSliderDOM() {
        return this.#sliderDOM;
    }

    get slides() {
        return this.#slides;
    }
}

window.addEventListener("load", () => {
    const slider = new Slider(
        "#slider",
        {
            slidesToShow: 1,
            slidesToScroll: 1,
            navigationArrows: false,
            pagination: true,
            transition: 250,

            responsive: {
                720: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    margins: 24,
                },

                1180: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    navigationArrows: true,
                    pagination: false,
                    transition: 0,
                }
            }
        }
    );
});