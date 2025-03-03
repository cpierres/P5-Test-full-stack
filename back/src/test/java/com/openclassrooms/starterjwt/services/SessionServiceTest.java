package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class SessionServiceTest {
    private SessionService sessionService;
    private SessionRepository sessionRepository; // mocké
    private UserRepository userRepository; // mocké

    @BeforeEach
    void setUp() {
        sessionRepository = Mockito.mock(SessionRepository.class);
        userRepository = Mockito.mock(UserRepository.class);

        sessionService = new SessionService(sessionRepository, userRepository);
    }

    @AfterEach
    void tearDown() {
        Mockito.reset(sessionRepository, userRepository);
    }

    @Test
    void participate_ShouldAddUserToSession_WhenValidIdsAreProvided() {
        Long sessionId = 1L;
        Long userId = 2L;

        User user = new User();
        user.setId(userId);

        Session session = new Session();
        session.setId(sessionId);
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // any(Session.class) est un matcher de Mockito indiquant que la méthode save()
        // acceptera n'importe quel objet de type Session comme argument.
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // appeler méthode métier participate :
        sessionService.participate(sessionId, userId);

        // Assert
        verify(sessionRepository, times(1)).save(session);
        assertTrue(session.getUsers().contains(user));
    }

    @Test
    void participate_ShouldThrowNotFoundException_WhenSessionDoesNotExist() {
        Long sessionId = 1L;
        Long userId = 2L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.participate(sessionId, userId));
    }

    @Test
    void participate_ShouldThrowNotFoundException_WhenUserDoesNotExist() {
        Long sessionId = 1L;
        Long userId = 2L;

        Session session = new Session();
        session.setId(sessionId);
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.participate(sessionId, userId));
    }

    @Test
    void participate_ShouldThrowBadRequestException_WhenUserAlreadyParticipates() {
        Long sessionId = 1L;
        Long userId = 2L;

        User user = new User();
        user.setId(userId);

        Session session = new Session();
        session.setId(sessionId);
        session.setUsers(new ArrayList<>());
        session.getUsers().add(user);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> sessionService.participate(sessionId, userId));
    }

    @Test
    void noLongerParticipate_ShouldRemoveUserFromSession_WhenValidIdsAreProvided() {
        Long sessionId = 1L;
        Long userId = 2L;

        User user = new User();
        user.setId(userId);

        Session session = new Session();
        session.setId(sessionId);
        session.setUsers(new ArrayList<>());
        session.getUsers().add(user);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        sessionService.noLongerParticipate(sessionId, userId);

        verify(sessionRepository, times(1)).save(session);
        assertFalse(session.getUsers().contains(user));
    }

    @Test
    void noLongerParticipate_ShouldThrowNotFoundException_WhenSessionDoesNotExist() {
        Long sessionId = 1L;
        Long userId = 2L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(sessionId, userId));
    }

    @Test
    void noLongerParticipate_ShouldThrowBadRequestException_WhenUserDoesNotParticipate() {
        Long sessionId = 1L;
        Long userId = 2L;

        User user = new User();
        user.setId(userId);

        Session session = new Session();
        session.setId(sessionId);
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(sessionId, userId));
    }
    @Test
    void create_ShouldSaveSession_WhenValidSessionProvided() {
        Session session = new Session();
        session.setName("Cours Yoga matin");

        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        Session savedSession = sessionService.create(session);

        verify(sessionRepository, times(1)).save(session);
        assertNotNull(savedSession);
        assertEquals("Cours Yoga matin", savedSession.getName());
    }

    @Test
    void create_ShouldThrowException_WhenSessionIsNull() {
        //curieux car j'ai dû retourner explicitement un IllegalArgumentException dans sessionService.create
        //alors que théoriquement create aurait dû savoir le faire seul.
        assertThrows(IllegalArgumentException.class, () -> sessionService.create(null));
    }

    @Test
    void delete_ShouldDeleteSession_WhenValidIdProvided() {
        Long sessionId = 1L;

        //ne fait rien (pas de suppression) ...
        doNothing().when(sessionRepository).deleteById(sessionId);

        sessionService.delete(sessionId);

        // ... sauf vérifié que cette méthode a bien été invoquée une fois
        verify(sessionRepository, times(1)).deleteById(sessionId);
    }

    @Test
    void delete_ShouldThrowNotFoundException_WhenSessionDoesNotExist() {
        //id censé ne pas exister
        Long sessionId = 1L;

        // configure le mock sessionRepository pour lancer NotFoundException lorsqu'on appelle
        // sa méthode deleteById avec l'ID spécifié
        doThrow(new NotFoundException()).when(sessionRepository).deleteById(sessionId);

        // teste que l'appel à sessionService.delete(..) est bien capable de lancer une exception de type
        // NotFoundException
        assertThrows(NotFoundException.class, () -> sessionService.delete(sessionId));
    }

    @Test
    void findAll_ShouldReturnAllSessions_WhenRepositoryContainsSessions() {
        List<Session> sessions = List.of(new Session().setId(1L).setName("Session 1"),
                new Session().setId(2L).setName("Session 2"));

        when(sessionRepository.findAll()).thenReturn(sessions);

        List<Session> result = sessionService.findAll();

        assertEquals(2, result.size());
        assertEquals("Session 1", result.get(0).getName());
        assertEquals("Session 2", result.get(1).getName());
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    void findAll_ShouldReturnEmptyList_WhenNoSessionsExist() {
        when(sessionRepository.findAll()).thenReturn(List.of());

        List<Session> result = sessionService.findAll();

        assertTrue(result.isEmpty());
        verify(sessionRepository, times(1)).findAll();
    }
    @Test
    void getById_ShouldReturnSession_WhenValidIdIsProvided() {
        Long sessionId = 1L;
        Session session = new Session().setId(sessionId).setName("Test Session");

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(sessionId);

        assertNotNull(result);
        assertEquals("Test Session", result.getName());
        verify(sessionRepository, times(1)).findById(sessionId);
    }

    @Test
    void getById_ShouldReturnNull_WhenSessionDoesNotExist() {
        Long sessionId = 1L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        Session result = sessionService.getById(sessionId);

        assertNull(result);
        verify(sessionRepository, times(1)).findById(sessionId);
    }
}