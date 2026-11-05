(function () {
    "use strict";

    const STORAGE_KEY = "jalan-kebaikan-accessibility";
    const defaults = {
        scale: 1,
        contrast: "normal",
        letterSpacing: 0,
        wordSpacing: 0,
        lineHeight: 1.6
    };
    const spacingSteps = {
        letterSpacing: [0, 0.12, 0.24],
        wordSpacing: [0, 0.16, 0.32],
        lineHeight: [1.6, 1.75, 2]
    };
    const scaleSteps = [1, 1.25, 1.5, 1.75, 2];

    function loadSettings() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            const settings = { ...defaults, ...stored };
            return {
                scale: scaleSteps.includes(settings.scale) ? settings.scale : defaults.scale,
                contrast: stored.contrast === "high" ? "high" : "normal",
                letterSpacing: spacingSteps.letterSpacing.includes(settings.letterSpacing)
                    ? settings.letterSpacing
                    : defaults.letterSpacing,
                wordSpacing: spacingSteps.wordSpacing.includes(settings.wordSpacing)
                    ? settings.wordSpacing
                    : defaults.wordSpacing,
                lineHeight: spacingSteps.lineHeight.includes(settings.lineHeight)
                    ? settings.lineHeight
                    : defaults.lineHeight
            };
        } catch (error) {
            console.error("Pengaturan aksesibilitas tidak dapat dimuat.", error);
            return { ...defaults };
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Pengaturan aksesibilitas tidak dapat disimpan.", error);
        }
    }

    function createToolbar() {
        const toolbar = document.createElement("div");
        toolbar.className = "accessibility-toolbar";
        toolbar.innerHTML = `
            <button type="button" class="accessibility-button" aria-label="Pengaturan Aksesibilitas" aria-expanded="false" aria-controls="accessibility-panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M5 9h14M12 7v12M8 21l4-7 4 7"></path>
                </svg>
                <span class="accessibility-tooltip" role="tooltip">Pengaturan Aksesibilitas</span>
            </button>
            <aside id="accessibility-panel" class="accessibility-panel" aria-labelledby="accessibility-title" aria-hidden="true">
                <div class="accessibility-panel-header">
                    <div>
                        <h2 id="accessibility-title" class="accessibility-panel-title">Pengaturan Aksesibilitas</h2>
                        <p class="accessibility-panel-description">Sesuaikan tampilan website sesuai kebutuhan penglihatan Anda.</p>
                    </div>
                    <button type="button" class="accessibility-close" aria-label="Tutup pengaturan aksesibilitas">×</button>
                </div>
                <section class="accessibility-section" aria-labelledby="accessibility-text-title">
                    <h3 id="accessibility-text-title" class="accessibility-section-title">Ukuran Teks</h3>
                    <div class="accessibility-action-row">
                        <button type="button" class="accessibility-control" data-scale-change="-1">A− <span class="accessibility-status">Perkecil teks</span></button>
                        <button type="button" class="accessibility-control" data-scale-change="1">A+ <span class="accessibility-status">Perbesar teks</span></button>
                        <button type="button" class="accessibility-control" data-reset-scale>Reset</button>
                    </div>
                </section>
                <section class="accessibility-section" aria-labelledby="accessibility-contrast-title">
                    <h3 id="accessibility-contrast-title" class="accessibility-section-title">Kontras Warna</h3>
                    <div class="accessibility-choice-row" role="group" aria-label="Mode kontras warna">
                        <button type="button" class="accessibility-control" data-contrast="normal" aria-pressed="false">Normal</button>
                        <button type="button" class="accessibility-control" data-contrast="high" aria-pressed="false">Kontras Tinggi</button>
                    </div>
                </section>
                <section class="accessibility-section" aria-labelledby="accessibility-spacing-title">
                    <h3 id="accessibility-spacing-title" class="accessibility-section-title">Jarak Teks</h3>
                    <div class="accessibility-spacing-row" data-spacing-row="letterSpacing">
                        <span class="accessibility-spacing-label">Jarak huruf</span>
                        <div class="accessibility-spacing-controls">
                            <button type="button" class="accessibility-control" data-spacing-change="-1" aria-label="Kurangi jarak huruf">−</button>
                            <output class="accessibility-spacing-value" aria-live="polite"></output>
                            <button type="button" class="accessibility-control" data-spacing-change="1" aria-label="Tambah jarak huruf">+</button>
                        </div>
                    </div>
                    <div class="accessibility-spacing-row" data-spacing-row="wordSpacing">
                        <span class="accessibility-spacing-label">Jarak kata</span>
                        <div class="accessibility-spacing-controls">
                            <button type="button" class="accessibility-control" data-spacing-change="-1" aria-label="Kurangi jarak kata">−</button>
                            <output class="accessibility-spacing-value" aria-live="polite"></output>
                            <button type="button" class="accessibility-control" data-spacing-change="1" aria-label="Tambah jarak kata">+</button>
                        </div>
                    </div>
                    <div class="accessibility-spacing-row" data-spacing-row="lineHeight">
                        <span class="accessibility-spacing-label">Jarak baris</span>
                        <div class="accessibility-spacing-controls">
                            <button type="button" class="accessibility-control" data-spacing-change="-1" aria-label="Kurangi jarak baris">−</button>
                            <output class="accessibility-spacing-value" aria-live="polite"></output>
                            <button type="button" class="accessibility-control" data-spacing-change="1" aria-label="Tambah jarak baris">+</button>
                        </div>
                    </div>
                </section>
                <section class="accessibility-section" aria-labelledby="accessibility-tts-title">
                    <h3 id="accessibility-tts-title" class="accessibility-section-title">Text-to-Speech</h3>
                    <p class="accessibility-tts-description">Bacakan konten utama halaman menggunakan suara browser.</p>
                    <div class="accessibility-tts-controls" role="group" aria-label="Kontrol Text-to-Speech">
                        <button type="button" class="accessibility-control" data-tts-action="play">Putar</button>
                        <button type="button" class="accessibility-control" data-tts-action="pause" disabled>Jeda/Lanjutkan</button>
                        <button type="button" class="accessibility-control" data-tts-action="stop" disabled>Berhenti</button>
                    </div>
                    <p class="accessibility-tts-status" data-tts-status aria-live="polite">Siap membaca.</p>
                </section>
                <section class="accessibility-section">
                    <button type="button" class="accessibility-reset" data-reset-all>Reset Semua Pengaturan</button>
                </section>
            </aside>
            <div class="accessibility-status" aria-live="polite" data-accessibility-status></div>
        `;
        document.body.appendChild(toolbar);
        return toolbar;
    }

    function init() {
        const toolbar = createToolbar();
        const toggle = toolbar.querySelector(".accessibility-button");
        const panel = toolbar.querySelector(".accessibility-panel");
        const close = toolbar.querySelector(".accessibility-close");
        const status = toolbar.querySelector("[data-accessibility-status]");
        const tts = createTextToSpeechController(toolbar);
        let settings = loadSettings();

        function announce(message) {
            status.textContent = "";
            window.setTimeout(() => { status.textContent = message; }, 20);
        }

        function updateView() {
            document.documentElement.dataset.accessibilityScale = String(settings.scale);
            document.body.classList.toggle("accessibility-high-contrast", settings.contrast === "high");
            document.body.classList.toggle(
                "accessibility-spacing-active",
                settings.letterSpacing > 0 || settings.wordSpacing > 0 || settings.lineHeight > 1.6
            );
            document.body.style.setProperty("--accessibility-letter-spacing", `${settings.letterSpacing}em`);
            document.body.style.setProperty("--accessibility-word-spacing", `${settings.wordSpacing}em`);
            document.body.style.setProperty("--accessibility-line-height", String(settings.lineHeight));
            document.body.style.letterSpacing = "var(--accessibility-letter-spacing)";
            document.body.style.wordSpacing = "var(--accessibility-word-spacing)";
            document.body.style.lineHeight = "var(--accessibility-line-height)";

            toolbar.querySelectorAll("[data-contrast]").forEach((button) => {
                button.setAttribute("aria-pressed", String(button.dataset.contrast === settings.contrast));
            });
            toolbar.querySelectorAll("[data-spacing-row]").forEach((row) => {
                const key = row.dataset.spacingRow;
                const value = settings[key];
                row.querySelector("output").textContent = key === "lineHeight" ? `${value}×` : `${value}em`;
            });
        }

        function setOpen(isOpen) {
            panel.classList.toggle("is-open", isOpen);
            panel.setAttribute("aria-hidden", String(!isOpen));
            toggle.setAttribute("aria-expanded", String(isOpen));
            if (isOpen) close.focus();
            else toggle.focus();
        }

        toggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
        close.addEventListener("click", () => setOpen(false));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
        });

        toolbar.addEventListener("click", (event) => {
            const target = event.target.closest("button");
            if (!target) return;
            if (target.hasAttribute("data-tts-action")) return;
            let shouldSave = true;

            if (target.dataset.scaleChange) {
                const current = scaleSteps.indexOf(settings.scale);
                const next = Math.max(0, Math.min(scaleSteps.length - 1, current + Number(target.dataset.scaleChange)));
                settings.scale = scaleSteps[next];
                announce(`Ukuran teks ${Math.round(settings.scale * 100)} persen.`);
            } else if (target.hasAttribute("data-reset-scale")) {
                settings.scale = defaults.scale;
                announce("Ukuran teks dikembalikan ke awal.");
            } else if (target.dataset.contrast) {
                settings.contrast = target.dataset.contrast;
                announce(`Mode kontras ${settings.contrast === "high" ? "tinggi" : "normal"} aktif.`);
            } else if (target.dataset.spacingChange) {
                const row = target.closest("[data-spacing-row]");
                const key = row.dataset.spacingRow;
                const steps = spacingSteps[key];
                const current = steps.indexOf(settings[key]);
                const next = Math.max(0, Math.min(steps.length - 1, current + Number(target.dataset.spacingChange)));
                settings[key] = steps[next];
                announce(`Pengaturan ${row.querySelector(".accessibility-spacing-label").textContent.toLowerCase()} diperbarui.`);
            } else if (target.hasAttribute("data-reset-all")) {
                settings = { ...defaults };
                shouldSave = false;
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (error) {
                    console.error("Preferensi aksesibilitas tidak dapat dihapus.", error);
                }
                announce("Semua pengaturan aksesibilitas telah direset.");
            }

            if (shouldSave) saveSettings(settings);
            updateView();
        });

        updateView();
        tts.updateAvailability();
    }

    function createTextToSpeechController(toolbar) {
        const controls = {
            play: toolbar.querySelector('[data-tts-action="play"]'),
            pause: toolbar.querySelector('[data-tts-action="pause"]'),
            stop: toolbar.querySelector('[data-tts-action="stop"]')
        };
        const status = toolbar.querySelector("[data-tts-status]");
        const speech = window.JalanKebaikanSpeech;
        const supported = Boolean(speech && speech.supported);
        let utterances = [];
        let currentIndex = 0;
        let isPaused = false;
        let selectedVoice = null;

        function setStatus(message) {
            status.textContent = message;
        }

        function updateControls(isReading) {
            controls.play.disabled = !supported || isReading;
            controls.pause.disabled = !supported || !isReading;
            controls.stop.disabled = !supported || !isReading;
            controls.pause.textContent = isPaused ? "Lanjutkan" : "Jeda";
        }

        function chooseVoice() {
            if (!supported) return null;
            selectedVoice = speech.chooseVoice();
            return selectedVoice;
        }

        function getMainText() {
            const main = document.querySelector("main");
            if (!main) return "";

            const content = main.cloneNode(true);
            content.querySelectorAll("nav, button, input, textarea, select, option, script, style, noscript, [aria-hidden='true']").forEach((element) => {
                element.remove();
            });

            const normalizedText = (content.textContent || "")
                .replace(/\s+/g, " ")
                .trim();
            if (!normalizedText) return "";

            const sentences = normalizedText
                .match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)
                .map((sentence) => sentence.trim())
                .filter(Boolean);
            const uniqueSentences = [];
            const seen = new Set();

            sentences.forEach((sentence) => {
                const normalized = sentence.toLocaleLowerCase("id-ID");
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    uniqueSentences.push(sentence);
                }
            });

            return uniqueSentences.join(" ");
        }

        function finish() {
            utterances = [];
            currentIndex = 0;
            isPaused = false;
            updateControls(false);
            setStatus("Selesai.");
        }

        function speakNext() {
            if (currentIndex >= utterances.length) {
                finish();
                return;
            }

            speech.speak(utterances[currentIndex], {
                owner: "accessibility",
                voice: selectedVoice,
                onend: () => {
                currentIndex += 1;
                speakNext();
                },
                oncancel: () => {
                    utterances = [];
                    currentIndex = 0;
                    isPaused = false;
                    updateControls(false);
                    setStatus("Pembacaan dihentikan oleh fitur lain.");
                },
                onerror: () => {
                    setStatus("Pembacaan tidak dapat dilanjutkan.");
                    updateControls(false);
                }
            });
        }

        function play() {
            if (!supported) return;
            const text = getMainText();
            if (!text) {
                setStatus("Konten utama tidak tersedia untuk dibacakan.");
                return;
            }

            speech.cancel();
            utterances = [];
            text.split(/\s+/).forEach((word) => {
                const current = utterances[utterances.length - 1] || "";
                if (current && `${current} ${word}`.length > 220) {
                    utterances.push(word);
                } else {
                    utterances[utterances.length - 1] = current ? `${current} ${word}` : word;
                }
            });
            currentIndex = 0;
            isPaused = false;
            chooseVoice();
            setStatus(selectedVoice ? "Sedang membaca." : "Sedang membaca dengan suara bawaan browser.");
            updateControls(true);
            speakNext();
        }

        function togglePause() {
            if (!supported || !utterances.length) return;
            if (window.speechSynthesis.paused) {
                speech.resume();
                isPaused = false;
                setStatus("Sedang membaca.");
            } else {
                speech.pause();
                isPaused = true;
                setStatus("Dijeda.");
            }
            updateControls(true);
        }

        function stop() {
            if (!supported) return;
            speech.cancel();
            utterances = [];
            currentIndex = 0;
            isPaused = false;
            updateControls(false);
            setStatus("Pembacaan dihentikan.");
        }

        function updateAvailability() {
            if (!supported) {
                setStatus("Text-to-Speech tidak didukung browser ini.");
                controls.play.disabled = true;
                controls.pause.disabled = true;
                controls.stop.disabled = true;
                return;
            }
            chooseVoice();
            if (!selectedVoice) {
                setStatus("Suara Indonesia tidak tersedia; suara bawaan browser akan digunakan.");
            }
        }

        controls.play.addEventListener("click", play);
        controls.pause.addEventListener("click", togglePause);
        controls.stop.addEventListener("click", stop);
        if (supported) window.speechSynthesis.addEventListener("voiceschanged", updateAvailability);
        window.addEventListener("pagehide", stop);
        window.addEventListener("beforeunload", stop);

        return { updateAvailability };
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
