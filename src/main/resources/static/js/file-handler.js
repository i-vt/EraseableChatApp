import { getSharedKey, encryptBytes, decryptMessage } from './crypto-utils.js';
import { renderMessage, scrollToBottom } from './ui-utils.js';
import { getStompClient } from './socket-handler.js';

const chunkBuffers = new Map();

export function setupFormSubmission(username) {
    document.getElementById('chatForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message) return;

        const key = await getSharedKey();
        const encrypted = await encryptBytes(key, new TextEncoder().encode(message));

        getStompClient().send("/app/chat.sendMessage", {}, JSON.stringify({
            sender: username,
            iv: encrypted.iv,
            content: encrypted.content,
            type: "text",
            timestamp: new Date().toISOString()
        }));
        input.value = '';
    });
}

export function setupFileUpload(username) {
    const input = document.getElementById('fileInput');
    input.addEventListener('change', async function () {
        const file = this.files[0];
        if (file) {
            sendLargeFileInChunks(file, username, file.type.startsWith("image/") ? "image" : "video");
            this.value = '';
        }
    });
}

export function setupClipboard(username) {
    document.addEventListener('paste', async function (event) {
        const items = event.clipboardData?.items;
        for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                sendLargeFileInChunks(file, username, 'image');
                break;
            }
        }
    });
}

export async function sendLargeFileInChunks(file, username, type) {
    const key = await getSharedKey();
    const chunkSize = 256 * 1024;
    const fileId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
        const buffer = await chunk.arrayBuffer();
        const encrypted = await encryptBytes(key, buffer);

        getStompClient().send("/app/chat.sendChunk", {}, JSON.stringify({
            sender: username,
            fileId,
            chunkIndex: i,
            totalChunks,
            iv: encrypted.iv,
            content: encrypted.content,
            type
        }));
    }
}

export async function handleChunkInit(msg, key) {
    const { fileId, chunkIndex, totalChunks, iv, content, type, sender, timestamp } = msg;
    if (!chunkBuffers.has(fileId)) {
        chunkBuffers.set(fileId, { chunks: [], received: 0, total: totalChunks, type, sender, timestamp });
    }

    const entry = chunkBuffers.get(fileId);
    entry.chunks[chunkIndex] = { iv, content };
    entry.received++;

    if (entry.received === totalChunks) {
        const decryptedChunks = [];
        for (let i = 0; i < totalChunks; i++) {
            const part = entry.chunks[i];
            const data = await decryptMessage(key, part.iv, part.content);
            decryptedChunks.push(data);
        }

        const full = new Uint8Array(decryptedChunks.reduce((sum, c) => sum + c.length, 0));
        let offset = 0;
        for (const chunk of decryptedChunks) {
            full.set(chunk, offset);
            offset += chunk.length;
        }

        const li = document.createElement("li");
        renderMessage(li, sender, type, timestamp, full);
        document.getElementById('messageArea').appendChild(li);
        scrollToBottom();
        chunkBuffers.delete(fileId);
    }
}
