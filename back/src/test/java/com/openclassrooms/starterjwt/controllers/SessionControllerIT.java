package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.SessionService;
import com.openclassrooms.starterjwt.utils.PersistentTestDataCreator;
import lombok.extern.slf4j.Slf4j;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc // Configure automatiquement MockMvc
class SessionControllerIT {

    @Autowired
    private MockMvc mockMvc; // Fournit un client HTTP pour l'intégration

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    //@Spy SOUTENANCE : pas possible car pas de contructeur sans arg
    private SessionService sessionService; // Service utilisé pour créer des données de test

    @Autowired
    private PersistentTestDataCreator testDataCreator;

    @Test
    @WithMockUser
    @Transactional
    void findById_ShouldReturnSession_WhenSessionExists() throws Exception {
        Session session = createSessionViaSessionService();
        log.info("Date session retour entité  : {}", session.getDate().toString());
        
        //date au format ISO 8601 en UTC (qui est celui après sérialisation json en tenant compte juste des heures et minutes)
        //Soutenance : DIFFICULTE POUR COMPARAISON DE DATE
        String expectedDateForJson = session.getDate().toInstant().toString().substring(0, 16);
        log.info("Date session UTC (sans les secondes) : {}", expectedDateForJson);

        mockMvc.perform(get("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(session.getId().intValue())))
                .andExpect(jsonPath("$.name", is(session.getName())))
                .andExpect(jsonPath("$.description", is(session.getDescription())))
                //soutenance : pb ci-dessous si teacher non flushé au préalable
                .andExpect(jsonPath("$.teacher_id", is(session.getTeacher().getId().intValue())))
                //.andExpect(jsonPath("$.date",is(session.getDate().toString()))
                //.andExpect(jsonPath("$.date",is(session.getDate().toInstant().toString()))
                //.andExpect(jsonPath("$.date",
                //    is(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(session.getDate())))
                .andExpect(jsonPath("$.date", Matchers.startsWith(expectedDateForJson)));
    }

    private Session createSessionViaSessionService() {
        // Créer une session de test via le service
        Teacher teacher = testDataCreator.createTestTeacher("prof1");

        Session session = Session.builder()
                .name("Session yoga")
                .description("Description session yoga")
                .teacher(teacher)
                .date(new Date())
                .build();

        return sessionService.create(session);
    }

    @Test
    @WithMockUser
    @Transactional
    void findAll_ShouldReturnListOfSessions() throws Exception {
        //on crée 2 Sessions via Service puis on teste le GET /api/session
        createSessionViaSessionService();
        createSessionViaSessionService();

        mockMvc.perform(get("/api/session")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @WithMockUser
    @Transactional
    void create_WhenSessionDtoIsValid_ShouldReturnCreatedSession() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Session yoga matin");
        sessionDto.setDescription("Description session yoga matin");
        sessionDto.setTeacher_id(1L);
        sessionDto.setDate(new Date());

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto))) // Convertir DTO en JSON
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Session yoga matin")))
                .andExpect(jsonPath("$.description", is("Description session yoga matin")))
                .andExpect(jsonPath("$.teacher_id", is(1)))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.updatedAt", notNullValue()));
    }

