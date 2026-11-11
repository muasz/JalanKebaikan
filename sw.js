/*
==========================================================
 Service Worker - Jalan Kebaikan
 Nama Cache : jalan-kebaikan-v10
==========================================================
*/


const CACHE_NAME = "jalan-kebaikan-v10";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/campaign.html",
    "/detail-campaign.html",
    "/formulir-donasi.html",

    "/css/style.css",
    "/js/main.js",
    "/css/assistant.css",
    "/js/assistant.js",
    "/js/speech-manager.js",
    "/js/hero-slider.js",
    "/js/navigation.js",
    "/js/program-filter.js",

    "/manifest.json",

    // Icons PWA
    "/icons/icon-192.png",
    "/icons/icon-512.png",

    // Images
    "/images/hero-illustration.svg",
    "/images/Header/Thumbnail-Untuk-Artikel-Website-7.jpg",
    "/images/Header/ver3.jpg",
    "/images/Header/versi-1.jpg",
    "/images/campaign1.jpg",
    "/images/campaign2.jpg",
    "/images/campaign3.jpg",
    "/images/campaign4.jpg",
    "/images/logo.png"
];

/*
==========================================================
 INSTALL
Menyimpan seluruh aset statis ke dalam cache
==========================================================
*/

self.addEventListener("install", (event) => {

    console.log("Service Worker: Install");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                console.log("Caching static assets...");

                return cache.addAll(STATIC_ASSETS);

            })

    );
    self.skipWaiting();

});


/*
==========================================================
 ACTIVATE
Menghapus cache lama apabila ada versi baru
==========================================================
*/

self.addEventListener("activate", (event) => {

    console.log("Service Worker: Activate");

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames.map((cache) => {

                    if (cache !== CACHE_NAME) {

                        console.log("Deleting old cache:", cache);

                        return caches.delete(cache);

                    }

                })

            );

        })

    );

    self.clients.claim();

});


/*
==========================================================
 FETCH
Menangani seluruh request
==========================================================
*/

self.addEventListener("fetch", (event) => {

    const request = event.request;

    const url = new URL(request.url);

    /*
    ======================================================
    NETWORK FIRST
    Digunakan untuk API atau URL eksternal
    ======================================================
    */

    if (url.origin !== location.origin) {

        event.respondWith(

            fetch(request)

                .then((networkResponse) => {

                    return networkResponse;

                })

                .catch(() => {

                    return caches.match(request);

                })

        );

        return;

    }

    /*
    ======================================================
    CACHE FIRST
    Digunakan untuk aset statis
    ======================================================
    */

    event.respondWith(

        caches.match(request)

            .then((cachedResponse) => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(request)

                    .then((networkResponse) => {

                        return caches.open(CACHE_NAME)

                            .then((cache) => {

                                cache.put(request, networkResponse.clone());

                                return networkResponse;

                            });

                    });

            })

    );

});