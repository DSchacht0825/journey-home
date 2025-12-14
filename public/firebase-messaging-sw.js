// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyD2uWwuPrqv0o8YTyGxIlWEicI9y0lSkec",
  authDomain: "journey-home-aeb8f.firebaseapp.com",
  projectId: "journey-home-aeb8f",
  storageBucket: "journey-home-aeb8f.firebasestorage.app",
  messagingSenderId: "185092223688",
  appId: "1:185092223688:web:c48bb9efbf87356f422bfd",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Journey Home";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/Journey-Home_White_Simple.png",
    badge: "/Journey-Home_White_Simple.png",
    tag: payload.data?.tag || "journey-home-notification",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  // Navigate to the app when notification is clicked
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
