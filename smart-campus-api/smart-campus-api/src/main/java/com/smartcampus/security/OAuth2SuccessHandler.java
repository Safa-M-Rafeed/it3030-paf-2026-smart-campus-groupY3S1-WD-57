package com.smartcampus.security;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

// --- CRITICAL IMPORTS TO FIX ERRORS ---
import com.smartcampus.repository.UserRepository;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role; // Fixes "Role cannot be resolved"


@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Autowired 
    private UserRepository userRepository;
    
    @Autowired 
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response, Authentication authentication)
            throws IOException {
        
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name  = oauthUser.getAttribute("name");
        String pic   = oauthUser.getAttribute("picture");

        // Save user to DB if first time login
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProfilePicture(pic);
            
            // This now works because of the Role import above
            newUser.setRole(Role.USER); 
            
            return userRepository.save(newUser);
        });

        // Generate JWT and redirect to frontend with token
        String token = jwtUtil.generateToken(email, user.getRole().name());
        String frontendBaseUrl = resolveFrontendBaseUrl(request);
        response.sendRedirect(frontendBaseUrl + "/auth/callback?token=" + token);
    }

    private String resolveFrontendBaseUrl(HttpServletRequest request) {
        String originHeader = request.getHeader("Origin");
        if (originHeader != null && !originHeader.isBlank()) {
            return originHeader;
        }

        String refererHeader = request.getHeader("Referer");
        if (refererHeader != null && !refererHeader.isBlank()) {
            try {
                URI uri = new URI(refererHeader);
                return uri.getScheme() + "://" + uri.getAuthority();
            } catch (URISyntaxException ignored) {
                // Fall through to default
            }
        }

        return "http://localhost:5173";
    }
}