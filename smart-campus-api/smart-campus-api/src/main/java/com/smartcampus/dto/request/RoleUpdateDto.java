package com.smartcampus.dto.request;

import com.smartcampus.model.enums.Role;
import lombok.Data;

@Data
public class RoleUpdateDto {

    private Role role;
}