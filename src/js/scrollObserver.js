export default class ScrollObserver {
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