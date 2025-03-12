package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

import org.springframework.test.web.servlet.MockMvc;

public class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private SessionMapper sessionMapper;

    @InjectMocks
    private SessionController sessionController;

    private MockMvc mockMvc;

    public SessionControllerTest() {
        MockitoAnnotations.openMocks(this);
        this.mockMvc = standaloneSetup(sessionController).build();
    }

    @Test
    void findById_ShouldReturnSession_WhenSessionExists() throws Exception {
        // GIVEN
        Long sessionId = 1L;
        Session sessionMock = new Session();
        sessionMock.setId(sessionId);

        SessionDto sessionDtoMock = new SessionDto();
        sessionDtoMock.setId(sessionId);

        when(sessionService.getById(sessionId)).thenReturn(sessionMock);
        when(sessionMapper.toDto(sessionMock)).thenReturn(sessionDtoMock);

        // WHEN + THEN
        mockMvc.perform(get("/api/session/{id}", sessionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId));

        verify(sessionService, times(1)).getById(sessionId);
        verify(sessionMapper, times(1)).toDto(sessionMock);
    }

    @Test
    void findById_ShouldReturnNotFound_WhenSessionDoesNotExist() throws Exception {
        // GIVEN
        Long sessionId = 1L;

        when(sessionService.getById(sessionId)).thenReturn(null);

        // WHEN + THEN
        mockMvc.perform(get("/api/session/{id}", sessionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(sessionService, times(1)).getById(sessionId);
        verifyNoInteractions(sessionMapper);
    }

    @Test
    void findAll_ShouldReturnListOfSessions() throws Exception {
        // GIVEN
        Session session1 = new Session();
        session1.setId(1L);
        Session session2 = new Session();
        session2.setId(2L);

        List<Session> sessions = Arrays.asList(session1, session2);

        SessionDto sessionDto1 = new SessionDto();
        sessionDto1.setId(1L);
        SessionDto sessionDto2 = new SessionDto();
        sessionDto2.setId(2L);

        List<SessionDto> sessionDtos = Arrays.asList(sessionDto1, sessionDto2);

        when(sessionService.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        // WHEN + THEN
        mockMvc.perform(get("/api/session")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));

        verify(sessionService, times(1)).findAll();
        verify(sessionMapper, times(1)).toDto(sessions);
    }

    @Test
    void create_ShouldReturnCreatedSession() throws Exception {
        // GIVEN
        SessionDto sessionDtoRequest = new SessionDto();
        sessionDtoRequest.setName("Session yoga matin");
        sessionDtoRequest.setDescription("Détendu pour la journée !");
        sessionDtoRequest.setDate(new Date());
        sessionDtoRequest.setTeacher_id(1L);

        Teacher teacherMock = new Teacher();
        teacherMock.setId(1L);
        teacherMock.setFirstName("Professeur");
        teacherMock.setLastName("Yogi");

        Session sessionMock = new Session();
        sessionMock.setName("Session yoga matin");
        sessionMock.setDescription("Détendu pour la journée !");
        sessionMock.setDate(sessionDtoRequest.getDate());
        sessionMock.setTeacher(teacherMock); // Relation @OneToOne bien mappée

        SessionDto sessionDtoResponse = new SessionDto();
        sessionDtoResponse.setName("Session yoga matin");
        sessionDtoResponse.setDescription("Détendu pour la journée !");
        sessionDtoResponse.setDate(sessionDtoRequest.getDate());
        sessionDtoResponse.setTeacher_id(1L);

        // Mocking des comportements du mapper et du service
        when(sessionMapper.toEntity(any(SessionDto.class))).thenAnswer(invocation -> {
            SessionDto dto = invocation.getArgument(0);
            return Session.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .date(dto.getDate())
                    .teacher(Teacher.builder().id(dto.getTeacher_id()).build())
                    .build();
        });

        when(sessionService.create(any(Session.class))).thenReturn(sessionMock);
        when(sessionMapper.toDto(any(Session.class))).thenReturn(sessionDtoResponse);

        String sessionRequestJson = "{"
                + "\"name\": \"Session yoga matin\","
                + "\"description\": \"Détendu pour la journée !\","
                + "\"date\": \"2023-12-01T06:00:00.000Z\","
                + "\"teacher_id\": 1"
                + "}";

        // WHEN + THEN
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessionRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Session yoga matin"))
                .andExpect(jsonPath("$.description").value("Détendu pour la journée !"))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.teacher_id").value(1));

        verify(sessionMapper, times(1)).toEntity(any(SessionDto.class));
        verify(sessionService, times(1)).create(any(Session.class));
        verify(sessionMapper, times(1)).toDto(any(Session.class));
    }

    @Test
    void update_ShouldReturnUpdatedSession() throws Exception {
        // GIVEN
        Long sessionId = 1L;

        // Champs obligatoires remplis correctement
        SessionDto sessionDtoRequest = new SessionDto();
        sessionDtoRequest.setName("Session Yoga mise à jour");
        sessionDtoRequest.setDescription("Description modifiée !");
        sessionDtoRequest.setDate(new Date());
        sessionDtoRequest.setTeacher_id(1L);

        Teacher teacherMock = new Teacher();
        teacherMock.setId(1L);
        teacherMock.setFirstName("Professeur");
        teacherMock.setLastName("Yogi");

        Session sessionMock = new Session();
        sessionMock.setId(sessionId);
        sessionMock.setName("Session Yoga mise à jour");
        sessionMock.setDescription("Description modifiée !");
        sessionMock.setDate(sessionDtoRequest.getDate());
        sessionMock.setTeacher(teacherMock);

        SessionDto sessionDtoResponse = new SessionDto();
        sessionDtoResponse.setId(sessionId);
        sessionDtoResponse.setName("Session Yoga mise à jour");
        sessionDtoResponse.setDescription("Description modifiée !");
        sessionDtoResponse.setDate(sessionDtoRequest.getDate());
        sessionDtoResponse.setTeacher_id(1L);

        // Mocking du comportement des mappings et du service
        when(sessionMapper.toEntity(any(SessionDto.class))).thenAnswer(invocation -> {
            SessionDto dto = invocation.getArgument(0);
            return Session.builder()
                    .id(dto.getId())
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .date(dto.getDate())
                    .teacher(Teacher.builder().id(dto.getTeacher_id()).build())
                    .build();
        });

        when(sessionService.update(eq(sessionId), any(Session.class))).thenReturn(sessionMock);
        when(sessionMapper.toDto(any(Session.class))).thenReturn(sessionDtoResponse);

        // JSON rempli avec tous les champs obligatoires
        String sessionRequestJson = "{\n" +
            "  \"name\": \"Session Yoga mise à jour\",\n" +
            "  \"description\": \"Description modifiée !\",\n" +
            "  \"date\": \"2023-12-01T18:00:00.000Z\",\n" +
            "  \"teacher_id\": 1\n" +
            "}";

        // WHEN + THEN
        mockMvc.perform(put("/api/session/{id}", sessionId) // ID dynamique dans l'URL
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessionRequestJson)) // Corps de la requête JSON
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId))
                .andExpect(jsonPath("$.name").value("Session Yoga mise à jour"))
                .andExpect(jsonPath("$.description").value("Description modifiée !"))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.teacher_id").value(1));

        // Vérifications des appels des dépendances
        verify(sessionMapper, times(1)).toEntity(any(SessionDto.class));
        verify(sessionService, times(1)).update(eq(sessionId), any(Session.class));
        verify(sessionMapper, times(1)).toDto(any(Session.class));
    }

    @Test
    void delete_ShouldReturnOk_WhenSessionIsDeleted() throws Exception {
        // GIVEN
        Long sessionId = 1L;

        doNothing().when(sessionService).delete(sessionId);
        when(sessionService.getById(sessionId)).thenReturn(new Session());

        // WHEN + THEN
        mockMvc.perform(delete("/api/session/{id}", sessionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(sessionService, times(1)).delete(sessionId);
    }

    @Test
    void create_ShouldReturnBadRequest_WhenDataIsInvalid() throws Exception {
        // GIVEN
        String invalidSessionRequestJson = "{\n" +
            "  \"name\": \"\",\n" +
            "  \"description\": \"\",\n" +
            "  \"teacher_id\": null,\n" +
            "  \"date\": null\n" +
            "}";

        // WHEN + THEN
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidSessionRequestJson))
                .andExpect(status().isBadRequest());

        // Aucun service ou mapper ne doit être appelé
        // (données validées à l'entrée avec @valid)
        verifyNoInteractions(sessionService);
        verifyNoInteractions(sessionMapper);
    }

    @Test
    void participate_ShouldReturnOk_WhenParticipationIsSuccessful() throws Exception {
        Long sessionId = 1L;
        Long userId = 10L;

        // Simulation : Aucune exception levée par la méthode participate
        doNothing().when(sessionService).participate(sessionId, userId);

        // WHEN + THEN
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Vérification que le service a été appelé avec les bons paramètres
        verify(sessionService, times(1)).participate(sessionId, userId);
    }

    @Test
    void participate_ShouldReturnBadRequest_WhenIdOrUserIdIsInvalid() throws Exception {
        // GIVEN
        String invalidSessionId = "A"; // ID non numérique
        String invalidUserId = "Z"; // ID non numérique

        // WHEN + THEN
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", invalidSessionId, invalidUserId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        // Vérification que le service n'est jamais appelé
        verifyNoInteractions(sessionService);
    }

    @Test
    void noLongerParticipate_ShouldReturnOk_WhenRemoveSuccessful() throws Exception {
        // GIVEN
        Long sessionId = 1L;
        Long userId = 10L;

        // Pas d'exception levée
        doNothing().when(sessionService).noLongerParticipate(sessionId, userId);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Vérification que le service a été appelé avec les bons paramètres
        verify(sessionService, times(1)).noLongerParticipate(sessionId, userId);
    }

    @Test
    void noLongerParticipate_ShouldReturnBadRequest_WhenIdSessionOrUserIdAreInvalid() throws Exception {
        // GIVEN
        String invalidSessionId = "A"; // non numérique
        String invalidUserId = "A";

        // WHEN + THEN
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", invalidSessionId, invalidUserId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        // Vérification que le service n'est jamais appelé
        verifyNoInteractions(sessionService);
    }
}
