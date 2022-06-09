export default class Animate {
    static show(target, duration) {
        const startTime = performance.now();
        const targetDOM = target;

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