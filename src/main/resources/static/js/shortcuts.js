// Minimal keyboard shortcuts with static themes (Dark/Light)
(function () {
  // Simple CSS rule toggles for layout/shadow/messages (unchanged behavior)
  const CSS_RULES = {
    layout: `footer, h2, hr, nav, #utc-clock, h2 + p { display: none !important; }`,
    shadow: `* { text-shadow: none !important; }`,
    messages: `.emoji-suggestion:hover{
  background-color: var(--border-color) !important;
}
#messageArea li {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}
#messageArea li span:first-child {
  position: absolute;
  right: 0px !important;
  top: 0;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.7rem;
  color: var(--border-color) !important;
  padding-left: 6px;
}
#messageArea li:hover span:first-child {
  opacity: 1;
}
#messageArea .message-sender {
  font-weight: bold;
  font-size: 0.85rem;
  padding-right: 8px;
  position: relative;
  display: inline-block;
}
#messageArea li span:last-child {
  background: var(--dark-bg);
  color: var(--text) !important;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
  text-shadow: none;
  max-width: 100%;
  display: inline-block;
  word-break: break-word;
  margin-top: 2px;
}
#messageArea li span{
  margin: auto 15px;
}
.message-sender{
  padding: 3px 10px !important;
}
#messageArea li span + span + span {
  background-color: var(--light-bg) !important;
}  
 .message-sender {
        font-size: 12px !important;
        margin: 0px 20px !important;
        padding: 2px !important;
        font-weight: 500 !important;
    }
`,
  };

  const NAVIGATION_PATHS = [
    "/dashboard",
    "/chat",
    "/upload#open",
    "/p2p",
    "/drop",
  ];

  const SHORTCUTS = [
    { key: "H", description: "Dashboard", action: () => navigateTo("/dashboard") },
    { key: "C", description: "Chat", action: () => navigateTo("/chat") },
    { key: "U", description: "Upload", action: () => navigateTo("/upload#open") },
    { key: "P", description: "P2P (Peer-to-Peer)", action: () => navigateTo("/p2p") },
    { key: "D", description: "Drop", action: () => navigateTo("/drop") },
    { key: "R", description: "Register", action: () => navigateTo("/register") },
    { key: "L", description: "Login", action: () => navigateTo("/login") },

    // Theme & Toggles
    { key: "T", description: "Toggle Light/Dark", action: () => (window.Theme?.toggle?.(), null) },
    { key: "F", description: "Toggle Layout Elements", action: () => toggleStyle("layout", CSS_RULES.layout) },
    { key: "G", description: "Toggle Text Shadows", action: () => toggleStyle("shadow", CSS_RULES.shadow) },
    { key: "B", description: "Toggle Message Styling", action: () => toggleStyle("messages", CSS_RULES.messages) },

    { key: "K", description: "Cycle Navigation", action: () => cycleNavigation() },
  ];

  // util fns
  function applyRuleStyle(key, css) {
    const id = `${key}-hide-style`;
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = css;
  }
  function removeRuleStyle(key) {
    document.getElementById(`${key}-hide-style`)?.remove();
  }
  function toggleStyle(key, css) {
    const isEnabled = localStorage.getItem(key);
    if (!isEnabled) {
      applyRuleStyle(key, css);
      localStorage.setItem(key, "1");
    } else {
      removeRuleStyle(key);
      localStorage.removeItem(key);
    }
  }
  function navigateTo(url) { window.location.href = url; }
  function cycleNavigation() {
    const currentFullPath = window.location.pathname + window.location.hash;
    let currentIndex = NAVIGATION_PATHS.indexOf(currentFullPath);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % NAVIGATION_PATHS.length;
    navigateTo(NAVIGATION_PATHS[nextIndex]);
  }

  // Minimal panel (Ctrl+/)
  const SHORTCUT_PANEL_ID = "keyboard-shortcut-panel";
  function createShortcutPanel() {
    const panel = document.createElement("div");
    panel.id = SHORTCUT_PANEL_ID;
    panel.innerHTML = `
      <div class="shortcut-overlay">
        <div class="shortcut-panel">
          <div class="shortcut-header">
            <h3>Keyboard Shortcuts</h3>
            <button class="shortcut-close" title="Close (Esc)">×</button>
          </div>
          <div class="shortcut-content">
            <div class="shortcut-section">
              <h4>Navigation</h4>
              <div class="shortcut-grid">
                ${SHORTCUTS.filter(s => ["H","C","U","P","D","R","L","K"].includes(s.key)).map(s => `
                  <div class="shortcut-item" data-key="${s.key}">
                    <span class="shortcut-key">${s.key}</span>
                    <span class="shortcut-desc">${s.description}</span>
                  </div>`).join("")}
              </div>
            </div>
            <div class="shortcut-section">
              <h4>Themes & Toggles</h4>
              <div class="shortcut-grid">
                ${SHORTCUTS.filter(s => ["T","F","G","B"].includes(s.key)).map(s => `
                  <div class="shortcut-item" data-key="${s.key}">
                    <span class="shortcut-key">${s.key}</span>
                    <span class="shortcut-desc">${s.description}</span>
                  </div>`).join("")}
              </div>
            </div>
          </div>
          <div class="shortcut-footer">
            <p>Press any key above to execute, or <span class="key-hint">Esc</span> to close</p>
          </div>
        </div>
      </div>`;
    const style = document.createElement("style");
    style.textContent = `
      #${SHORTCUT_PANEL_ID}{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s}
      #${SHORTCUT_PANEL_ID}.active{opacity:1;visibility:visible}
      .shortcut-overlay{position:absolute;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center}
      .shortcut-panel{background:var(--dark-bg);border:1px solid var(--border-color);border-radius:var(--radius);padding:24px;max-width:900px;width:90%;max-height:80vh;overflow:auto;color:var(--text)}
      .shortcut-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border-color)}
      .shortcut-header h3{margin:0;color:var(--heading);font-size:1.5rem}
      .shortcut-close{max-width:50px;background:none;border:none;color:var(--text);font-size:24px;cursor:pointer;padding:4px 8px;border-radius:4px}
      .shortcut-close:hover{background:var(--light-bg)}
      .shortcut-section{margin-bottom:24px}
      .shortcut-section h4{margin:0 0 12px;color:var(--accent);font-size:1.1rem}
      .shortcut-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
      .shortcut-item{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:var(--radius);background:var(--light-bg);border:1px solid var(--border-color);cursor:pointer;transition:all .2s}
      .shortcut-item:hover{background:var(--main-bg);border-color:var(--accent);transform:translateY(-1px)}
      .shortcut-key{background:var(--accent);color:var(--dark-bg);padding:4px 8px;border-radius:4px;font-weight:bold;font-size:.9rem;min-width:20px;text-align:center}
      .shortcut-desc{color:var(--text);font-size:.9rem}
      .shortcut-footer{margin-top:20px;padding-top:12px;border-top:1px solid var(--border-color);text-align:center;color:var(--text);font-size:.85rem}
      .key-hint{background:var(--light-bg);padding:2px 6px;border-radius:3px;font-weight:bold}
    `;
    document.head.appendChild(style);
    return panel;
  }

  let isOpen = false;
  function showPanel() {
    if (isOpen) return;
    let panel = document.getElementById(SHORTCUT_PANEL_ID);
    if (!panel) {
      panel = createShortcutPanel();
      document.body.appendChild(panel);
    }
    isOpen = true;
    panel.classList.add("active");
    panel.querySelector(".shortcut-close").addEventListener("click", hidePanel);
    panel.querySelector(".shortcut-overlay").addEventListener("click", (e) => {
      if (e.target === panel.querySelector(".shortcut-overlay")) hidePanel();
    });
    panel.querySelectorAll(".shortcut-item").forEach((item) => {
      item.addEventListener("click", () => execute(item.dataset.key));
    });
  }
  function hidePanel() {
    const panel = document.getElementById(SHORTCUT_PANEL_ID);
    panel?.classList.remove("active");
    isOpen = false;
  }
  function execute(key) {
    const s = SHORTCUTS.find(x => x.key === key);
    if (s) { hidePanel(); s.action(); }
  }

  // Load any persisted CSS-rule toggles
  window.addEventListener("DOMContentLoaded", () => {
    for (const key in CSS_RULES) {
      if (localStorage.getItem(key)) {
        applyRuleStyle(key, CSS_RULES[key]);
      }
    }
  });

  // Hotkeys
  document.addEventListener("keydown", (e) => {
    // Ctrl+/ opens the panel
    if (e.ctrlKey && e.key === "/") {
      e.preventDefault();
      showPanel();
      return;
    }

    if (isOpen) {
      if (e.key === "Escape") { e.preventDefault(); hidePanel(); return; }
      const key = e.key.toUpperCase();
      if (["H","C","U","P","D","R","L","K","T","F","G","B"].includes(key)) {
        e.preventDefault(); execute(key); return;
      }
    }

    // Legacy Ctrl+Alt combos (optional)
    if (e.ctrlKey && e.altKey) {
      e.preventDefault();
      switch (e.code) {
        case "KeyF": toggleStyle("layout", CSS_RULES.layout); break;
        case "KeyG": toggleStyle("shadow", CSS_RULES.shadow); break;
        case "KeyH": navigateTo("/dashboard"); break;
        case "KeyU": navigateTo("/upload#open"); break;
        case "KeyP": navigateTo("/p2p"); break;
        case "KeyD": navigateTo("/drop"); break;
        case "KeyC": navigateTo("/chat"); break;
        case "KeyR": navigateTo("/register"); break;
        case "KeyL": navigateTo("/login"); break;
        case "KeyT": window.Theme?.toggle?.(); break;
        case "KeyK": cycleNavigation(); break;
      }
    }
  });
})();
