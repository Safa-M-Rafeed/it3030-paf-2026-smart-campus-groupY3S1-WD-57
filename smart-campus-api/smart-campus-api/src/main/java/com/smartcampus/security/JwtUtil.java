package com.smartcampus.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    // Helper to generate the secure key
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email) // FIX: subject() instead of setSubject()
                .claim("role", role)
                .issuedAt(new Date()) // FIX: issuedAt() instead of setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey()) // FIX: Removed deprecated SignatureAlgorithm
                .compact();
    }

    public String extractEmail(String token) {
        // FIX: Use parser() instead of parserBuilder()
        // FIX: Use verifyWith() instead of setSigningKey()
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token) // FIX: parseSignedClaims instead of parseClaimsJws
                .getPayload() // FIX: getPayload() instead of getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}