package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerIT {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser
    void findById_ShouldReturnUser_WhenUserExists() throws Exception {
        Long userId = 1L;
        User mockUser = User.builder()
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
                mockUser.getCreatedAt(),
                mockUser.getUpdatedAt()
        );

        when(userService.findById(1L)).thenReturn(mockUser);

        mockMvc.perform(get("/api/user/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(userId))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("user@test.com"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Nom"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Prénom"));


        // Vérifie que le service a été appelé
        verify(userService).findById(1L);
    }

    @Test
    @WithMockUser(username = "user@test.com")//un user donné a la possibilité de se supprimer
    void delete_ShouldReturnOk_WhenUserExists() throws Exception {
        Long userId = 1L;
        User mockUser = User.builder()
                .id(userId)
                .email("user@test.com")
                .lastName("Nom")
                .firstName("Prénom")
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userService.findById(userId)).thenReturn(mockUser);

        doNothing().when(userService).delete(userId);

        mockMvc.perform(delete("/api/user/"+userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk());

        verify(userService).delete(userId);
    }

    @Test
    @WithMockUser(username = "toto@test.com") // user connecté non autorisé à supprimer un autre user que lui-même
    void delete_ShouldReturnUnauthorized_WhenUserIsNotAuthorized() throws Exception {
        Long userId = 1L;
        User mockUser = User.builder()
                .id(userId)
                .email("user@test.com")
                .lastName("Nom")
                .firstName("Prénom")
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userService.findById(userId)).thenReturn(mockUser);

        mockMvc.perform(delete("/api/user/"+userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }
}