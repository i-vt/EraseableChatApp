import { decryptMessage, getSharedKey } from "./crypto-utils.js";
import { renderMessage, scrollToBottom } from "./ui-utils.js";
import { handleChunkInit } from "./file-handler.js";

let stompClient;
let messageArea = document.getElementById("messageArea");

export async function connectAndSubscribe(username) {
  const key = await getSharedKey();
  const socket = new SockJS("/chat-websocket");
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe("/topic/public", async (messageOutput) => {
      const msg = JSON.parse(messageOutput.body);

      // Check for duplicate (based on sender + timestamp)
      const alreadyExists = [
        ...document.querySelectorAll("#messageArea li"),
      ].some(
        (li) =>
          li.dataset.sender === msg.sender &&
          li.dataset.timestamp === msg.timestamp
      );

      if (alreadyExists) return;

      if (msg.fileId) {
        handleChunkInit(msg, key);
      } else {
        const li = document.createElement("li");
        li.dataset.sender = msg.sender;
        li.dataset.iv = msg.iv;
        li.dataset.content = msg.content;
        li.dataset.timestamp = msg.timestamp;

        try {
          const decryptedBytes = await decryptMessage(key, msg.iv, msg.content);
          const decryptedText = new TextDecoder().decode(decryptedBytes); // Decode for mention check

          renderMessage(
            li,
            msg.sender ?? "unknown",
            (msg.type || "text").toLowerCase(),
            msg.timestamp,
            decryptedBytes // Pass original bytes to renderMessage
          );

          // IMPORTANT: Check for mentions for *new* messages only
          // Ensure window.checkForMentions exists before calling
          if (typeof window.checkForMentions === "function") {
            window.checkForMentions(
              msg.sender,
              decryptedText, // Pass the decoded text to checkForMentions
              window.chatConfig.username
            );
          }
        } catch {
          renderMessage(
            li,
            msg.sender,
            "text",
            msg.timestamp,
            new TextEncoder().encode("[decryption failed]")
          );
        }

        messageArea.appendChild(li);
        scrollToBottom();
      }
    });
  });
}

export function getStompClient() {
  return stompClient;
}
