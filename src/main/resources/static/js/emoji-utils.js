export function replaceEmojiShortcodes(text) {
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, emojiName) => {
        const safeName = emojiName.replace(/[^a-zA-Z0-9_+-]/g, '');
        const src = `/images/emojis/${safeName}.gif`;

        return `
            <img 
                src="${src}" 
                alt=":${safeName}:" 
                class="emoji" 
                onerror="this.outerHTML=':${safeName}:';"
            >
        `;
    });
}
