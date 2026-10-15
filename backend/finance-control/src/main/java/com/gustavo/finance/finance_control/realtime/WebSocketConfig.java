package com.gustavo.finance.finance_control.realtime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String frontendUrl;
    private final WebSocketAuthenticationInterceptor authenticationInterceptor;

    public WebSocketConfig(
        @Value("${app.frontend-url}") String frontendUrl,
        WebSocketAuthenticationInterceptor authenticationInterceptor
    ) {
        this.frontendUrl = frontendUrl;
        this.authenticationInterceptor = authenticationInterceptor;
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
}
