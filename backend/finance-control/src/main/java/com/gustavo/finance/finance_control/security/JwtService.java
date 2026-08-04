package com.gustavo.finance.finance_control.security;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.gustavo.finance.finance_control.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.validation.Valid;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey(){
        byte[] ketBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(ketBytes);
    }

    public String generateToken(User user){
        return Jwts.builder().subject(user.getEmail()) // baseado no email
        .issuedAt(new Date()) // data de criação
        .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60) // 1 hora
        ).signWith(getSecretKey()) // assinado a partir da secret 
        .compact(); // compactado em uma string somente
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    //retornar todas as informações do token (subject, date, etc...)
    private Claims extractAllClaims(String token) {
     return Jwts.parser()
            .verifyWith(getSecretKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
}

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims); // aplicando a função para filtrar o especifico
    }


    public boolean isTokenValid(String token, UserDetails userDetails) {
        String tokenEmail = extractEmail(token);
        String authenticatedEmail = userDetails instanceof User user
            ? user.getEmail()
            : userDetails.getUsername();

        return tokenEmail.equals(authenticatedEmail) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
}
}
