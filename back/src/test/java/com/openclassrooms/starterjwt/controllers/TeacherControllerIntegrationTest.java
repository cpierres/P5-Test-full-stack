package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeacherService teacherService;

    @MockBean
    private TeacherMapper teacherMapper;

    @WithMockUser
    @Test
    void whenGetTeacherById_withValidId_shouldReturnTeacherDto() throws Exception {
        Teacher teacher = new Teacher(1L, "Nom", "Prenom", LocalDateTime.now(), LocalDateTime.now());
        TeacherDto teacherDto = new TeacherDto(1L, "Nom", "Prenom", LocalDateTime.now(), LocalDateTime.now());

        Mockito.when(teacherService.findById(anyLong())).thenReturn(teacher);
        Mockito.when(teacherMapper.toDto(teacher)).thenReturn(teacherDto);

        mockMvc.perform(get("/api/teacher/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.lastName").value("Nom"))
                .andExpect(jsonPath("$.firstName").value("Prenom"));
    }

    @WithMockUser
    @Test
    void whenGetTeacherById_withInvalidId_shouldReturnNotFound() throws Exception {
        Mockito.when(teacherService.findById(anyLong())).thenReturn(null);

        mockMvc.perform(get("/api/teacher/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @WithMockUser
    @Test
    void whenGetTeacherById_withMalformedId_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/teacher/abc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @WithMockUser
    @Test
    void whenGetAllTeachers_shouldReturnListOfTeacherDtos() throws Exception {
        Teacher teacher1 = new Teacher(1L, "Nom", "Prenom", LocalDateTime.now(), LocalDateTime.now());
        Teacher teacher2 = new Teacher(2L, "Nom2", "Prénom2", LocalDateTime.now(), LocalDateTime.now());

        List<Teacher> teachers = Arrays.asList(teacher1, teacher2);
        List<TeacherDto> teacherDtos = Arrays.asList(
                new TeacherDto(1L, "Nom", "Prenom", LocalDateTime.now(), LocalDateTime.now()),
                new TeacherDto(2L, "Nom2", "Prénom2", LocalDateTime.now(), LocalDateTime.now())
        );

        Mockito.when(teacherService.findAll()).thenReturn(teachers);
        Mockito.when(teacherMapper.toDto(teachers)).thenReturn(teacherDtos);

        mockMvc.perform(get("/api/teacher")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].lastName").value("Nom"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].lastName").value("Nom2"));
    }
}