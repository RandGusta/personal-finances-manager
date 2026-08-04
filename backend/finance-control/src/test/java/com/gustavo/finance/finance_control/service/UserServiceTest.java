package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gustavo.finance.finance_control.dto.ChangePasswordRequest;
import com.gustavo.finance.finance_control.dto.UpdateUserRequest;
import com.gustavo.finance.finance_control.dto.UserProfileResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;
    private User user;

    @BeforeEach
    void setUp() {
        userService = new UserService(
            userRepository,
            transactionRepository,
            passwordEncoder
        );

        user = new User();
        user.setId(1L);
        user.setUsername("Gustavo");
        user.setEmail("gustavo@example.com");
        user.setPassword("encoded-current-password");
        user.setCreatedDate(LocalDateTime.now().minusDays(1));
        user.setUpdatedDate(LocalDateTime.now().minusDays(1));
    }

    @Test
    void shouldReturnAuthenticatedUserProfile() {
        UserProfileResponse response = userService.getProfile(user);

        assertEquals(1L, response.getId());
        assertEquals("Gustavo", response.getName());
        assertEquals("gustavo@example.com", response.getEmail());
    }

    @Test
    void shouldUpdateAuthenticatedUserName() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setName("  Gustavo Randi  ");
        when(userRepository.save(user)).thenReturn(user);

        UserProfileResponse response = userService.updateProfile(user, request);

        assertEquals("Gustavo Randi", response.getName());
        assertNotNull(response.getUpdatedAt());
        verify(userRepository).save(user);
    }

    @Test
    void shouldRejectIncorrectCurrentPassword() {
        ChangePasswordRequest request = passwordRequest("wrong-password", "new-password");
        when(passwordEncoder.matches("wrong-password", user.getPassword())).thenReturn(false);

        assertThrows(BusinessException.class, () -> userService.changePassword(user, request));

        verify(userRepository, never()).save(user);
    }

    @Test
    void shouldChangePasswordWhenCurrentPasswordMatches() {
        ChangePasswordRequest request = passwordRequest("current-password", "new-password");
        when(passwordEncoder.matches("current-password", user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new-password");

        userService.changePassword(user, request);

        assertEquals("encoded-new-password", user.getPassword());
        verify(userRepository).save(user);
    }

    private ChangePasswordRequest passwordRequest(String currentPassword, String newPassword) {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword(currentPassword);
        request.setNewPassword(newPassword);
        return request;
    }
}
