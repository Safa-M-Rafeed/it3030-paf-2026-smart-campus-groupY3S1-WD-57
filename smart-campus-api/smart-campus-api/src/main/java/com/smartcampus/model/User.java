package com.smartcampus.model;

import com.smartcampus.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String profilePicture;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}