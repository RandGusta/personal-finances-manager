package com.gustavo.finance.finance_control.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

import com.gustavo.finance.finance_control.security.AuthenticationRateLimitFilter;
import com.gustavo.finance.finance_control.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationRateLimitFilter authenticationRateLimitFilter;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        AuthenticationRateLimitFilter authenticationRateLimitFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationRateLimitFilter = authenticationRateLimitFilter;
    }


    // delimitamos as paginas publicas e privadas
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        // HttpSecurity podem lançar exceções durante a construção da configuração, por isso o exception 
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .referrerPolicy(referrerPolicy ->
                    referrerPolicy.policy(ReferrerPolicy.NO_REFERRER)
                )
                .permissionsPolicyHeader(permissions ->
                    permissions.policy("camera=(), microphone=(), geolocation=()")
                )
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, ex) ->
                    writeErrorResponse(
                        response,
                        HttpStatus.UNAUTHORIZED,
                        "Authentication is required"
                    )
                )
                .accessDeniedHandler((request, response, ex) ->
                    writeErrorResponse(
                        response,
                        HttpStatus.FORBIDDEN,
                        "You do not have permission to perform this operation"
                    )
                )
            )
            .authorizeHttpRequests(auth ->
            auth.requestMatchers(
                "/auth/register",
                "/auth/login",
                "/auth/forgot-password",
                "/auth/reset-password",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/ws",
                "/error"
            ).permitAll()
            .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(authenticationRateLimitFilter, JwtAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable());
        return http.build();
    }

    private void writeErrorResponse(
        jakarta.servlet.http.HttpServletResponse response,
        HttpStatus status,
        String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean 
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager();
    }
}
