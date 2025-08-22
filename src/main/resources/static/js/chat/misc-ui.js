// static/js/chat/misc-ui.js
import { autoResizeTextarea } from "./textarea-utils.js";

export function initMiscUi(refs) {
  const { uploadBtn, fileInput, messageInput } = refs;

  // Upload button opens hidden file input
  uploadBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput?.click();
  });

  if (messageInput) {
    messageInput.addEventListener("input", () => autoResizeTextarea(messageInput));
  }
}
