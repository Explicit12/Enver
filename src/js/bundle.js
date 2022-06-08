(function () {
    'use strict';

    class Animate {
        static show(target, duration) {
            const startTime = performance.now();
            const targetDOM = target;
            console.log(targetDOM);

            targetDOM.style.opacity = 0;

            function animate(time) {
                let timeFraction = (time - startTime) / duration;
                if (timeFraction > 1) timeFraction = 1;

                targetDOM.style.opacity = timeFraction;

                if (Number(targetDOM.style.opacity) === 1) {
                    window.cancelAnimationFrame(animate);
                    return;
                }
                
                window.requestAnimationFrame(animate);
                return;
            }

            window.requestAnimationFrame(animate);
            return this;
        }
    }

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
    }

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
            };

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

    class ScrollObserver {
        static isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        static showInView(elements) {
            window.addEventListener("scroll", showAnim.bind(this));

            function showAnim() {
                Array.from(elements).forEach(element => {
                    if (this.isInViewport(element)) {
                        setTimeout(() => {
                            element.style.opacity = 1;
                        }, 250);
                    } else {
                        element.style.opacity = 0;
                    }
                });
            }
        }
    }

    /**
     * A lightweight youtube embed. Still should feel the same to the user, just MUCH faster to initialize and paint.
     *
     * Thx to these as the inspiration
     *   https://storage.googleapis.com/amp-vs-non-amp/youtube-lazy.html
     *   https://autoplay-youtube-player.glitch.me/
     *
     * Once built it, I also found these:
     *   https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube (👍👍)
     *   https://github.com/Daugilas/lazyYT
     *   https://github.com/vb/lazyframe
     */
    class LiteYTEmbed extends HTMLElement {
        connectedCallback() {
            this.videoId = this.getAttribute('videoid');

            let playBtnEl = this.querySelector('.lty-playbtn');
            // A label for the button takes priority over a [playlabel] attribute on the custom-element
            this.playLabel = (playBtnEl && playBtnEl.textContent.trim()) || this.getAttribute('playlabel') || 'Play';

            /**
             * Lo, the youtube placeholder image!  (aka the thumbnail, poster image, etc)
             *
             * See https://github.com/paulirish/lite-youtube-embed/blob/master/youtube-thumbnail-urls.md
             *
             * TODO: Do the sddefault->hqdefault fallback
             *       - When doing this, apply referrerpolicy (https://github.com/ampproject/amphtml/pull/3940)
             * TODO: Consider using webp if supported, falling back to jpg
             */
            if (!this.style.backgroundImage) {
              this.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg")`;
            }

            // Set up play button, and its visually hidden label
            if (!playBtnEl) {
                playBtnEl = document.createElement('button');
                playBtnEl.type = 'button';
                playBtnEl.classList.add('lty-playbtn');
                this.append(playBtnEl);
            }
            if (!playBtnEl.textContent) {
                const playBtnLabelEl = document.createElement('span');
                playBtnLabelEl.className = 'lyt-visually-hidden';
                playBtnLabelEl.textContent = this.playLabel;
                playBtnEl.append(playBtnLabelEl);
            }

            // On hover (or tap), warm up the TCP connections we're (likely) about to use.
            this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {once: true});

            // Once the user clicks, add the real iframe and drop our play button
            // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
            //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
            this.addEventListener('click', this.addIframe);
        }

        // // TODO: Support the the user changing the [videoid] attribute
        // attributeChangedCallback() {
        // }

        /**
         * Add a <link rel={preload | preconnect} ...> to the head
         */
        static addPrefetch(kind, url, as) {
            const linkEl = document.createElement('link');
            linkEl.rel = kind;
            linkEl.href = url;
            if (as) {
                linkEl.as = as;
            }
            document.head.append(linkEl);
        }

        /**
         * Begin pre-connecting to warm up the iframe load
         * Since the embed's network requests load within its iframe,
         *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
         * So, the best we can do is warm up a few connections to origins that are in the critical path.
         *
         * Maybe `<link rel=preload as=document>` would work, but it's unsupported: http://crbug.com/593267
         * But TBH, I don't think it'll happen soon with Site Isolation and split caches adding serious complexity.
         */
        static warmConnections() {
            if (LiteYTEmbed.preconnected) return;

            // The iframe document and most of its subresources come right off youtube.com
            LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
            // The botguard script is fetched off from google.com
            LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');

            // Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
            LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
            LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');

            LiteYTEmbed.preconnected = true;
        }

        addIframe(e) {
            if (this.classList.contains('lyt-activated')) return;
            e.preventDefault();
            this.classList.add('lyt-activated');

            const params = new URLSearchParams(this.getAttribute('params') || []);
            params.append('autoplay', '1');

            const iframeEl = document.createElement('iframe');
            iframeEl.width = 560;
            iframeEl.height = 315;
            // No encoding necessary as [title] is safe. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#:~:text=Safe%20HTML%20Attributes%20include
            iframeEl.title = this.playLabel;
            iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
            iframeEl.allowFullscreen = true;
            // AFAIK, the encoding here isn't necessary for XSS, but we'll do it only because this is a URL
            // https://stackoverflow.com/q/64959723/89484
            iframeEl.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${params.toString()}`;
            this.append(iframeEl);

            // Set focus for a11y
            iframeEl.focus();
        }
    }

    customElements.define('lite-youtube', LiteYTEmbed);
    ScrollObserver.showInView(document.querySelectorAll(".abstract-shape"));

    window.addEventListener("load", () => {
        new Slider(
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

})();
