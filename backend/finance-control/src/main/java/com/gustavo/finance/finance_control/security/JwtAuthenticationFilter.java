package com.gustavo.finance.finance_control.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gustavo.finance.finance_control.service.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
// OncePerRequestFilter --> filtros para requisições 
public class JwtAuthenticationFilter extends OncePerRequestFilter  {
    private final JwtService jwtService;
    private final UserService userService;


    public JwtAuthenticationFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        //pega o header Authorization
        final String authHeader = request.getHeader("Authorization");

        //se não existir ou não começar com Bearer, continua a requisição
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        //extrai o token
        String jwt = authHeader.substring(7);

        //extrai o email do token
        String userEmail = jwtService.extractEmail(jwt);

        //se existe usuário e ninguém está autenticado ainda
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            //busca o usuário no banco
            UserDetails userDetails = userService.loadUserByUsername(userEmail);

            //valida o token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // criando para validar usuários autenticados 
                UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // setta o usuário esse request
                SecurityContextHolder.getContext()
                        .setAuthentication(authToken); // DURA APENAS UMA REQUISIÇÃO
            }
        }

        //continua a cadeia de filtros --> proximos filtros do spring 
        filterChain.doFilter(request, response);    
    }
}
