// static/js/chat/textarea-utils.js
export function insertAtCursor(el, text) {
  const start = el.selectionStart ?? el.value.length;
  const end   = el.selectionEnd ?? el.value.length;
  const before = el.value.slice(0, start);
  const after  = el.value.slice(end);
  el.value = before + text + after;
  const pos = start + text.length;
  el.selectionStart = el.selectionEnd = pos;
}

export function autoResizeTextarea(textarea) {
  const cs = getComputedStyle(textarea);
  const lineHeight = parseFloat(cs.lineHeight || "20");
  const paddingY   = parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");
  const borderY    = parseFloat(cs.borderTopWidth || "0") + parseFloat(cs.borderBottomWidth || "0");
  const maxLines   = 3;
  const maxHeight  = lineHeight * maxLines + paddingY + borderY;

  textarea.style.height = "auto";
  const needed = Math.min(maxHeight, textarea.scrollHeight);
  textarea.style.height = needed + "px";
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}
