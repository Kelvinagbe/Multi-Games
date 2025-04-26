importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
    apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
    authDomain: "multi-games-a2561.firebaseapp.com",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com",
    projectId: "multi-games-a2561",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "150551898066",
    appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
    measurementId: "G-PB8Y87E6XV"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Optional icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});