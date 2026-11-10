(function () {
    "use strict";

    function createAssistant() {
        const widget = document.createElement("div");
        widget.className = "assistant-widget";
        widget.innerHTML = `
            <button type="button" class="assistant-launcher" aria-label="Buka Asisten Jalan Kebaikan" aria-expanded="false" aria-controls="assistant-window">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.1A7.5 7.5 0 1 1 20 11.5Z"></path>
                    <path d="M8 11h.01M12 11h.01M16 11h.01"></path>
                </svg>
            </button>
            <section id="assistant-window" class="assistant-window" role="dialog" aria-modal="false" aria-labelledby="assistant-title" aria-hidden="true">
                <header class="assistant-header">
                    <span class="assistant-avatar" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="8"></circle>
                            <path d="M8.5 14.5c2 1.5 5 1.5 7 0M9 10h.01M15 10h.01"></path>
                        </svg>
                    </span>
                    <div class="assistant-heading">
                        <h2 id="assistant-title" class="assistant-title">Asisten Jalan Kebaikan</h2>
                        <span class="assistant-status" data-assistant-status aria-live="polite">Siap membantu</span>
                    </div>
                    <button type="button" class="assistant-voice-toggle" aria-label="Aktifkan feedback suara" aria-pressed="false" title="Aktifkan feedback suara">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M11 5 6 9H3v6h3l5 4V5Z"></path>
                            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path>
                        </svg>
                    </button>
                    <button type="button" class="assistant-close" aria-label="Tutup Asisten Jalan Kebaikan">×</button>
                </header>
                <div class="assistant-messages" data-assistant-messages aria-live="polite">
                    <div class="assistant-message assistant-message--assistant">
                        <p>Halo! Saya Asisten Jalan Kebaikan. Saya siap membantu Anda menggunakan website ini. Ada yang bisa saya bantu?</p>
                    </div>
                </div>
                <div class="assistant-suggestions" role="group" aria-label="Saran bantuan cepat">
                    <button type="button" class="assistant-suggestion" data-assistant-suggestion="Perbesar tulisan">Perbesar tulisan</button>
                    <button type="button" class="assistant-suggestion" data-assistant-suggestion="Aktifkan kontras tinggi">Aktifkan kontras tinggi</button>
                    <button type="button" class="assistant-suggestion" data-assistant-suggestion="Atur jarak teks">Atur jarak teks</button>
                    <button type="button" class="assistant-suggestion" data-assistant-suggestion="Bantuan berdonasi">Bantuan berdonasi</button>
                </div>
                <form class="assistant-composer" data-assistant-form>
                    <input class="assistant-input" type="text" placeholder="Ketik pesan Anda..." aria-label="Pesan untuk Asisten Jalan Kebaikan" autocomplete="off">
                    <button type="button" class="assistant-icon-button assistant-microphone" aria-label="Mulai input suara" title="Mulai input suara">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                            <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"></path>
                        </svg>
                    </button>
                    <button type="submit" class="assistant-icon-button" aria-label="Kirim pesan">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="m22 2-7 20-4-9-9-4Z"></path>
                            <path d="M22 2 11 13"></path>
                        </svg>
                    </button>
                </form>
            </section>
        `;
        document.body.appendChild(widget);
        return widget;
    }

    function init() {
        const widget = createAssistant();
        const launcher = widget.querySelector(".assistant-launcher");
        const windowElement = widget.querySelector(".assistant-window");
        const close = widget.querySelector(".assistant-close");
        const messages = widget.querySelector("[data-assistant-messages]");
        const form = widget.querySelector("[data-assistant-form]");
        const input = widget.querySelector(".assistant-input");
        const microphone = widget.querySelector(".assistant-microphone");
        const voiceToggle = widget.querySelector(".assistant-voice-toggle");
        const assistantStatus = widget.querySelector("[data-assistant-status]");
        const suggestions = widget.querySelectorAll("[data-assistant-suggestion]");
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = SpeechRecognition ? new SpeechRecognition() : null;
        let isListening = false;
        let pendingTopic = "";
        let conversationHistory = [];
        let isSending = false;
        const speech = window.JalanKebaikanSpeech;
        const speechSupported = Boolean(speech && speech.supported);
        let voiceFeedbackEnabled = speechSupported && window.localStorage.getItem("jalan-kebaikan-assistant-voice") !== "off";
        let selectedVoice = null;
        let welcomeSpoken = false;

        const responses = {
            "Perbesar tulisan": "Tentu, saya bisa membantu Anda memperbesar ukuran tulisan agar lebih mudah dibaca.",
            "Aktifkan kontras tinggi": "Silakan buka Pengaturan Aksesibilitas, lalu pilih Kontras Tinggi agar teks dan latar lebih mudah dibedakan.",
            "Atur jarak teks": "Anda dapat mengatur jarak huruf, jarak kata, dan jarak baris melalui Pengaturan Aksesibilitas.",
            "Bantuan berdonasi": "Berikut lokasi program donasi yang tersedia. Pilih salah satu program untuk melihat detail dan melanjutkan donasi."
        };

        function normalizeCommand(text) {
            return text
                .toLocaleLowerCase("id-ID")
                .replace(/[.,!?]/g, "")
                .trim();
        }

        function chooseVoice() {
            if (!speechSupported) return null;
            selectedVoice = speech.chooseVoice();
            return selectedVoice;
        }

        function updateVoiceToggle() {
            const label = voiceFeedbackEnabled ? "Matikan feedback suara" : "Aktifkan feedback suara";
            voiceToggle.setAttribute("aria-label", label);
            voiceToggle.setAttribute("title", label);
            voiceToggle.setAttribute("aria-pressed", String(voiceFeedbackEnabled));
            voiceToggle.classList.toggle("is-active", voiceFeedbackEnabled);
        }

        function speakAssistantMessage(text) {
            if (!voiceFeedbackEnabled || !speechSupported) return;
            speech.speak(text, {
                owner: "assistant",
                voice: chooseVoice(),
                onstart: () => setListeningStatus("Sedang memberi feedback suara..."),
                onend: () => setListeningStatus("Siap membantu"),
                oncancel: () => setListeningStatus("Feedback suara dihentikan oleh fitur lain."),
                onerror: () => setListeningStatus("Feedback suara tidak dapat diputar.")
            });
        }

        function activateAccessibilityControl(selector) {
            const control = document.querySelector(selector);
            if (!control) return false;
            control.click();
            return true;
        }

        function matchesAny(command, patterns) {
            return patterns.some((pattern) => pattern.test(command));
        }

        function getSpacingValue(key) {
            const output = document.querySelector(`[data-spacing-row='${key}'] output`);
            return output ? output.textContent.trim() : "";
        }

        function changeSpacing(command, key, label) {
            const increase = matchesAny(command, [
                /(?:tambah|tambahkan|perbesar|perlebar|renggangkan|naikkan)/
            ]);
            const decrease = matchesAny(command, [
                /(?:kurangi|kurangilah|perkecil|kecilkan|turunkan|rapatkan)/
            ]);

            if (!increase && !decrease) {
                const currentValue = getSpacingValue(key);
                return `Jarak ${label} saat ini ${currentValue || "belum tersedia"}. Mau ditambah atau dikurangi?`;
            }

            const direction = decrease ? "-1" : "1";
            const selector = `[data-spacing-row='${key}'] [data-spacing-change='${direction}']`;

            if (!activateAccessibilityControl(selector)) {
                return "Pengaturan jarak teks belum tersedia di halaman ini.";
            }

            const currentValue = getSpacingValue(key);
            return `Jarak ${label} sudah ${direction === "1" ? "ditambah" : "dikurangi"} menjadi ${currentValue}.`;
        }

        function applyAccessibilityCommand(text) {
            const command = normalizeCommand(text);

            if (matchesAny(command, [
                /^(reset|kembalikan|pulihkan)$/,
                /(?:reset|kembalikan|pulihkan).*(?:semua|pengaturan|tampilan)/,
                /mulai kembali dari awal/
            ])) {
                return activateAccessibilityControl("[data-reset-all]")
                    ? "Semua pengaturan aksesibilitas sudah direset."
                    : "Tombol reset belum tersedia di halaman ini.";
            }

            if (matchesAny(command, [
                /(?:perbesar|besarkan|tingkatkan|naikkan).*(?:tulisan|teks|huruf)/,
                /(?:tulisan|teks|huruf).*(?:terlalu kecil|sangat kecil|susah dibaca|sulit dibaca)/,
                /saya (?:susah|sulit) membaca/
            ])) {
                return activateAccessibilityControl("[data-scale-change='1']")
                    ? "Ukuran tulisan sudah diperbesar."
                    : "Pengaturan ukuran tulisan belum tersedia di halaman ini.";
            }

            if (matchesAny(command, [
                /(?:perkecil|kecilkan|turunkan|kurangi).*(?:tulisan|teks|huruf)/,
                /(?:tulisan|teks|huruf).*(?:terlalu besar|kebesaran)/
            ])) {
                return activateAccessibilityControl("[data-scale-change='-1']")
                    ? "Ukuran tulisan sudah diperkecil."
                    : "Pengaturan ukuran tulisan belum tersedia di halaman ini.";
            }

            if (matchesAny(command, [
                /kontras.*(?:tinggi|lebih jelas|lebih terang)/,
                /(?:susah|sulit).*membedakan.*(?:teks|warna)/
            ])) {
                return activateAccessibilityControl("[data-contrast='high']")
                    ? "Kontras tinggi sudah diaktifkan."
                    : "Pengaturan kontras belum tersedia di halaman ini.";
            }

            if (matchesAny(command, [
                /kontras.*(?:normal|biasa|mati)/,
                /kembali.*(?:warna|tampilan).*normal/
            ])) {
                return activateAccessibilityControl("[data-contrast='normal']")
                    ? "Mode kontras normal sudah diaktifkan."
                    : "Pengaturan kontras belum tersedia di halaman ini.";
            }

            if (matchesAny(command, [
                /(?:jarak|spasi).*(?:huruf|antar huruf|letter)/,
                /huruf.*(?:lebih renggang|lebih lebar)/
            ])) {
                return changeSpacing(command, "letterSpacing", "huruf");
            }

            if (matchesAny(command, [
                /(?:jarak|spasi).*(?:kata|antar kata|word)/,
                /kata.*(?:lebih renggang|lebih lebar)/
            ])) {
                return changeSpacing(command, "wordSpacing", "kata");
            }

            if (matchesAny(command, [
                /(?:jarak|spasi).*(?:baris|tinggi baris|line)/,
                /baris.*(?:lebih renggang|lebih lebar)/
            ])) {
                return changeSpacing(command, "lineHeight", "baris");
            }

            return "";
        }

        function scrollMessages() {
            messages.scrollTop = messages.scrollHeight;
        }

        function addMessage(text, type) {
            const message = document.createElement("div");
            message.className = `assistant-message assistant-message--${type}`;
            const paragraph = document.createElement("p");
            paragraph.textContent = text;
            message.appendChild(paragraph);
            messages.appendChild(message);
            scrollMessages();
            if (type === "assistant") {
                speakAssistantMessage(text);
            }
        }

        function showDonationPrograms() {
            const programSection = document.querySelector("#program");

            if (programSection) {
                programSection.scrollIntoView({ behavior: "smooth", block: "start" });
                programSection.setAttribute("tabindex", "-1");
                window.setTimeout(() => programSection.focus({ preventScroll: true }), 400);
                return {
                    label: "Lihat program donasi",
                    href: "#program"
                };
            }

            return {
                label: "Buka halaman program",
                href: "campaign.html"
            };
        }

        function showAccessibilitySettings() {
                const toggle = document.querySelector(".accessibility-button");
                if (!toggle) {
                    return {
                        label: "Pengaturan belum tersedia",
                        href: "#"
                    };
                }
                toggle.click();
                return null;
            }

            function getConversationReply(text, fallbackResponse) {
                const command = normalizeCommand(text);

                if (pendingTopic === "donation" && /^(iya|ya|boleh|mau|lanjut)$/.test(command)) {
                    pendingTopic = "";
                    return {
                        text: "Baik. Saya tampilkan program donasi yang tersedia untuk Anda.",
                        action: showDonationPrograms()
                    };
                }

                if (/^(halo|hai|hi|selamat pagi|selamat siang|selamat sore|selamat malam)$/.test(command)) {
                    return {
                        text: "Halo! Saya siap membantu Anda menggunakan Jalan Kebaikan. Anda ingin mengatur tampilan, mencari program donasi, atau mengetahui cara berdonasi?"
                    };
                }

                if (command.includes("siapa kamu") || command.includes("kamu bisa apa") || command.includes("bisa bantu apa")) {
                    return {
                        text: "Saya Asisten Jalan Kebaikan. Saya bisa membantu mengatur ukuran tulisan, kontras, jarak teks, menemukan program donasi, dan menjelaskan langkah berdonasi."
                    };
                }

                if (
                    command.includes("pengaturan aksesibilitas")
                    || command.includes("buka pengaturan")
                    || command.includes("aksesibilitas")
                ) {
                    const action = showAccessibilitySettings();
                    return {
                        text: action
                            ? "Panel Pengaturan Aksesibilitas belum tersedia di halaman ini."
                            : "Panel Pengaturan Aksesibilitas sudah saya buka. Anda dapat memilih ukuran tulisan, kontras, atau jarak teks."
                    };
                }

                if (matchesAny(command, [
                    /(?:atur|ubah|sesuaikan|tambah|kurangi).*(?:jarak|spasi)/,
                    /(?:jarak|spasi).*(?:teks|tulisan)/
                ])) {
                    return {
                            text: "Jarak teks terdiri dari jarak huruf, jarak kata, dan jarak baris. Mana yang ingin Anda ubah?"
                    };
                }

                if (
                    command.includes("cara donasi")
                    || command.includes("bagaimana donasi")
                    || command.includes("ingin berdonasi")
                    || command.includes("mau berdonasi")
                ) {
                    pendingTopic = "donation";
                    return {
                        text: "Tentu. Anda dapat memilih program, membuka detail program, lalu menekan tombol Mulai Donasi. Apakah saya tampilkan daftar programnya?",
                        action: {
                            label: "Tampilkan program donasi",
                            href: "#program"
                        }
                    };
                }

                if (command.includes("donasi")) {
                    return {
                        text: fallbackResponse || "Berikut program donasi yang tersedia. Pilih salah satu program untuk melihat detail dan melanjutkan donasi.",
                        action: showDonationPrograms()
                    };
                }

                if (command.includes("program") || command.includes("campaign")) {
                    return {
                        text: "Saat ini tersedia program pendidikan, kemanusiaan, dan ekonomi. Saya arahkan Anda ke daftar program agar bisa memilih yang paling sesuai.",
                        action: showDonationPrograms()
                    };
                }

                if (command.includes("bayar") || command.includes("metode pembayaran") || command.includes("transfer")) {
                    return {
                        text: "Untuk melanjutkan pembayaran, pilih program terlebih dahulu lalu buka detailnya. Di halaman detail tersedia tombol Mulai Donasi dan informasi pembayaran."
                    };
                }

                return {
                    text: fallbackResponse || "Saya belum memahami permintaan itu. Anda bisa bertanya tentang program donasi, cara berdonasi, ukuran tulisan, kontras, atau jarak teks."
                };
            }

        function addActionMessage(text, action) {
            const message = document.createElement("div");
            message.className = "assistant-message assistant-message--assistant";

            const paragraph = document.createElement("p");
            paragraph.textContent = text;
            message.appendChild(paragraph);

            const link = document.createElement("a");
            link.className = "assistant-action-link";
            link.href = action.href;
            link.textContent = action.label;
            link.addEventListener("click", () => {
                if (action.href === "#program") {
                    showDonationPrograms();
                }
            });
            message.appendChild(link);
            messages.appendChild(message);
            scrollMessages();
            speakAssistantMessage(text);
        }

        function recordConversation(role, content) {
            const cleanContent = String(content || "").trim();
            if (!cleanContent) return;

            conversationHistory.push({ role, content: cleanContent });
            conversationHistory = conversationHistory.slice(-10);
        }

        async function getGeminiReply(message) {
            const response = await fetch("api/chat.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    message,
                    history: conversationHistory.slice(-10)
                })
            });

            let result;
            try {
                result = await response.json();
            } catch (error) {
                throw new Error("Respons API bukan JSON yang valid.");
            }

            if (!response.ok || !result || result.success !== true) {
                throw new Error(result?.message || `API mengembalikan HTTP ${response.status}.`);
            }

            const reply = typeof result.reply === "string" ? result.reply.trim() : "";
            if (!reply) {
                throw new Error("Respons Gemini kosong.");
            }

            recordConversation("user", message);
            recordConversation("model", reply);
            return reply;
        }

        function getNavigationAction(text) {
            const command = normalizeCommand(text);
            if (command.includes("donasi") || command.includes("program") || command.includes("campaign")) {
                return showDonationPrograms();
            }
            return null;
        }

        async function sendMessage(text, response) {
            const cleanText = text.trim();
            if (!cleanText || isSending) return;

            isSending = true;
            addMessage(cleanText, "user");

            const submitButton = form.querySelector("[type='submit']");
            if (submitButton) submitButton.disabled = true;
            setListeningStatus("Sedang memproses...");

            try {
                const actionResponse = applyAccessibilityCommand(cleanText);

                if (actionResponse) {
                    recordConversation("user", cleanText);
                    recordConversation("model", actionResponse);
                    addMessage(actionResponse, "assistant");
                    return;
                }

                const reply = await getGeminiReply(cleanText);
                const action = getNavigationAction(cleanText);

                if (action) {
                    addActionMessage(reply, action);
                } else {
                    addMessage(reply, "assistant");
                }
            } catch (error) {
                console.error("Gemini API Error:", error);
                addMessage(
                    "Maaf, asisten sedang tidak dapat terhubung. Periksa koneksi atau coba lagi sebentar.",
                    "assistant"
                );
            } finally {
                isSending = false;
                if (submitButton) submitButton.disabled = false;
                if (assistantStatus.textContent === "Sedang memproses...") {
                    setListeningStatus("Siap membantu");
                }
            }
        }

        function setListeningStatus(message) {
            assistantStatus.textContent = message;
        }

        function stopListening() {
            if (!recognition || !isListening) return;
            recognition.stop();
        }

        function startListening(allowRetry) {
            if (!recognition) return;
            if (isListening) {
                stopListening();
                return;
            }

            try {
                recognition.start();
            } catch (error) {
                if (error.name === "InvalidStateError" && allowRetry) {
                    recognition.abort();
                    window.setTimeout(() => startListening(false), 100);
                    return;
                }
                setListeningStatus("Mikrofon sedang digunakan. Coba lagi.");
                console.error("Input suara tidak dapat dimulai.", error);
            }
        }

        function setOpen(isOpen) {
            windowElement.classList.toggle("is-open", isOpen);
            windowElement.setAttribute("aria-hidden", String(!isOpen));
            launcher.setAttribute("aria-expanded", String(isOpen));
            if (isOpen) {
                input.focus();
                if (!welcomeSpoken && voiceFeedbackEnabled) {
                    welcomeSpoken = true;
                    window.setTimeout(() => {
                        speakAssistantMessage("Halo! Saya Asisten Jalan Kebaikan. Saya siap membantu Anda menggunakan website ini. Ada yang bisa saya bantu?");
                    }, 150);
                }
            }
            else launcher.focus();
        }

        launcher.addEventListener("click", () => setOpen(!windowElement.classList.contains("is-open")));
        voiceToggle.addEventListener("click", () => {
            if (!speechSupported) return;
            voiceFeedbackEnabled = !voiceFeedbackEnabled;
            window.localStorage.setItem("jalan-kebaikan-assistant-voice", voiceFeedbackEnabled ? "on" : "off");
            if (!voiceFeedbackEnabled) {
                speech.cancel();
                setListeningStatus("Feedback suara dimatikan");
            } else {
                chooseVoice();
                setListeningStatus(selectedVoice ? "Feedback suara aktif" : "Feedback suara aktif dengan suara default");
            }
            updateVoiceToggle();
        });
        close.addEventListener("click", () => {
            stopListening();
            setOpen(false);
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const text = input.value;
            input.value = "";
            sendMessage(text);
        });
        suggestions.forEach((suggestion) => {
            suggestion.addEventListener("click", () => {
                const text = suggestion.dataset.assistantSuggestion;
                sendMessage(text, responses[text]);
            });
        });
        if (recognition) {
            recognition.lang = "id-ID";
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.addEventListener("start", () => {
                isListening = true;
                microphone.setAttribute("aria-label", "Hentikan input suara");
                microphone.setAttribute("aria-pressed", "true");
                microphone.classList.add("is-listening");
                setListeningStatus("Mendengarkan...");
            });
            recognition.addEventListener("result", (event) => {
                const transcript = Array.from(event.results)
                    .map((result) => result[0].transcript)
                    .join(" ")
                    .trim();
                if (transcript) {
                    input.value = transcript;
                    input.focus();
                    setListeningStatus("Teks suara siap dikirim.");
                }
            });
            recognition.addEventListener("error", (event) => {
                const messages = {
                    "not-allowed": "Izin mikrofon ditolak. Izinkan mikrofon di browser.",
                    "no-speech": "Suara tidak terdeteksi. Silakan coba lagi.",
                    "audio-capture": "Mikrofon tidak ditemukan atau sedang digunakan."
                };
                setListeningStatus(messages[event.error] || "Input suara tidak dapat digunakan.");
            });
            recognition.addEventListener("end", () => {
                isListening = false;
                microphone.setAttribute("aria-label", "Mulai input suara");
                microphone.setAttribute("aria-pressed", "false");
                microphone.classList.remove("is-listening");
                if (assistantStatus.textContent === "Mendengarkan...") {
                    setListeningStatus("Siap membantu");
                }
            });
            microphone.addEventListener("click", () => startListening(true));
        } else {
            microphone.disabled = true;
            microphone.setAttribute("aria-label", "Input suara tidak didukung browser ini");
            microphone.title = "Input suara tidak didukung browser ini";
        }
        if (!speechSupported) {
            voiceToggle.disabled = true;
            voiceToggle.setAttribute("aria-label", "Feedback suara tidak didukung browser ini");
            voiceToggle.title = "Feedback suara tidak didukung browser ini";
        } else {
            chooseVoice();
            updateVoiceToggle();
            window.speechSynthesis.addEventListener("voiceschanged", chooseVoice);
        }
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && windowElement.classList.contains("is-open")) {
                stopListening();
                setOpen(false);
            }
        });
        window.addEventListener("pagehide", stopListening);
        window.addEventListener("beforeunload", stopListening);
        window.addEventListener("pagehide", () => {
            if (speechSupported) speech.cancel();
        });
        window.addEventListener("beforeunload", () => {
            if (speechSupported) speech.cancel();
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
