// static/js/chat/suggestions.js
import { insertAtCursor, autoResizeTextarea } from "./textarea-utils.js";

export function initSuggestions(refs, usernames, emojiList) {
  const { messageInput, chatForm } = refs;

  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestionBox";
  document.getElementById("messageInputContainer")?.appendChild(suggestionBox);

  let currentSuggestions = [];
  let currentMode = null; // 'mention' | 'emoji'

  messageInput?.addEventListener("input", () => {
    handleSuggestions();
    if (messageInput) autoResizeTextarea(messageInput);
  });

  function handleSuggestions() {
    if (!messageInput) return;
    const cursorPos = messageInput.selectionStart;
    const text = messageInput.value.slice(0, cursorPos);

    const emojiMatch = text.match(/:([a-zA-Z0-9_]{1,20})$/);
    if (emojiMatch) {
      const term = emojiMatch[1].toLowerCase();

      // Build emoji objects with name and path
      const parsed = emojiList.map((path) => {
        const filename = path.split("/").pop() || "";
        const name = filename.replace(/\.[^.]+$/, ""); // strip extension
        return { name, path };
      });

      // Prioritize startsWith, then includes
      const starts = parsed.filter(({ name }) => name.toLowerCase().startsWith(term));
      const contains = parsed.filter(
        ({ name }) => !name.toLowerCase().startsWith(term) && name.toLowerCase().includes(term)
      );

      currentSuggestions = [...starts, ...contains];
      currentMode = "emoji";
      renderSuggestions(currentSuggestions, currentMode);
      return;
    }

    const mentionMatch = text.match(/@(\w{1,20})$/);
    if (mentionMatch) {
      const term = mentionMatch[1].toLowerCase();
      currentSuggestions = (usernames || [])
        .filter((n) => n.toLowerCase().startsWith(term))
        .map((name) => ({ name }));
      currentMode = "mention";
      renderSuggestions(currentSuggestions, currentMode);
      return;
    }

    suggestionBox.style.display = "none";
    currentSuggestions = [];
    currentMode = null;
  }

  function renderSuggestions(suggestions, mode) {
    if (!suggestions.length) {
      suggestionBox.style.display = "none";
      return;
    }
    suggestionBox.innerHTML = suggestions
      .map((s) =>
        mode === "emoji"
          ? `<div class="emoji-suggestion" data-name="${s.name}">
               <img src="${s.path}" class="emoji" alt=":${s.name}:" /> :${s.name}:
             </div>`
          : `<div class="mention-suggestion" data-name="${s.name}">@${s.name}</div>`
      )
      .join("");
    suggestionBox.style.display = "block";
  }

  suggestionBox.addEventListener("click", (e) => {
    if (!messageInput) return;
    const div = e.target.closest("div[data-name]");
    if (!div) return;
    const name = div.dataset.name;
    const before = messageInput.value.slice(0, messageInput.selectionStart);
    const after  = messageInput.value.slice(messageInput.selectionStart);
    if (currentMode === "mention") {
      messageInput.value = before.replace(/@(\w{1,20})$/, `@${name} `) + after;
    } else if (currentMode === "emoji") {
      messageInput.value = before.replace(/:([a-zA-Z0-9_]{1,20})$/, `:${name}: `) + after;
    }
    suggestionBox.style.display = "none";
    currentSuggestions = [];
    currentMode = null;
    messageInput.focus();
    autoResizeTextarea(messageInput);
  });

  // Keyboard interactions (Enter submit, Shift+Enter newline, Tab/Space accept, Esc close)
  messageInput?.addEventListener("keydown", (e) => {
    // Shift+Enter => newline (do NOT submit)
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      insertAtCursor(messageInput, "\n");
      autoResizeTextarea(messageInput);
      return;
    }

    // Enter (no Shift) => submit (unless suggestions are open)
    if (e.key === "Enter" && !e.shiftKey) {
      const boxOpen = suggestionBox.style.display === "block";
      if (!boxOpen) {
        e.preventDefault();
        chatForm?.requestSubmit();
      }
      return;
    }

    // Tab/Space => accept first suggestion
    if ((e.key === "Tab" || e.key === " ") && currentSuggestions.length > 0 && currentMode) {
      e.preventDefault();
      const name = currentSuggestions[0].name;
      const before = messageInput.value.slice(0, messageInput.selectionStart);
      const after  = messageInput.value.slice(messageInput.selectionStart);
      if (currentMode === "mention") {
        messageInput.value = before.replace(/@(\w{1,20})$/, `@${name} `) + after;
      } else if (currentMode === "emoji") {
        messageInput.value = before.replace(/:([a-zA-Z0-9_]{1,20})$/, `:${name}: `) + after;
      }
      suggestionBox.style.display = "none";
      currentSuggestions = [];
      currentMode = null;
      autoResizeTextarea(messageInput);
      return;
    }

    // Escape => close suggestions
    if (e.key === "Escape") {
      suggestionBox.style.display = "none";
      currentSuggestions = [];
      currentMode = null;
    }
  });
}
