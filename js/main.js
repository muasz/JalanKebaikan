/*
==========================================================
Jalan Kebaikan
Main JavaScript
==========================================================
*/

/* ==========================================================
   REGISTRASI SERVICE WORKER
========================================================== */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registration = await navigator.serviceWorker.register("sw.js");

            console.log("✅ Service Worker berhasil didaftarkan.");
            console.log("Scope:", registration.scope);

        } catch (error) {

            console.error("❌ Gagal mendaftarkan Service Worker.");
            console.error(error);

        }

    });

}

/* ==========================================================
   PWA INSTALL
========================================================== */

let deferredPrompt = null;

// Tombol install (pastikan ada pada HTML)
const installButton = document.getElementById("installButton");

/*
==========================================================
Tangkap event sebelum browser menampilkan popup install
==========================================================
*/

window.addEventListener("beforeinstallprompt", (event) => {

    console.log("beforeinstallprompt terpicu");

    // Mencegah browser langsung menampilkan popup
    event.preventDefault();

    // Simpan event agar dapat dipanggil nanti
    deferredPrompt = event;

    // Tampilkan tombol install jika tersedia
    if (installButton) {

        installButton.classList.remove("hidden");

    }

});

/*
==========================================================
Klik tombol Install
==========================================================
*/

if (installButton) {

    installButton.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        // Tampilkan dialog install
        deferredPrompt.prompt();

        // Tunggu pilihan pengguna
        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {

            console.log("✅ Pengguna menginstal aplikasi.");

        } else {

            console.log("ℹ️ Pengguna membatalkan instalasi.");

        }

        // Hapus event setelah digunakan
        deferredPrompt = null;

        // Sembunyikan tombol install
        installButton.classList.add("hidden");

    });

}

/* ==========================================================
   EVENT SAAT APLIKASI BERHASIL DIINSTALL
========================================================== */

window.addEventListener("appinstalled", () => {

    console.log("🎉 Jalan Kebaikan berhasil diinstal.");

    if (installButton) {

        installButton.classList.add("hidden");

    }

});

/* ==========================================================
   CONTOH INTERAKSI TOMBOL BANTU SEKARANG
========================================================== */

const donateButtons = document.querySelectorAll(".btn-donate");

donateButtons.forEach((button) => {

    button.addEventListener("click", () => {

        window.location.href = "formulir-donasi.html";

    });

});

/* ==========================================================
   CONTOH PENCARIAN CAMPAIGN
========================================================== */

const searchInput = document.getElementById("searchCampaign");

if (searchInput) {

    searchInput.addEventListener("input", () => {

        console.log("Cari Campaign:", searchInput.value);

        // Nanti bisa diganti dengan filter data campaign

    });

}