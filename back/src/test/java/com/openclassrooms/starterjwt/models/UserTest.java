package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.Test;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private final Validator validator;

    public UserTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        this.validator = factory.getValidator();
    }

    @Test
    void testValidUser() {
        User user = User.builder()
                .email("user@test.com")
                .lastName("Dupont")
                .firstName("Paul")
                .password("test!1234")
                .admin(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertTrue(violations.isEmpty(), "Il ne doit y avoir aucune erreur de validation pour un objet User valide.");
    }

    @Test
    void testEmailInvalid() {
        User user = User.builder()
                .email("invalid-email")
                .lastName("Dupont")
                .firstName("Paul")
                .password("test!1234")
                .admin(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertFalse(violations.isEmpty(), "L'email invalide doit générer une erreur de validation.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")),
                "L'erreur de validation doit concerner le champ email.");
    }

    @Test
    void testLastNameMaxSize() {
        User user = User.builder()
                .email("user@test.com")
                .lastName("DupontDupontDupontDupontDup") // 21 caractères : dépasse taille max de 20
                .firstName("Paul")
                .password("test!1234")
                .admin(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertFalse(violations.isEmpty(), "Le champ lastName ne doit pas dépasser 20 caractères.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("lastName")),
                "L'erreur de validation doit concerner le champ lastName pour dépassement de taille.");
    }

    @Test
    void testFirstNameMaxSize() {
        User user = User.builder()
                .email("user@test.com")
                .lastName("Dupont")
                .firstName("DupontDupontDupontDupontDup") // 21 caractères : dépasse la taille max de 20
                .password("test!1234")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertFalse(violations.isEmpty(), "Le champ firstName ne doit pas dépasser 20 caractères.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("firstName")),
                "L'erreur de validation doit concerner le champ firstName pour dépassement de taille.");
    }

    @Test
    void testPasswordMaxSize() {
        User user = User.builder()
                .email("user@test.com")
                .lastName("Dupont")
                .firstName("Paul")
                .password("P".repeat(121)) // 121 caractères : dépasse la taille max de 120
                .admin(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertFalse(violations.isEmpty(), "Le champ password ne doit pas dépasser 120 caractères.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")),
                "L'erreur de validation doit concerner le champ password pour dépassement de taille.");
    }

    @Test
    void testToStringMethod() {
        User user = User.builder()
                .email("user@test.com")
                .lastName("Dupont")
                .firstName("Paul")
                .password("test!1234")
                .admin(true)
                .build();

        String userString = user.toString();

        assertTrue(userString.contains("user@test.com"), "La méthode toString() doit inclure le champ email.");
        assertTrue(userString.contains("Dupont"), "La méthode toString() doit inclure le champ lastName.");
        assertTrue(userString.contains("Paul"), "La méthode toString() doit inclure le champ firstName.");
    }

    @Test
    void testGetterAndSetter() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setLastName("Durand");
        user.setFirstName("Alice");
        user.setPassword("test!1234");
        user.setAdmin(false);

        assertEquals("user@test.com", user.getEmail(), "Le getter pour email doit renvoyer la valeur correcte.");
        assertEquals("Durand", user.getLastName(), "Le getter pour lastName doit renvoyer la valeur correcte.");
        assertEquals("Alice", user.getFirstName(), "Le getter pour firstName doit renvoyer la valeur correcte.");
        assertEquals("test!1234", user.getPassword(), "Le getter pour password doit renvoyer la valeur correcte.");
        assertFalse(user.isAdmin(), "Le getter pour admin doit renvoyer la valeur correcte.");
    }
}