    @Test
    @WithMockUser
    void create_WhenSessionDtoIsInvalid_ShouldReturnError() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Session yoga matin");
        sessionDto.setDescription("Description session yoga matin");
        //attributs obligatoires manquant
        //sessionDto.setTeacher_id(1L);
        //sessionDto.setDate(new Date());

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());

        //SOUTENANCE : pas possible car @Spy ne peut pas s'appliquer étant donné que SessionService n'a pas de
        // constructeur sans arg
        //verify(sessionService, never()).create(org.mockito.ArgumentMatchers.any(Session.class));
    }

    @Test
    @WithMockUser
    @Transactional
    void update_WhenSessionDtoIsValid_ShouldReturnUpdatedSession() throws Exception {
        // Créer une session initiale via le service
        Session session = createSessionViaSessionService();

        //DTO pour mise à jour
        SessionDto updatedDto = new SessionDto();
        updatedDto.setName("Nom session mis à jour");
        updatedDto.setDescription(session.getDescription());
        updatedDto.setTeacher_id(session.getTeacher().getId());
        updatedDto.setDate(new Date());

        String expectedDateForJson = updatedDto.getDate().toInstant().toString().substring(0, 16);
        log.info("Date session UTC (sans les secondes) : {}", expectedDateForJson);

        mockMvc.perform(put("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is(updatedDto.getName())))
                .andExpect(jsonPath("$.description", is(session.getDescription())))
                .andExpect(jsonPath("$.teacher_id", is(session.getTeacher().getId().intValue())))
                .andExpect(jsonPath("$.date", Matchers.startsWith(expectedDateForJson)));
    }

    @Test
    @WithMockUser
    @Transactional
    void update_WhenSessionDtoIsInvalid_ShouldReturnBadRequest() throws Exception {
        // Créer une session initiale via le service
        Session session = createSessionViaSessionService();

        //DTO incomplet pour mise à jour
        SessionDto updatedDto = new SessionDto();
        updatedDto.setName("Nom session mis à jour");
        updatedDto.setDescription(session.getDescription());
        //updatedDto.setTeacher_id(session.getTeacher().getId());
        //updatedDto.setDate(new Date());

        mockMvc.perform(put("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @Transactional
    void delete_ShouldReturnOk_WhenSessionExists() throws Exception {
        // Créer une session à supprimer
        Session session = createSessionViaSessionService();

        mockMvc.perform(delete("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @Transactional
    void delete_ShouldReturnError_EvenIfSessionExistsWithParticipant() throws Exception {
        // Créer une session à supprimer
        Session session = createSessionViaSessionService();
        session.setUsers(new ArrayList<>());

        //inscrire un user sur cette session
        User user = testDataCreator.createTestUser("user", false);
        sessionService.participate(session.getId(), user.getId());

        //supprimer cette session avec un participant est possible
        mockMvc.perform(delete("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_ShouldReturnNotFound_WhenSessionNotExists() throws Exception {

        mockMvc.perform(delete("/api/session/99999999999999999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
   @Transactional //soutenance si je retire le rollback pour commit, on voit erreur par rapport au User non flushé
    void participate_ShouldReturnOk_WhenParticipationIsSuccessful() throws Exception {
        User user = testDataCreator.createTestUser("user", false);
        Long userId = user.getId();

        // Créer une session
        Session session = createSessionViaSessionService();
        // SOUTENANCE : si je n'initialise pas un tableau vide, j'ai une NPE dans le service en ligne 56
        // sur session.getUsers(). Certainement dû à JPA/HIBERNATE (puisque le TU fonctionne) mais je ne trouve
        // pas cela normal. Mentor : quelle explication ?
        // est-ce une bonne solution de devoir faire cela ? ou dois-je par exemple corriger le code de l'entité
        // pour consolider ?
        session.setUsers(new ArrayList<>());

        assertNotNull(session.getId(), "La session n'a pas été enregistrée correctement");
        assertNotNull(userId, "L'utilisateur n'a pas été enregistré correctement");

        // Appel du contrôleur pour ajouter une participation
        mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @Transactional
    //soutenance : pas d'intérêt car déja fait dans TU (plus rapidement)
    void participate_ShouldReturnNotFound_WhenNonExistingUser() throws Exception {
        Session session = createSessionViaSessionService();

        Long userId = 9999999L; // ID utilisateur inexistant

        // Appel du contrôleur pour ajouter une participation
        mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

//    @Test
//    @WithMockUser
//    @Transactional
//    //soutenance : pas d'intérêt car déja fait dans TU (plus rapidement)
//    void participate_ShouldReturnNotFound_WhenNonExistingSession() throws Exception {
//        // Créons une session et un utilisateur fictif
//        Session session = createSessionViaSessionService();
//
//        Long userId = 9999999L; // ID utilisateur inexistant
//
//        // Appel du contrôleur pour ajouter une participation
//        mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + userId)
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isNotFound());
//    }

    @Test
    @WithMockUser
    @Transactional
    void noLongerParticipate_ShouldReturnOk_WhenRemoveSuccessful() throws Exception {
        Session session = createSessionViaSessionService();
        session.setUsers(new ArrayList<>());//voir avec mentor si bonne solution ?

        User user = testDataCreator.createTestUser("user1",false);
        Long userId = user.getId();

        sessionService.participate(session.getId(), userId); // Ajouter la participation

        // Appel du contrôleur pour supprimer la participation
        mockMvc.perform(delete("/api/session/" + session.getId() + "/participate/" + userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    //mentor : pas d'intérêt puisque TU plus rapide ?
    void findById_ShouldReturnBadRequest_WhenIdIsInvalid() throws Exception {
        mockMvc.perform(get("/api/session/invalid-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}