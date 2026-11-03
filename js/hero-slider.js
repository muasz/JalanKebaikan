(() => {
    const slider = document.querySelector(".hero-media");

    if (!slider) {
        return;
    }

    const slides = slider.querySelector(".hero-slides");
    const dots = [...slider.querySelectorAll(".hero-slider-dot")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let timerId = null;

    const showSlide = (index) => {
        activeIndex = (index + dots.length) % dots.length;
        slides.style.transform = `translateX(-${activeIndex * (100 / dots.length)}%)`;

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    const stopAutoplay = () => {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
    };

    const startAutoplay = () => {
        stopAutoplay();

        if (reducedMotion.matches || dots.length < 2) {
            return;
        }

        timerId = window.setInterval(() => {
            showSlide(activeIndex + 1);
        }, 5000);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startAutoplay();
        });
    });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", startAutoplay);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    showSlide(0);
    startAutoplay();
})();
