package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

public class UserControllerIT {
    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    private AutoCloseable closeable;

    @BeforeEach
    public void setup() {
        closeable = MockitoAnnotations.openMocks(this); // Initialise les mocks avec Mockito
        mockMvc = standaloneSetup(userController)
                .build();
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void findById_ShouldReturnUser_WhenUserExists() throws Exception {
        // GIVEN
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .email("user@test.com")
                .lastName("Nom")
                .firstName("Prénom")
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        UserDto userDto = new UserDto(
                userId,
                "user@test.com",
                "Nom",
                "Prénom",
                false,
                null,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        when(userService.findById(userId)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDto);

        // WHEN + THEN
        mockMvc.perform(get("/api/user/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.lastName").value("Nom"))
                .andExpect(jsonPath("$.firstName").value("Prénom"))
                .andExpect(jsonPath("$.admin").value(false))
                .andExpect(jsonPath("$.password").doesNotExist()) // Vérifie que le mot de passe n'est pas exposé
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        verify(userService, times(1)).findById(userId);
        verify(userMapper, times(1)).toDto(user);
    }

    @Test
    void findById_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        // GIVEN
        Long userId = 1L;
        when(userService.findById(userId)).thenReturn(null);

        // WHEN + THEN
        mockMvc.perform(get("/api/user/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).findById(userId);
    }

    @Test
    void findById_ShouldReturnBadRequest_WhenIdIsInvalid() throws Exception {
        // WHEN + THEN
        mockMvc.perform(get("/api/user/{id}", "invalide-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void delete_ShouldSuccessfullyDelete_WhenAuthorizedAndUserExists() throws Exception {
        // GIVEN
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .email("user@test.com")
                .lastName("Nom")
                .firstName("Prénom")
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Simuler l'utilisateur connecté
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@test.com", "password", Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );

        when(userService.findById(userId)).thenReturn(user);

        // WHEN + THEN
        mockMvc.perform(delete("/api/user/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(userService, times(1)).findById(userId);
        verify(userService, times(1)).delete(userId);

        // Reset Security Context
        SecurityContextHolder.clearContext();
    }

    @Test
    void delete_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        // GIVEN
        Long userId = 1L;

        when(userService.findById(userId)).thenReturn(null);

        // WHEN + THEN
        mockMvc.perform(delete("/api/user/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).findById(userId);
        verify(userService, never()).delete(userId);
    }

    @Test
    void delete_ShouldReturnBadRequest_WhenIdIsInvalid() throws Exception {
        // WHEN + THEN
        mockMvc.perform(delete("/api/user/{id}", "invalid-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void delete_ShouldReturnUnauthorized_WhenUserIsNotAuthorized() throws Exception {
        // GIVEN
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .email("user@test.com")
                .lastName("Nom")
                .firstName("Prénom")
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Simuler un utilisateur connecté différent
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "otheruser@test.com", "password", Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );

        when(userService.findById(userId)).thenReturn(user);

        // WHEN + THEN
        mockMvc.perform(delete("/api/user/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(userService, times(1)).findById(userId);
        verify(userService, never()).delete(userId);

        SecurityContextHolder.clearContext();
    }
}