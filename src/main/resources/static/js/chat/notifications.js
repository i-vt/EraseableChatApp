// static/js/chat/notifications.js
export function initNotifications() {
  const notificationSound = new Audio("/sounds/notification.mp3");
  notificationSound.volume = 0.7;

  const originalTitle = document.title;
  let titleFlickerInterval = null;
  let isFlickering = false;

  function startTitleFlicker() {
    if (isFlickering) return;
    isFlickering = true;
    let flip = true;
    titleFlickerInterval = setInterval(() => {
      document.title = flip ? "✨  New Message(s) ! ✨" : originalTitle;
      flip = !flip;
    }, 800);
  }

  function stopTitleFlicker() {
    if (titleFlickerInterval) {
      clearInterval(titleFlickerInterval);
      titleFlickerInterval = null;
    }
    isFlickering = false;
    document.title = originalTitle;
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) stopTitleFlicker();
  });

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }

  // Kept as global because your websocket handler calls it via window.*
  window.checkForMentions = function (sender, messageText, currentUser) {
    if (sender === currentUser) return;
    const mentionedCurrentUser = messageText.includes(`@${currentUser}`);
    const mentionedEveryone = messageText.includes("@everyone");
    const shouldNotify = mentionedCurrentUser || mentionedEveryone;

    if (document.hidden || shouldNotify) {
      notificationSound.play().catch(() => {});
      startTitleFlicker();
    }

    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden &&
      shouldNotify
    ) {
      const n = new Notification("New Mention in Chat", {
        body: `${sender}: ${messageText}`,
        icon: "/images/chat-icon.png",
      });
      setTimeout(() => n.close(), 5000);
    }
  };

  return { startTitleFlicker, stopTitleFlicker };
}
