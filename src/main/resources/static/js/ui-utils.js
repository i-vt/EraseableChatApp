// static/js/ui-utils.js
import { replaceEmojiShortcodes } from "./emoji-utils.js";

const userColors = {};
const GROUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function getUserColor(name) {
  if (userColors[name]) return userColors[name];
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const color = `hsl(${hue}, 80%, 60%)`;
  const glow  = `hsl(${(hue + 180) % 360}, 100%, 60%)`;
  userColors[name] = { color, glow };
  return userColors[name];
}

/** Determine current chat mode by root class on #chatRoot (kept for future use) */
function getChatMode() {
  const root = document.getElementById("chatRoot");
  if (!root) return "irc";
  return root.classList.contains("chat--pro") ? "pro" : "irc";
}

/** Find the last *real* group <li> in #messageArea (skip “phantom” placeholders) */
function getLastGroupLI() {
  const area = document.getElementById("messageArea");
  if (!area) return null;
  const items = area.children;
  for (let i = items.length - 1; i >= 0; i--) {
    const li = items[i];
    if (
      li.nodeType === 1 &&
      !li.dataset.phantom &&             // skip hidden placeholders
      li.dataset.sender &&               // must have a sender
      li.querySelector(":scope > .msg-bubble") // must have a bubble
    ) {
      return li;
    }
  }
  return null;
}

/** Parse ISO timestamp -> ms (falls back to now if invalid/missing) */
function tsToMs(ts) {
  const t = ts ? Date.parse(ts) : NaN;
  return Number.isFinite(t) ? t : Date.now();
}

/** Is this li the same sender + side and within time window? */
function canAppendToGroup(li, sender, isMe, tsMs) {
  if (!li) return false;
  const liSender = li.dataset.sender || "";
  const sideOk   = li.classList.contains(isMe ? "from-me" : "from-them");
  if (!sideOk || liSender !== sender) return false;

  const lastTs = li.dataset.lastTs ? parseInt(li.dataset.lastTs, 10) : NaN;
  if (!Number.isFinite(lastTs)) return false;

  return (tsMs - lastTs) <= GROUP_WINDOW_MS;
}

/**
 * Classify the message HTML (after emoji replacement):
 *  - "single": exactly one <img class="emoji"> and nothing else
 *  - "only": one or more emoji <img>, nothing else
 *  - "mixed": anything else
 */
function classifyEmojiContent(html) {
  const compact = html.trim().replace(/\s+/g, "");
  const singleEmojiRe = /^<img[^>]*class="[^"]*\bemoji\b[^"]*"[^>]*>$/i;
  const onlyEmojiRe   = /^(?:<img[^>]*class="[^"]*\bemoji\b[^"]*"[^>]*>)+$/i;
  if (singleEmojiRe.test(compact)) return "single";
  if (onlyEmojiRe.test(compact))   return "only";
  return "mixed";
}

/** Preserve visual spacing around emoji and forbid a break right next to it */
function protectEmojiSpacing(html, nbsp = "\u00A0") {
  return html.replace(
    /\s*(<img[^>]*\bclass="[^"]*\bemoji\b[^"]*"[^>]*>)\s*/g,
    `${nbsp}$1${nbsp}`
  );
}

/** Trim only boundary spaces (incl. NBSP/narrow NBSP) so bubble hugs content */
function trimBoundarySpaces(html) {
  return html
    .replace(/^(?:\s|\u00A0|\u202F)+/, "")
    .replace(/(?:\s|\u00A0|\u202F)+$/, "");
}

/** Build HTML for one message body (text/image/video), plus an optional bubble class */
function buildBodyHTML(type, binary) {
  if (type === "image" || type === "video") {
    const blob = new Blob([binary]);
    const url = URL.createObjectURL(blob);
    if (type === "image") {
      return { html: `<img src="${url}" class="msg-media" alt="image">`, bubbleClass: "" };
    }
    return { html: `<video controls class="msg-media"><source src="${url}"></video>`, bubbleClass: "" };
  }

  // TEXT path
  const rawText = new TextDecoder().decode(binary);

  // 1) :shortcode: → <img class="emoji">
  let html = replaceEmojiShortcodes(rawText);

  // 2) Protect spacing around emojis with NBSP (do not minimize occurrences)
  html = protectEmojiSpacing(html, "\u00A0");

  // 3) Mentions → <mark class="mention">@user</mark>
  html = html.replace(
    /(^|\s)@([\w.-]{1,32})/g,
    '$1<mark class="mention">@$2</mark>'
  );

  // 4) Trim ONLY boundary spaces so the bubble hugs the content
  html = trimBoundarySpaces(html);

  // 5) Classify for CSS emoji sizing hooks
  const kind = classifyEmojiContent(html);
  let bubbleClass = "";
  if (kind === "single") bubbleClass = "emoji-single";
  else if (kind === "only") bubbleClass = "emoji-only";

  return { html: `<div class="msg-text">${html}</div>`, bubbleClass };
}

/** Append a message body into an existing group <li> with a line break before it */
function appendToExistingGroup(groupLi, _mode, bodyHTML) {
  const bubble = groupLi.querySelector(":scope > .msg-bubble");
  if (!bubble) return false;

  // Once we extend a group, it’s no longer reliably single/only-emoji
  bubble.classList.remove("emoji-single", "emoji-only");

  // Always insert a break before appending a new message in the same group
  if (bubble.childNodes.length > 0) {
    bubble.insertAdjacentHTML("beforeend", "<br>");
  }
  bubble.insertAdjacentHTML("beforeend", bodyHTML.html);

  return true;
}

/** Build a fresh li’s innerHTML for a new group */
function buildNewGroupInnerHTML(sender, color, glow, time, bodyHTML) {
  return `
    <div class="msg-meta">
      <span class="msg-time">[${time}]</span>
      <span class="message-sender sender-name" style="color:${color}; text-shadow: 0 0 4px ${glow};">${sender}</span>
    </div>
    <div class="msg-bubble ${bodyHTML.bubbleClass}">
      ${bodyHTML.html}
    </div>
  `;
}

export function renderMessage(li, sender, type, timestamp, binary) {
  const timeStr = timestamp
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
        hour12: false,
      }).format(new Date(timestamp)) + " UTC"
    : "";

  const tsMs = tsToMs(timestamp);

  const me = (window?.chatConfig?.username ?? "").toString();
  const isMe = sender === me;

  // Side classes for alignment
  li.classList.remove("from-me", "from-them");
  li.classList.add(isMe ? "from-me" : "from-them");

  const { color, glow } = getUserColor(sender);
  const mode = getChatMode();
  const bodyHTML = buildBodyHTML(type, binary);

  // Try to append to last group if same sender + within 5 minutes
  const last = getLastGroupLI();
  if (canAppendToGroup(last, sender, isMe, tsMs)) {
    if (appendToExistingGroup(last, mode, bodyHTML)) {
      // Update the group's last timestamp
      last.dataset.lastTs = String(tsMs);

      // Mark this brand-new <li> as a phantom so when the socket appends it,
      // it won't interfere with future grouping.
      li.dataset.phantom = "1";
      li.style.display = "none";
      return;
    }
  }

  // Fresh group
  li.dataset.sender = sender;
  li.dataset.lastTs = String(tsMs);

  // Build content
  li.innerHTML = buildNewGroupInnerHTML(sender, color, glow, timeStr, bodyHTML);
}

export function scrollToBottom() {
  const messageArea = document.getElementById("messageArea");
  messageArea.scrollTo({ top: messageArea.scrollHeight, behavior: "smooth" });
}
