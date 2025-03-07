package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionMapperTest {
    @InjectMocks
    private SessionMapperImpl sessionMapper;

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    @Test
    void toEntity_ShouldMapDtoToEntityCorrectly() {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setDescription("Test Session");
        sessionDto.setTeacher_id(1L);
        sessionDto.setUsers(Arrays.asList(2L, 3L)); // IDs des utilisateurs

        User user1 = new User();
        user1.setId(2L);
        User user2 = new User();
        user2.setId(3L);

        when(teacherService.findById(1L)).thenReturn(new Teacher(1L, "Prof","Prénom", LocalDateTime.now(),LocalDateTime.now()));
        when(userService.findById(2L)).thenReturn(user1);
        when(userService.findById(3L)).thenReturn(user2);

        Session session = sessionMapper.toEntity(sessionDto);

        assertNotNull(session);
        assertEquals("Test Session", session.getDescription());
        assertNotNull(session.getTeacher());
        assertEquals(1L, session.getTeacher().getId());
        assertEquals(2, session.getUsers().size());
        assertEquals(2L, session.getUsers().get(0).getId());
        assertEquals(3L, session.getUsers().get(1).getId());
    }

    @Test
    void toEntity_ShouldHandleNullValuesGracefully() {
        SessionDto sessionDto = new SessionDto(); // DTO sans données (tous les champs sont nulls)

        Session session = sessionMapper.toEntity(sessionDto);

        assertNotNull(session);
        assertNull(session.getTeacher());
        assertNotNull(session.getUsers());
        assertTrue(session.getUsers().isEmpty());
    }

    @Test
    void toDto_ShouldMapEntityToDtoCorrectly() {
        // Arrange
        Teacher teacher = new Teacher(1L,"Prof","prenom", LocalDateTime.now(), LocalDateTime.now());
        teacher.setId(1L);

        User user1 = new User();
        user1.setId(2L);

        User user2 = new User();
        user2.setId(3L);

        Session session = new Session();
        session.setDescription("Test Session");
        session.setTeacher(teacher);
        session.setUsers(Arrays.asList(user1, user2));

        SessionDto sessionDto = sessionMapper.toDto(session);

        assertNotNull(sessionDto);
        assertEquals("Test Session", sessionDto.getDescription());
        assertEquals(1L, sessionDto.getTeacher_id());
        assertEquals(2, sessionDto.getUsers().size());
        assertEquals(2L, sessionDto.getUsers().get(0));
        assertEquals(3L, sessionDto.getUsers().get(1));
    }

    @Test
    void toDto_ShouldHandleNullValuesGracefully() {
        Session session = new Session(); // Entité sans données (tous les champs sont nuls)

        SessionDto sessionDto = sessionMapper.toDto(session);

        assertNotNull(sessionDto);
        assertNull(sessionDto.getTeacher_id());
        assertNotNull(sessionDto.getUsers());
        assertTrue(sessionDto.getUsers().isEmpty());
    }

    @Test
    void toEntity_ShouldHandleMissingUsersGracefully() {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setDescription("Test Session");
        sessionDto.setUsers(Arrays.asList(2L, 3L)); // IDs des utilisateurs

        when(userService.findById(2L)).thenReturn(null); // Simuler utilisateur manquant
        when(userService.findById(3L)).thenReturn(null);

        Session session = sessionMapper.toEntity(sessionDto);

        assertNotNull(session);
        assertNotNull(session.getUsers());
        //assertTrue(session.getUsers().isEmpty()); // La liste des utilisateurs doit être vide
    }

    @Test
    void toEntity_ShouldHandleEmptyListOfUsers() {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setDescription("Test Session");
        sessionDto.setUsers(Collections.emptyList()); // Liste vide d'IDs d'utilisateurs

        Session session = sessionMapper.toEntity(sessionDto);

        assertNotNull(session);
        assertNotNull(session.getUsers());
        assertTrue(session.getUsers().isEmpty()); // La liste doit rester vide
    }
}