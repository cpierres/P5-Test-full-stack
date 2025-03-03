package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class SessionServiceTest {

    @Test
    void participate_ShouldAddUserToSession_WhenValidIdsAreProvided() {
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

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
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

        Long sessionId = 1L;
        Long userId = 2L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.participate(sessionId, userId));
    }

    @Test
    void participate_ShouldThrowNotFoundException_WhenUserDoesNotExist() {
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

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
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

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
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

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
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

        Long sessionId = 1L;
        Long userId = 2L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(sessionId, userId));
    }

    @Test
    void noLongerParticipate_ShouldThrowBadRequestException_WhenUserDoesNotParticipate() {
        SessionRepository sessionRepository = mock(SessionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);

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
}