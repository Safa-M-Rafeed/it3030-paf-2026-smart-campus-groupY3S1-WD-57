package com.smartcampus.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired private JwtFilter jwtFilter;
    @Autowired private OAuth2SuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(c -> c.disable())
            // OAuth2 login requires a temporary session to keep authorization state.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(a -> a
                    .requestMatchers("/", "/error").permitAll()
                    .requestMatchers("/oauth2/**", "/login/**").permitAll()
                    .requestMatchers("/api/auth/me").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                    .requestMatchers("/api/notifications/**")
                        .hasAnyRole("USER", "ADMIN", "TECHNICIAN", "MANAGER")
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/facilities/**").permitAll()
                    .anyRequest().authenticated()
            )
            .oauth2Login(o -> o.successHandler(successHandler))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);

        return src;
    }
}