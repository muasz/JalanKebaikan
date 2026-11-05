(() => {
    "use strict";

    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let active = null;
    let sequence = 0;

    function chooseVoice() {
        if (!supported) return null;
        const voices = window.speechSynthesis.getVoices();
        return voices.find((voice) => voice.lang.toLowerCase() === "id-id")
            || voices.find((voice) => voice.lang.toLowerCase().startsWith("id"))
            || null;
    }

    function cancel() {
        if (active && typeof active.oncancel === "function") {
            active.oncancel();
        }
        active = null;
        sequence += 1;
        if (supported) window.speechSynthesis.cancel();
    }

    function speak(text, options = {}) {
        if (!supported) return null;

        cancel();
        const token = ++sequence;
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = options.voice || chooseVoice();
        utterance.lang = "id-ID";
        if (voice) utterance.voice = voice;

        active = {
            owner: options.owner || "unknown",
            token,
            oncancel: options.oncancel
        };

        const isCurrent = () => active && active.token === token;
        utterance.onstart = () => {
            if (isCurrent() && options.onstart) options.onstart();
        };
        utterance.onend = () => {
            if (!isCurrent()) return;
            active = null;
            if (options.onend) options.onend();
        };
        utterance.onerror = (event) => {
            if (!isCurrent()) return;
            active = null;
            if (options.onerror && event.error !== "canceled" && event.error !== "interrupted") {
                options.onerror(event);
            }
        };

        window.speechSynthesis.speak(utterance);
        return token;
    }

    function isOwner(owner) {
        return Boolean(active && active.owner === owner);
    }

    function pause() {
        if (supported) window.speechSynthesis.pause();
    }

    function resume() {
        if (supported) window.speechSynthesis.resume();
    }

    window.JalanKebaikanSpeech = {
        supported,
        chooseVoice,
        speak,
        cancel,
        pause,
        resume,
        isOwner
    };

    window.addEventListener("pagehide", cancel);
    window.addEventListener("beforeunload", cancel);
})();
