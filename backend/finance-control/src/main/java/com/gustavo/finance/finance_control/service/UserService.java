package com.gustavo.finance.finance_control.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.gustavo.finance.finance_control.dto.CurrentUserResponse;
import com.gustavo.finance.finance_control.dto.SingUpRequest;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserType;
import com.gustavo.finance.finance_control.exception.ExistingEmailException;
import com.gustavo.finance.finance_control.exception.InvalidTransactionTypeException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailSenderService emailSenderService;

    public User insertUser(SingUpRequest request){
        verifyExistingEmail(request.getEmail());
        User user = new User();

        user.setEmail(request.getEmail());
        user.setUsername(request.getUserName());
        user.setUserType(UserType.USER);
        user.setPassword(passwordEncoder.encode(
        request.getPassword()));
        user.setCreatedDate(LocalDateTime.now());
        user.setUpdatedDate(LocalDateTime.now());

        User userDataBase = userRepository.save(user);

        Context context = new Context();
        context.setVariable("name", user.getUsername());
        emailSenderService.sendEmailTemplate(user.getEmail(), "Success", "newRegister", context);

        return userDataBase;
    }

    public CurrentUserResponse getCurrentUser(Authentication authentication){
        User user = (User) authentication.getPrincipal(); 
        CurrentUserResponse response = new CurrentUserResponse();

        response.setEmail(user.getEmail());
        response.setUserName(user.getUsername());  
        
         List<Transaction> transactions =
         transactionRepository.findBycreatedBy(user);

        calulateCurrentUserValues(response, transactions);

        System.out.println("response: " + response);
        return response;

    }

    private void calulateCurrentUserValues(CurrentUserResponse response, List<Transaction> transactions){
        BigDecimal income = new BigDecimal("0");
        BigDecimal expense = new BigDecimal("0"); 
        BigDecimal balance = new BigDecimal("0");

        for (Transaction transaction : transactions){
            
            if(transaction.getCategory().getType() == TransactionType.INCOME){
                income = income.add(transaction.getValue());
            }
            else if(transaction.getCategory().getType() == TransactionType.EXPENSE){
                expense = expense.add(transaction.getValue());
            }
            else {
                throw new InvalidTransactionTypeException();
            }
        } 
        balance = income.subtract(expense);

        response.setExpenses(expense);
        response.setRevenue(income);
        response.setBalance(balance);
    }



    private void verifyExistingEmail(String email){
        // criar exception
        if(userRepository.findByEmail(email).isPresent()){
            throw new ExistingEmailException();
        }
    }

    public List<User> listAll(){
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id){
        return userRepository.findById(id);
    }

    public void deleteAll(){
        userRepository.deleteAll();
    }

    private void changePassword(Long id, String currentPassword, String newPassword){
        // criar exception
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException());

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){
            throw new RuntimeException("Current password is incorrect.");
        }
    }

    private void updatePassword(User user, String newPassword){
        // criar exception
        if(newPassword.length() < 8){
            throw new RuntimeException("Password must have as least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedDate(LocalDateTime.now());
        // Quando o objeto já possui um ID o Hibernate ja sabé que 
        // ele existe
        userRepository.save(user);     
    }


    @Override
    public UserDetails loadUserByUsername(String email){
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }


}