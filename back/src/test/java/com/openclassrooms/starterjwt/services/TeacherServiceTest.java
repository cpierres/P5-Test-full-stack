package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static java.util.Optional.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TeacherServiceTest {
    private TeacherRepository teacherRepository;
    private TeacherService teacherService;

    @BeforeEach
    void setUp() {
        teacherRepository = mock(TeacherRepository.class);
        teacherService = new TeacherService(teacherRepository);
    }

    @AfterEach
    void tearDown() {
    }

    @Test
    void findAll() {
        List<Teacher> teachers = List.of(
                new Teacher().setId(1L).setFirstName("Prenom1").setLastName("Nom1"),
                new Teacher().setId(2L).setFirstName("Prenom2").setLastName("Nom2")
        );
        when(teacherRepository.findAll()).thenReturn(teachers);

        List<Teacher> result = teacherService.findAll();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Prenom1", result.get(0).getFirstName());
        assertEquals("Prenom2", result.get(1).getFirstName());
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    void findAllEmpty() {
        when(teacherRepository.findAll()).thenReturn(List.of());

        List<Teacher> result = teacherService.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    void findAllThrowsException() {
        when(teacherRepository.findAll()).thenThrow(new RuntimeException("Repository exception"));

        Exception exception = assertThrows(RuntimeException.class, () -> teacherService.findAll());

        assertEquals("Repository exception", exception.getMessage());
    }

    @Test
    void findByIdReturnsTeacher() {
        Teacher teacher = new Teacher().setId(1L).setFirstName("Prenom").setLastName("Nom");
        when(teacherRepository.findById(1L)).thenReturn(of(teacher));

        Teacher result = teacherService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Prenom", result.getFirstName());
        assertEquals("Nom", result.getLastName());
        verify(teacherRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdReturnsNull() {
        when(teacherRepository.findById(1L)).thenReturn(empty());

        Teacher result = teacherService.findById(1L);

        assertNull(result);
        verify(teacherRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdThrowsException() {
        when(teacherRepository.findById(1L)).thenThrow(new RuntimeException("Repository exception"));

        Exception exception = assertThrows(RuntimeException.class, () -> teacherService.findById(1L));

        assertEquals("Repository exception", exception.getMessage());
    }
}