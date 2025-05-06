// Simple service worker for a static HTML/CSS site
const CACHE_NAME = 'multi-games-cache-v1';
const assetsToCache = [
  './',
  './index.html',
  './styles.css',
  // Add any other CSS files your site uses
  './icon-192.png',
  './icon-512.png',
  // Add any image files your site uses
  './manifest.json',
  './darkmode.js',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './style.css',
  './assets/og-image.jpg',
  './assets/favicon-32x32.png',
  './assets/icon-192.png',
  './assets/favicon-16x16.png',
  './assets/favicon.ico',
  './auth/login.html',
  './auth/profile.html',
  './auth/script.js',
  './auth/styles.css',
  './auth/login/login.html',
  './auth/login/script.js',
  './auth/login/styles.css',
  './auth/login/signup/script.js',
  './auth/login/signup/signup.html',
  './auth/login/signup/styles.css',
  './auth/login/signup/password-reset/pass-reset',
  './auth/pass-rest/passreset.html',
  './auth/pass-rest/script.js',
  './auth/pass-rest/styles.css',
  './auth/passreset/passreset.html',
  './auth/passreset/script.js',
  './auth/passreset/styles.css',
  './games/iframe-ORV-Racing.html',
  './games/iframe-bike-rush.html',
  './games/iframe-boat-race.html',
  './games/iframe-bubble.html',
  './games/iframe-eggadventure.html',
  './games/iframe-hunter.html',
  './games/iframe-ludo-legend.html',
  './games/iframe-marksman.html',
  './games/iframe-moto-X3M.html',
  './games/iframe-musicball.html',
  './games/iframe-pianotiles.html',
  './games/iframe-pixel.html',
  './games/iframe-pubg.html',
  './games/iframe-racesimulator-1.html',
  './games/iframe-runaway.html',
  './games/iframe-snipersimulator.html',
  './games/iframe-squad-survival.html',
  './games/iframe-squidsurvival.html',
  './games/iframe-subway-surfers-holiday.html',
  './games/iframe-subway.html',
  './games/iframe-warrior.html',
  './games/iframe-wildhunt.html',
  './games/subway.html',
  './games/ticgame.html',
  './games/ticneon.html',
  './games/truth.html',
  './games/whack.html',
  './nav/Airtime-earn.html',
  './nav/profile.html',
  './nav/script.js',
  './nav/styles.css',
  './nav/categories/action.html',
  './nav/categories/adventure.html',
  './nav/categories/arcade.html',
  './nav/categories/categories.html',
  './nav/categories/music.html',
  './nav/categories/puzzle.html',
  './nav/categories/racing.html',
  './nav/categories/shooter.html',
  './nav/categories/sports.html',
  './nav/games/played.html',
  './nav/withdraw/script.js',
  './nav/withdraw/styles.css',
  './nav/withdraw/withdraw.html',
  './assets/image/subway.jpg',
  './assets/image/pixe-shooter.jpg',

];

// Install event - cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(assetsToCache);
      })
  );
});

// Activate event - removed the cache cleaning functionality
self.addEventListener('activate', event => {
  // No cache deletion functionality here anymore
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Try network and cache the result
        return fetch(fetchRequest)
          .then(response => {
            // Check for valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // Return a fallback page or image if available
            // For now, just fail gracefully
            return new Response('Network error occurred');
          });
      })
  );
});