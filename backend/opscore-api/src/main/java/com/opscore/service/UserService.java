package com.opscore.service;

import com.opscore.dto.user.*;
import com.opscore.entity.Role;
import com.opscore.entity.User;
import com.opscore.exception.BadRequestException;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.RoleRepository;
import com.opscore.repository.UserRepository;
import com.opscore.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import com.opscore.entity.Area;
import com.opscore.entity.Role;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final AreaRepository areaRepository;

    public UserResponseDTO createUser(CreateUserRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        Area area = null;

        if (request.getAreaId() != null) {
            area = areaRepository.findById(request.getAreaId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Area not found"));
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .area(area)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .area(
                        savedUser.getArea() != null
                                ? savedUser.getArea().getName()
                                : null
                )
                .isActive(savedUser.isActive())
                .avatar(savedUser.getAvatar())
                .build();
    }

    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .area(
                        user.getArea() != null
                                ? user.getArea().getName()
                                : null
                )
                .isActive(user.isActive())
                .avatar(user.getAvatar())
                .build();
    }

    public List<UserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> UserResponseDTO.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .role(user.getRole().getName())
                        .area(
                                user.getArea() != null
                                        ? user.getArea().getName()
                                        : null
                        )
                        .isActive(user.isActive())
                        .avatar(user.getAvatar())
                        .build()
                )
                .toList();
    }

    public List<UserResponseDTO> getAssignableUsers() {

        return userRepository
                .findByActiveTrueAndRoleNameIn(List.of("TECHNICIAN"))
                .stream()
                .map(user -> UserResponseDTO.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .role(user.getRole().getName())
                        .area(
                                user.getArea() != null
                                        ? user.getArea().getName()
                                        : null
                        )
                        .isActive(user.isActive())
                        .avatar(user.getAvatar())
                        .build()
                )
                .toList();
    }

    public UserResponseDTO getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .area(
                        user.getArea() != null
                                ? user.getArea().getName()
                                : null
                )
                .isActive(user.isActive())
                .avatar(user.getAvatar())
                .build();
    }

    public UserResponseDTO updateUserRole(
            Long userId,
            UpdateUserRoleDTO request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found")
                );

        user.setRole(role);

        User updatedUser = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(updatedUser.getId())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().getName())
                .area(
                        updatedUser.getArea() != null
                                ? updatedUser.getArea().getName()
                                : null
                )
                .isActive(updatedUser.isActive())
                .avatar(updatedUser.getAvatar())
                .build();
    }

    public UserResponseDTO updateUserStatus(
            Long userId,
            UpdateUserStatusDTO request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        user.setActive(request.isActive());

        User updatedUser = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(updatedUser.getId())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().getName())
                .area(
                        updatedUser.getArea() != null
                                ? updatedUser.getArea().getName()
                                : null
                )
                .isActive(updatedUser.isActive())
                .avatar(updatedUser.getAvatar())
                .build();
    }

    public void changePassword(ChangePasswordDTO request) {

        String email = SecurityUtils.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

}
