// static/js/chat/emoji-picker.js
import { insertAtCursor, autoResizeTextarea } from "../chat/textarea-utils.js";

export async function loadEmojis(refs) {
  try {
    const res = await fetch("/api/emojis");
    const list = await res.json();
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error("Failed to load emojis:", e);
    return [];
  }
}

export function initEmojiPicker(refs, emojiList) {
  const { emojiToggleBtn, emojiPicker, messageInput } = refs;

  // Guard for markup issues
  if (!emojiToggleBtn || !emojiPicker) return;

  // Basic a11y hints (safe no-ops if attributes already set)
  emojiToggleBtn.setAttribute("aria-haspopup", "dialog");
  emojiToggleBtn.setAttribute("aria-expanded", "false");
  emojiPicker.setAttribute("role", "dialog");

  // Helper to open/close the picker
  function setPickerVisible(visible) {
    emojiPicker.style.display = visible ? "flex" : "none";
    emojiToggleBtn.setAttribute("aria-expanded", String(visible));
  }
  function togglePicker() {
    const isHidden = getComputedStyle(emojiPicker).display === "none";
    setPickerVisible(isHidden);
  }

  // Toggle panel (fix: use computed style instead of inline style)
  emojiToggleBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    togglePicker();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiToggleBtn) {
      setPickerVisible(false);
    }
  });

  // Prevent clicks inside the picker from bubbling to the document handler
  emojiPicker.addEventListener("click", (e) => e.stopPropagation());

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setPickerVisible(false);
  });

  // Populate buttons once
  if (messageInput && Array.isArray(emojiList)) {
    emojiPicker.innerHTML = "";

    if (emojiList.length === 0) {
      // Optional: show a friendly empty state
      const empty = document.createElement("div");
      empty.style.padding = "6px";
      empty.style.opacity = "0.7";
      empty.textContent = "No emojis available";
      emojiPicker.appendChild(empty);
      return;
    }

    emojiList.forEach((file) => {
      const name = file.split("/").pop().split(".")[0];

      const btn = document.createElement("button");
      btn.className = "emoji-button";
      btn.type = "button";
      btn.title = `:${name}:`;
      btn.setAttribute("aria-label", `:${name}:`);
      btn.innerHTML = `<img src="${file}" alt=":${name}:" class="emoji">`;

      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        insertAtCursor(messageInput, ` :${name}: `);
        setPickerVisible(false);
        messageInput.focus();
        autoResizeTextarea(messageInput);
      });

      emojiPicker.appendChild(btn);
    });
  }
}
