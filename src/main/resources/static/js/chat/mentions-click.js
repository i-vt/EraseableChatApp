// static/js/chat/mentions-click.js
import { insertAtCursor, autoResizeTextarea } from "./textarea-utils.js";

export function initMentionsByClick(refs /*, notifyApi */) {
  const { messageArea, messageInput } = refs;

  messageArea?.addEventListener("click", (e) => {
    const senderEl = e.target.closest(".message-sender");
    if (!senderEl || !senderEl.textContent || !messageInput) return;

    const senderName = senderEl.textContent.trim();
    const nameToAdd  = senderName.startsWith("@") ? senderName : `@${senderName}`;
    if (!messageInput.value.includes(nameToAdd)) {
      insertAtCursor(messageInput, `${nameToAdd} `);
      messageInput.focus();
      autoResizeTextarea(messageInput);
    }
  });
}
