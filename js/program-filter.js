(() => {
    const buttons = document.querySelectorAll("[data-program-filter]");
    const cards = document.querySelectorAll("[data-program-category]");
    const status = document.querySelector("#program-filter-status");

    if (!buttons.length || !cards.length || !status) {
        console.error("Filter program tidak dapat diinisialisasi: elemen filter, kartu, atau status tidak ditemukan.");
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.programFilter;
            let visibleCount = 0;

            buttons.forEach((item) => {
                item.setAttribute("aria-pressed", String(item === button));
            });

            cards.forEach((card) => {
                const shouldShow =
                    selectedCategory === "all" ||
                    card.dataset.programCategory === selectedCategory;

                card.classList.toggle("program-card--hidden", !shouldShow);

                if (shouldShow) visibleCount++;
            });

            status.textContent =
                `${visibleCount} program ditampilkan untuk kategori ${button.textContent.trim()}.`;
        });
    });
})();