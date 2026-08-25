self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {
    data = { body: event.data?.text() || "New notification" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Kisan Bazar", {
      body: data.body || "You have a new message",
      tag: data.tag || "kisan-bazar",
      data: { url: data.url || "/chat" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/chat"));
});