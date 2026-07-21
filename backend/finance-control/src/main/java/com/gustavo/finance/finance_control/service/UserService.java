package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User insertUser(User user){
        user.setPassword(passwordEncoder.encode(
            user.getPassword()));

        user.setCreatedDate(LocalDateTime.now());
        user.setUpdatedDate(LocalDateTime.now());
        return userRepository.save(user);
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

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){}

    }

    private void updatePassword(User user, String newPassword){
        // criar exception
        if(newPassword.length() < 8){
            throw new RuntimeException("Password must have as least 8 characters");
        }

        user.setPassword(newPassword);
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