export function encodeBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export function decodeBase64(str) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export async function getSharedKey() {
    const match = document.cookie.match(/(?:^| )chatKey=([^;]+)/);
    if (!match) throw new Error("Missing encryption key!");
    const raw = decodeBase64(match[1]);
    return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export async function encryptBytes(key, bytes) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
    return { iv: encodeBase64(iv), content: encodeBase64(encrypted) };
}

export async function decryptMessage(key, ivBase64, contentBase64) {
    const iv = decodeBase64(ivBase64);
    const data = decodeBase64(contentBase64);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new Uint8Array(decrypted);
}
