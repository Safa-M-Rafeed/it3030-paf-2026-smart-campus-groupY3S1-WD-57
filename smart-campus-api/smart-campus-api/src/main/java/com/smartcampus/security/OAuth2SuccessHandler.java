package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;

    @Value("${app.security.admin-confirmation-code:ADMIN2026}")
    private String adminConfirmationCode;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String pic = oauthUser.getAttribute("picture");
        String requestedRole = getCookieValue(request, "sc_requested_role");
        String adminCode = getCookieValue(request, "sc_admin_code");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User n = new User();
                    n.setEmail(email);
                    n.setName(name);
                    n.setProfilePicture(pic);
                    n.setRole(Role.USER);
                    return userRepository.save(n);
                });

        Role finalRole = resolveRole(requestedRole, adminCode);
        String roleMessage = null;
        if (finalRole != user.getRole()) {
            user.setRole(finalRole);
        }
        if ("ADMIN".equalsIgnoreCase(requestedRole) && finalRole != Role.ADMIN) {
            roleMessage = "Admin confirmation failed. Logged in as USER.";
            user.setRole(Role.USER);
        }
        userRepository.save(user);

        notificationService.send(
                user,
                "LOGIN_GREETING",
                "Welcome back, " + (user.getName() == null ? user.getEmail() : user.getName()) + "!"
        );

        clearCookie(response, "sc_requested_role");
        clearCookie(response, "sc_admin_code");

        String token = jwtUtil.generateToken(
                email,
                user.getRole().name()
        );

        String redirect = "http://localhost:5173/auth/callback?token=" + token;
        if (roleMessage != null) {
            redirect += "&msg=" + URLEncoder.encode(roleMessage, StandardCharsets.UTF_8);
        }
        response.sendRedirect(redirect);
    }

    private Role resolveRole(String requestedRoleRaw, String adminCode) {
        if (requestedRoleRaw == null || requestedRoleRaw.isBlank()) {
            return Role.USER;
        }
        String requestedRole = requestedRoleRaw.trim().toUpperCase();
        if ("ADMIN".equals(requestedRole)) {
            return adminConfirmationCode.equals(adminCode) ? Role.ADMIN : Role.USER;
        }
        return switch (requestedRole) {
            case "TECHNICIAN" -> Role.TECHNICIAN;
            case "MANAGER" -> Role.MANAGER;
            default -> Role.USER;
        };
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}