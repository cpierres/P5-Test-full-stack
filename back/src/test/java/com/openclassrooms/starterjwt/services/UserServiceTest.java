package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);

        userService = new UserService(userRepository);
    }

    @Test
    void testDelete_UserExists() {
        Long userId = 1L;
        doNothing().when(userRepository).deleteById(userId);

        userService.delete(userId);

        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void testDelete_UserDoesNotExist() {
        Long invalidUserId = 999L;
        doNothing().when(userRepository).deleteById(invalidUserId);

        userService.delete(invalidUserId);

        verify(userRepository, times(1)).deleteById(invalidUserId);
    }

    @Test
    void testFindById_UserExists() {
        Long userId = 1L;
        User user = new User().setId(userId).setFirstName("Prénom").setLastName("Nom").setEmail("prenom.nom@test.com").setPassword("test!1234").setAdmin(false);
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));

        User result = userService.findById(userId);

        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("Prénom", result.getFirstName());
        assertEquals("Nom", result.getLastName());
        assertEquals("prenom.nom@test.com", result.getEmail());
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void testFindById_UserDoesNotExist() {
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty());

        User result = userService.findById(userId);

        assertNull(result);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void testFindById_ThrowsException() {
        Long userId = 1L;
        when(userRepository.findById(userId)).thenThrow(new RuntimeException("Repository exception"));

        Exception exception = assertThrows(RuntimeException.class, () -> userService.findById(userId));

        assertEquals("Repository exception", exception.getMessage());
    }
}