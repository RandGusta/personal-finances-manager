package com.gustavo.finance.finance_control.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import com.gustavo.finance.finance_control.dto.ChangePasswordRequest;
import com.gustavo.finance.finance_control.dto.CurrentUserResponse;
import com.gustavo.finance.finance_control.dto.RegisterRequest;
import com.gustavo.finance.finance_control.dto.UpdateUserRequest;
import com.gustavo.finance.finance_control.dto.UserProfileResponse;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserType;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ExistingEmailException;
import com.gustavo.finance.finance_control.exception.InvalidTransactionTypeException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSenderService emailSenderService;

    public UserService(
        UserRepository userRepository,
        TransactionRepository transactionRepository,
        PasswordEncoder passwordEncoder,
        EmailSenderService emailSenderService
    ) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSenderService = emailSenderService;
    }

    @Transactional
    public User register(RegisterRequest request) {
        verifyExistingEmail(request.getEmail());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getName().trim());
        user.setUserType(UserType.USER);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedDate(LocalDateTime.now());
        user.setUpdatedDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        Context context = new Context();
        context.setVariable("name", user.getUsername());
        emailSenderService.sendEmailTemplate(
            user.getEmail(),
            "Success",
            "newRegister",
            context
        );

        return savedUser;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UpdateUserRequest request) {
        user.setUsername(request.getName().trim());
        user.setUpdatedDate(LocalDateTime.now());
        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedDate(LocalDateTime.now());
        userRepository.save(user);
    }

    public CurrentUserResponse getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        CurrentUserResponse response = new CurrentUserResponse();
        response.setEmail(user.getEmail());
        response.setUserName(user.getUsername());

        List<Transaction> transactions = transactionRepository.findBycreatedBy(user);
        calculateCurrentUserValues(response, transactions);
        return response;
    }

    private void calculateCurrentUserValues(
        CurrentUserResponse response,
        List<Transaction> transactions
    ) {
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getCategory().getType() == TransactionType.INCOME) {
                income = income.add(transaction.getValue());
            } else if (transaction.getCategory().getType() == TransactionType.EXPENSE) {
                expense = expense.add(transaction.getValue());
            } else {
                throw new InvalidTransactionTypeException();
            }
        }

        response.setExpenses(expense);
        response.setRevenue(income);
        response.setBalance(income.subtract(expense));
    }

    private void verifyExistingEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ExistingEmailException();
        }
    }

    public List<User> listAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteAll() {
        userRepository.deleteAll();
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
