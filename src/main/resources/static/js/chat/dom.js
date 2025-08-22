// static/js/chat/dom.js
export function getDomRefs() {
  /** @type {HTMLTextAreaElement|null} */
  const messageInput = document.getElementById("messageInput");
  return {
    messageInput,
    chatForm: document.getElementById("chatForm"),
    emojiToggleBtn: document.getElementById("emojiToggleBtn"),
    emojiPicker: document.getElementById("emojiPicker"),
    uploadBtn: document.getElementById("uploadBtn"),
    fileInput: document.getElementById("fileInput"),
    messageArea: document.getElementById("messageArea"),
  };
}
