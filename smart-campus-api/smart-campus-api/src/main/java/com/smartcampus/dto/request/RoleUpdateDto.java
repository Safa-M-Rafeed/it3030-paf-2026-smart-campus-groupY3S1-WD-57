package com.smartcampus.dto.request;

public class RoleUpdateDto {
    private String role; // e.g., "ADMIN" or "USER"

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}