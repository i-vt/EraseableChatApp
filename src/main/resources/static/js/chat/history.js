// static/js/chat/history.js
import { getSharedKey, decryptMessage } from "../crypto-utils.js";
import { renderMessage } from "../ui-utils.js";

export async function decryptAndRenderHistory() {
  const key = await getSharedKey();
  const persistedMessages = document.querySelectorAll("#messageArea li");
  for (const li of persistedMessages) {
    const { sender = "unknown", iv, content, timestamp } = li.dataset;
    try {
      const bytes = await decryptMessage(key, iv, content);
      renderMessage(li, sender, "text", timestamp, bytes);
    } catch (e) {
      console.error(`Failed to decrypt message from ${sender}:`, e);
      renderMessage(
        li,
        sender,
        "text",
        timestamp,
        new TextEncoder().encode("[decryption failed]")
      );
    }
  }
}
