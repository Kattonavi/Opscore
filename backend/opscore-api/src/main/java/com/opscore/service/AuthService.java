package com.opscore.service;

import com.opscore.entity.User;
import com.opscore.exception.BadRequestException;
import com.opscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new com.opscore.exception.ResourceNotFoundException("Usuario no encontrado"));

        if (!user.isActive()) {
            throw new BadRequestException("User is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return jwtService.generateToken(user);
    }

}

