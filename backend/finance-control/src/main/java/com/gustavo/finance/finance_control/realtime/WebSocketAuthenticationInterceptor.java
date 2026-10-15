package com.gustavo.finance.finance_control.realtime;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.gustavo.finance.finance_control.security.JwtService;
import com.gustavo.finance.finance_control.service.UserService;

@Component
public class WebSocketAuthenticationInterceptor implements ChannelInterceptor {

    private static final String WALLET_UPDATES_DESTINATION = "/user/queue/wallet-updates";

    private final JwtService jwtService;
    private final UserService userService;

    public WebSocketAuthenticationInterceptor(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
            message,
            StompHeaderAccessor.class
        );

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            validateSubscription(accessor);
        }

        if (StompCommand.SEND.equals(accessor.getCommand())) {
            throw new AccessDeniedException("Clients cannot publish realtime updates");
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AccessDeniedException("A valid token is required for realtime updates");
        }

        try {
            String token = authorization.substring(7);
            String email = jwtService.extractEmail(token);
            UserDetails userDetails = userService.loadUserByUsername(email);

            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new AccessDeniedException("A valid token is required for realtime updates");
            }

            accessor.setUser(new UsernamePasswordAuthenticationToken(
                email,
                null,
                userDetails.getAuthorities()
            ));
        } catch (AccessDeniedException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new AccessDeniedException("A valid token is required for realtime updates");
        }
    }

    private void validateSubscription(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new AccessDeniedException("A valid token is required for realtime updates");
        }

        if (!WALLET_UPDATES_DESTINATION.equals(accessor.getDestination())) {
            throw new AccessDeniedException("This realtime destination is not available");
        }
    }
}
