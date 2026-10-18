package com.gustavo.finance.finance_control.realtime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@EnableScheduling
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String frontendUrl;
    private final WebSocketAuthenticationInterceptor authenticationInterceptor;
    private final WebSocketSessionRegistry sessionRegistry;

    public WebSocketConfig(
        @Value("${app.frontend-url}") String frontendUrl,
        WebSocketAuthenticationInterceptor authenticationInterceptor,
        WebSocketSessionRegistry sessionRegistry
    ) {
        this.frontendUrl = frontendUrl;
        this.authenticationInterceptor = authenticationInterceptor;
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins(frontendUrl);
    }

    @Override
    public void configureClientInboundChannel(
        org.springframework.messaging.simp.config.ChannelRegistration registration
    ) {
        registration.interceptors(authenticationInterceptor);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.addDecoratorFactory(sessionRegistry);
    }

    @Override
    public void configureClientOutboundChannel(
        org.springframework.messaging.simp.config.ChannelRegistration registration
    ) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                SimpMessageType type = SimpMessageHeaderAccessor.getMessageType(message.getHeaders());
                String sessionId = SimpMessageHeaderAccessor.getSessionId(message.getHeaders());
                if (type == SimpMessageType.MESSAGE && !sessionRegistry.isValid(sessionId)) {
                    return null;
                }
                return message;
            }
        });
    }
}
