// The slider is able to be adaptive, in that case slider is mobile first
// and we have to put the adaptive property into this settings object.
// The setting property is also an object, where is keys are resolution in px
// and their vlues is objects with new settings.

class Slide {
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
    #adaptive;
    #appearanceAnimation;

    #arrowsDOM;
    #paginationDOM;

    #touchStartX;
    #touchEndX;

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
          adaptive = false,
          appearanceAnimation = false,
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
        this.#adaptive = adaptive;
        this.#appearanceAnimation = appearanceAnimation;

        this.#initialSettings = {
            slidesToShow: slidesToShow,
            slidesToScroll: slidesToScroll,
            margins: margins,
            transition: transition,
            pagination: pagination,
            navigationArrows: navigationArrows,
        }

        // Slider init.
        this.#addSliderLine()
            .#applySettings()
            .#makeAdaptive()
            .#makeTouchResponsive();
    }

    #addSliderLine() {
        this.#sliderDOM.insertAdjacentHTML("afterBegin", Template.getSliderLineTemplate());
        this.#sliderLineDOM = this.#sliderDOM.children[0];
        this.#slides.forEach(slide => this.#sliderLineDOM.append(slide.getSlideDOM()));

        this.#sliderLineDOM.style.transform = `translate(${0}px)`;
        this.#positionX = Number(this.#sliderLineDOM.style.transform.match(/\d/g));

        return this;
    }

    #applySettings() {
        this.#setSliderWidth()
            .#setMargins()
            .#setTransition()
            .#addArrows()
            .#addPagination();
        
        return this;
    }

    #makeAdaptive() {
        if (!this.#adaptive) return this; 
        this.#adaptive["0"] = Object.assign({}, this.#initialSettings);

        // Finding breakpoint in adaptive object and apply this settings.
        function setBreakpointSettings() {
            let currentWidth = window.innerWidth;
            let currentBreakpointSettings = {};

            Object.keys(this.#adaptive)
                .filter(key => key < currentWidth)
                .map(key => +key)
                .forEach(key => Object.assign(currentBreakpointSettings, this.#adaptive[key]));

            this.#slidesToShow = currentBreakpointSettings.slidesToShow;
            this.#slidesToScroll = currentBreakpointSettings.slidesToScroll;
            this.#margins = currentBreakpointSettings.margins;
            this.#transition = currentBreakpointSettings.transition;
            this.#pagination = currentBreakpointSettings.pagination;
            this.#navigationArrows = currentBreakpointSettings.navigationArrows;
            this.#appearanceAnimation = currentBreakpointSettings.appearanceAnimation;

            this.#applySettings();

            // Calculating every posible indexes that could be displayed.
            let possibleIndexes = [0];
            for (let i = Math.floor(this.#slides.length / this.#slidesToScroll); i > 0; i--) {
                if (possibleIndexes[possibleIndexes.length - 1] + this.#slidesToScroll >= this.#slides.length) {
                    continue;
                }

                possibleIndexes.push(possibleIndexes[possibleIndexes.length - 1] + this.#slidesToScroll);
            }

            // If slider trying to set posible index, we will allow to him to do it.
            if (possibleIndexes.includes(this.#firstSlideIndex)) {
                this.setCurrentSlide();
                return;
            }

            // If not, we will caclulate the nearest one. 
            while(!possibleIndexes.includes(this.#firstSlideIndex)) {
                this.#firstSlideIndex -= 1;
            }
            this.setCurrentSlide();

            return;
        }

        setBreakpointSettings.call(this);
        window.addEventListener("resize", setBreakpointSettings.bind(this));
        
        return this;
    }

    #setSliderWidth() {
        let newSliderWidth = 0;
        this.#slides.some((slide, index) => {
            if (this.#slidesToShow === 1) {
                newSliderWidth += slide.getWidth();
                return true;
            }

            if (
                this.#firstSlideIndex === this.#slides.length - 1 ||
                this.#firstSlideIndex + (this.#slidesToShow - 1) > this.#slides.length - 1 
            ) {
                newSliderWidth += slide.getWidth() * this.#slidesToShow + this.#margins * (this.#slidesToShow - 1);
                return true;
            }

            if (
                index > this.#firstSlideIndex &&
                index === this.#firstSlideIndex + this.#slidesToShow - 1
            ) {
                newSliderWidth += slide.getWidth();
                newSliderWidth += slide.getWidth() + this.#margins;
            } else if (
                index > this.#firstSlideIndex &&
                index < this.#firstSlideIndex + this.#slidesToShow
            ) {
                newSliderWidth += slide.getWidth() + this.#margins;
            }
        });

        this.#sliderDOM.style.width = newSliderWidth + "px";
        return this;
    }

    #setMargins() {
        this.#slides.forEach((slide, index) => {
            if (index > 0) {
                slide.getSlideDOM().style.marginLeft = this.#margins + "px";
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

        this.#sliderDOM.insertAdjacentHTML("beforeEnd", Template.getArrowsTemplate());
        this.#arrowsDOM = this.#sliderDOM.querySelector("._slider-arrows");

        Array.from(this.#arrowsDOM.children).forEach(arrowDOM => {
            if (Array.from(arrowDOM.children).some(elemDOM => elemDOM.classList.contains("left-arrow"))) {
                arrowDOM.addEventListener("click", this.prevSlide.bind(this));
            }

            if (Array.from(arrowDOM.children).some(elemDOM => elemDOM.classList.contains("right-arrow"))) {
                arrowDOM.addEventListener("click", this.nextSlide.bind(this));
            }
        });

        this.#setActiveArrow();
        return this;
    }

    #setActivePaginationBtn() {
        if (!this.#paginationDOM) return this;

        Array.from(this.#paginationDOM.children).forEach((paginationBtnDOM, index) => {
            if (index === Math.round(this.#firstSlideIndex / this.#slidesToScroll)) {
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
            Template.getPaginationTemplate(Math.ceil(this.#slides.length / this.#slidesToScroll))
        );
        
        this.#paginationDOM = this.#sliderDOM.querySelector("._slider-pagination");
        this.#setActivePaginationBtn();

        Array.from(this.#paginationDOM.children).forEach((paginationBtnDOM, index) => {
            paginationBtnDOM.addEventListener("click", this.#setPaginationBtnEvent.bind(this, index));
        });

        return this;
    }

    #setPaginationBtnEvent(index) {
        this.setCurrentSlide(Math.ceil(index * this.#slidesToScroll));
        return;
    }

    #makeTouchResponsive() {
        this.#sliderLineDOM.addEventListener("touchstart", this.#touchStartEvent.bind(this),  { passive: true });
        this.#sliderLineDOM.addEventListener("touchend", this.#touchEndEvent.bind(this),  { passive: true });

        return this;
    }

    #touchStartEvent(event) {
        event.stopPropagation();
        
        this.#touchStartX = event.touches[0].clientX;

        return;
    }

    #touchEndEvent(event) {
        event.stopPropagation();

        this.#touchEndX = event.changedTouches[0].clientX;
        const touchDinstance = this.#touchEndX - this.#touchStartX;

        if (
            touchDinstance > 0 &&
            Math.abs(touchDinstance) > (touchDinstance * 65) / 100
        ) {
            this.prevSlide();
        }

        if (
            touchDinstance < 0 &&
            Math.abs(touchDinstance) > (touchDinstance * 65) / 100
        ) {
            this.nextSlide();
        }

        return;
    }

    #playAnimation() {
        this.#slides.forEach((slide, index) => {
            if (
                index >= this.#firstSlideIndex &&
                index <= this.#firstSlideIndex + this.#slidesToShow
            ) {
                Animate.show(slide.getSlideDOM(), 1000);
            }
        });

        return this;
    }

    // It's the first slide index if SlidesToShow bigger then 1.
    setCurrentSlide(number = this.#firstSlideIndex) {
        this.#firstSlideIndex = number;
        this.#positionX = (this.#slides[0].getWidth() + this.#margins) * this.#firstSlideIndex * -1;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;

        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
    }

    nextSlide() {
        if (this.#firstSlideIndex === this.#slides.length - 1) return this;

        this.#firstSlideIndex += this.#slidesToScroll;
        this.#positionX -= (this.#slides[0].getWidth() + this.#margins) * this.#slidesToScroll;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;
                
        if (this.#appearanceAnimation) this.#playAnimation();
        
        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
    }

    prevSlide() {
        if (this.#firstSlideIndex === 0) return this;

        this.#firstSlideIndex -= this.#slidesToScroll;
        this.#positionX += (this.#slides[0].getWidth() + this.#margins) * this.#slidesToScroll;
        this.#sliderLineDOM.style.transform = `translate(${this.#positionX}px)`;

        if (this.#appearanceAnimation) this.#playAnimation();

        this.#setActiveArrow().#setActivePaginationBtn();
        return this;
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

            adaptive: {
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
                    appearanceAnimation: true,
                }
            }
        }
    );
});