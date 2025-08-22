// static/js/chat-main.js
import { connectAndSubscribe } from "./socket-handler.js";
import { setupFormSubmission, setupFileUpload, setupClipboard } from "./file-handler.js";
import { decryptAndRenderHistory } from "./chat/history.js";
import { initNotifications } from "./chat/notifications.js";
import { initMentionsByClick } from "./chat/mentions-click.js";
import { initEmojiPicker, loadEmojis } from "./chat/emoji-picker.js";
import { initSuggestions } from "./chat/suggestions.js";
import { getDomRefs } from "./chat/dom.js";
import { autoResizeTextarea } from "./chat/textarea-utils.js";
import { initMiscUi } from "./chat/misc-ui.js";
import { scrollToBottom } from "./ui-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const username  = window.chatConfig.username;
  const usernames = window.chatUsernames || [];

  const refs = getDomRefs(); // messageInput, chatForm, emojiToggleBtn, emojiPicker, uploadBtn, fileInput, messageArea

  // Notifications (permission + title flicker + window.checkForMentions)
  const notifyApi = initNotifications();

  // Click sender name to @mention
  initMentionsByClick(refs, notifyApi);

  // Connect sockets + file handlers
  await connectAndSubscribe(username);
  setupFormSubmission(username);
  setupFileUpload(username);
  setupClipboard(username);

  // Decrypt + render historical messages, then scroll
  await decryptAndRenderHistory();
  scrollToBottom();

  // Emoji picker
  const emojiList = await loadEmojis(refs);
  initEmojiPicker(refs, emojiList);

  // Suggestions for @mentions and :emoji:
  initSuggestions(refs, usernames, emojiList);

  // Upload button -> file input, textarea autoresize
  initMiscUi(refs);

  // First paint sizing
  if (refs.messageInput) queueMicrotask(() => autoResizeTextarea(refs.messageInput));
});
