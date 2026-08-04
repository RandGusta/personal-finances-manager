package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.ForgotPasswordResponse;
import com.gustavo.finance.finance_control.dto.ResetPasswordRequest;
import com.gustavo.finance.finance_control.entity.RedifinationPasswordToken;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.exception.InvalidPasswordResetTokenException;
import com.gustavo.finance.finance_control.repository.RedifinationPasswordTokenRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@Service
public class PasswordRecoveryService {

    private static final String NEUTRAL_MESSAGE =
        "Se este e-mail estiver cadastrado, você receberá as instruções em breve.";

    private final UserRepository userRepository;
    private final RedifinationPasswordTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordRecoveryService(
        UserRepository userRepository,
        RedifinationPasswordTokenRepository tokenRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(String email) {
        return userRepository.findByEmail(email)
            .map(this::createResetToken)
            .orElseGet(() -> new ForgotPasswordResponse(NEUTRAL_MESSAGE, null));
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
        return new ForgotPasswordResponse(NEUTRAL_MESSAGE, savedToken.getToken());
    }
}
