package com.smartcampus.model;

import com.smartcampus.model.enums.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String email;

    private String name;

    private String profilePicture;

    private Role role;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}