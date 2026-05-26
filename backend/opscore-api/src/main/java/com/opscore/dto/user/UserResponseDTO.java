package com.opscore.dto.user;

import lombok.Builder;
import lombok.Data;



@Data
@Builder
public class UserResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String area;
    private boolean isActive;
    private String avatar;
}

