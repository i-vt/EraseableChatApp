package com.example.chatapp.service;

import com.example.chatapp.entity.ChatMessageEntity;
import com.example.chatapp.model.ChatMessage;
import com.example.chatapp.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository repository;
    public void deleteAllMessages() {
        repository.deleteAll();
    }

    public ChatService(ChatMessageRepository repository) {
        this.repository = repository;
    }

    public void store(ChatMessage chatMessage) {
        ChatMessageEntity entity = new ChatMessageEntity(
                chatMessage.getSender(),
                chatMessage.getContent(),
                chatMessage.getIv()
        );
        repository.save(entity);
    }

    public List<ChatMessage> getAllMessages() {
        return repository.findAll().stream()
                .map(e -> new ChatMessage(e.getSender(), e.getContent(), e.getIv()))
                .toList();
    }
}
