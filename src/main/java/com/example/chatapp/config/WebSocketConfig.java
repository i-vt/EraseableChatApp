package com.example.chatapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final int MAX_MESSAGE_SIZE = 20 * 1024 * 1024; // 20 MB
    private static final int MAX_STREAM_BYTES = 20 * 1024 * 1024; // 20 MB for SockJS

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // SimpleBroker for in-memory pub-sub
        config.setApplicationDestinationPrefixes("/app"); // Prefix for @MessageMapping
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat-websocket")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setStreamBytesLimit(MAX_STREAM_BYTES)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30_000);

        registry.addEndpoint("/p2p-ws")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setStreamBytesLimit(MAX_STREAM_BYTES)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30_000);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(MAX_MESSAGE_SIZE);        // Max inbound message size
        registry.setSendBufferSizeLimit(MAX_MESSAGE_SIZE);     // Max outbound message buffer
        registry.setSendTimeLimit(60 * 1000);                  // Timeout for sending messages (60 seconds)
    }
}
