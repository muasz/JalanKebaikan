(function () {
    "use strict";

    const dropdowns = document.querySelectorAll(".jk-dropdown");
    const mobileMenu = document.querySelector(".site-mobile-menu");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const dropdownStates = new WeakMap();

    dropdowns.forEach((dropdown) => {
        dropdownStates.set(dropdown, { openedByHover: false, pinnedByClick: false });
    });

    function setDropdownOpen(dropdown, isOpen) {
        const toggle = dropdown.querySelector(".jk-dropdown-toggle");
        dropdown.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) {
            dropdown.classList.remove("is-dismissed");
        } else {
            const state = dropdownStates.get(dropdown);
            state.openedByHover = false;
            state.pinnedByClick = false;
        }
    }

    function closeDropdowns(except) {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) setDropdownOpen(dropdown, false);
        });
    }

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".jk-dropdown-toggle");
        const menu = dropdown.querySelector(".jk-dropdown-menu");

        toggle.addEventListener("click", () => {
            const state = dropdownStates.get(dropdown);
            const shouldOpen = !dropdown.classList.contains("is-open");
            if (!shouldOpen && state.openedByHover) {
                state.openedByHover = false;
                state.pinnedByClick = true;
                setDropdownOpen(dropdown, true);
                return;
            }

            closeDropdowns(dropdown);
            setDropdownOpen(dropdown, shouldOpen);
            state.pinnedByClick = shouldOpen;
            if (!shouldOpen) dropdown.classList.add("is-dismissed");
        });

        dropdown.addEventListener("pointerenter", () => {
            if (desktopQuery.matches) {
                const state = dropdownStates.get(dropdown);
                dropdown.classList.remove("is-dismissed");
                closeDropdowns(dropdown);
                if (!dropdown.classList.contains("is-open")) {
                    state.openedByHover = true;
                }
                setDropdownOpen(dropdown, true);
            }
        });

        dropdown.addEventListener("pointerleave", () => {
            const state = dropdownStates.get(dropdown);
            if (desktopQuery.matches && !state.pinnedByClick && !dropdown.contains(document.activeElement)) {
                setDropdownOpen(dropdown, false);
                dropdown.classList.remove("is-dismissed");
            }
        });

        dropdown.addEventListener("focusout", (event) => {
            if (desktopQuery.matches && !dropdown.contains(event.relatedTarget)) {
                setDropdownOpen(dropdown, false);
                dropdown.classList.remove("is-dismissed");
            }
        });

        menu.addEventListener("click", (event) => {
            if (event.target.closest("a")) {
                setDropdownOpen(dropdown, false);
                if (mobileMenu) mobileMenu.open = false;
            }
        });
    });

    if (mobileMenu) {
        mobileMenu.addEventListener("toggle", () => {
            if (!mobileMenu.open) closeDropdowns();
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".jk-dropdown")) closeDropdowns();
        if (mobileMenu && !event.target.closest(".site-mobile-menu")) {
            mobileMenu.open = false;
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        const openDropdown = document.querySelector(".jk-dropdown.is-open");
        if (openDropdown) {
            setDropdownOpen(openDropdown, false);
            openDropdown.classList.add("is-dismissed");
            openDropdown.querySelector(".jk-dropdown-toggle").focus();
            return;
        }

        if (mobileMenu && mobileMenu.open) {
            mobileMenu.open = false;
            mobileMenu.querySelector("summary").focus();
        }
    });
})();
