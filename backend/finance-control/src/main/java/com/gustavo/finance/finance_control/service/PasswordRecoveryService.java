package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.gustavo.finance.finance_control.dto.ForgotPasswordResponse;
import com.gustavo.finance.finance_control.dto.ResetPasswordRequest;
import com.gustavo.finance.finance_control.exception.InvalidPasswordResetTokenException;
import com.gustavo.finance.finance_control.entity.RedifinationPasswordToken;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.repository.RedifinationPasswordTokenRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@Service
public class PasswordRecoveryService {

    private static final String NEUTRAL_MESSAGE =  "If this e-mail is registered, you will receive the instructions shortly.";

    private final UserRepository userRepository;
    private final RedifinationPasswordTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSenderService emailSenderService;
    private final String frontendUrl;

    public PasswordRecoveryService(
        UserRepository userRepository,
        RedifinationPasswordTokenRepository tokenRepository,
        PasswordEncoder passwordEncoder,
        EmailSenderService emailSenderService,
        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSenderService = emailSenderService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(String email) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            return new ForgotPasswordResponse(NEUTRAL_MESSAGE);
        }

        return createResetToken(user.get());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        RedifinationPasswordToken resetToken = tokenRepository.findByToken(request.getToken())
            .orElseThrow(InvalidPasswordResetTokenException::new);

        if (resetToken.isUsed() || resetToken.getExpireDate().isBefore(LocalDateTime.now())) {
            throw new InvalidPasswordResetTokenException();
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedDate(LocalDateTime.now());
        resetToken.setUsed(true);

        userRepository.save(user);
        tokenRepository.save(resetToken);
    }

    private ForgotPasswordResponse createResetToken(User user) {
        RedifinationPasswordToken resetToken = new RedifinationPasswordToken();
        resetToken.setUser(user);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpireDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);

        RedifinationPasswordToken savedToken = tokenRepository.save(resetToken);

        String resetLink = buildResetLink(savedToken.getToken());
        Context context = new Context();
        context.setVariable("name", user.getUsername());
        context.setVariable("resetLink", resetLink);
        context.setVariable("token", savedToken.getToken());

        emailSenderService.sendEmailTemplate(
            user.getEmail(),
            "Password recovery",
            "passwordRecovery",
            context
        );

        return new ForgotPasswordResponse(NEUTRAL_MESSAGE);
    }

    private String buildResetLink(String token) {
        String baseUrl = frontendUrl;

        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        return baseUrl + "/reset-password/" + token;
    }
}
