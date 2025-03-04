package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.Test;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TeacherTest {

    private final Validator validator;

    public TeacherTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        this.validator = factory.getValidator();
    }

    @Test
    void testValidTeacher() {
        Teacher teacher = Teacher.builder()
                .lastName("Nom")
                .firstName("Prénom")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<Teacher>> violations = validator.validate(teacher);
        assertTrue(violations.isEmpty(), "Il ne doit y avoir aucune erreur de validation pour un objet Teacher valide."
        );
    }

    @Test
    void testLastNameNotBlank() {
        Teacher teacher = Teacher.builder()
                .lastName("")
                .firstName("Prénom")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<Teacher>> violations = validator.validate(teacher);

        assertFalse(violations.isEmpty(), "lastName ne devrait pas être blanc.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("lastName")),
                "L'erreur de validation doit concerner le champ lastName.");
    }

    @Test
    void testFirstNameNotBlank() {
        Teacher teacher = Teacher.builder()
                .lastName("Nom")
                .firstName("")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<Teacher>> violations = validator.validate(teacher);

        assertFalse(violations.isEmpty(), "Le prénom ne devrait pas être vide.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("firstName")),
                "L'erreur de validation devrait être sur firstName.");
    }

    @Test
    void testLastNameMaxSize() {
        Teacher teacher = Teacher.builder()
                .lastName("A".repeat(21))
                .firstName("Prénom")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<Teacher>> violations = validator.validate(teacher);

        assertFalse(violations.isEmpty(), "Le nom ne devrait pas dépasser 20 car.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("lastName")),
                "Validation error should be on the lastName field for exceeding max size.");
    }

    @Test
    void testFirstNameMaxSize() {
        Teacher teacher = Teacher.builder()
                .lastName("Nom")
                .firstName("A".repeat(21))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Set<ConstraintViolation<Teacher>> violations = validator.validate(teacher);

        assertFalse(violations.isEmpty(), "Le prénom ne devrait pas dépasser 20 car.");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("firstName")),
                "L'erreur de validation devrait e^tre sur le prénom pour taille max excessive");
    }

    @Test
    void testToStringMethod() {
        Teacher teacher = Teacher.builder()
                .lastName("Nom")
                .firstName("Prénom")
                .build();

        String teacherString = teacher.toString();

        assertTrue(teacherString.contains("Nom"), "toString() devrait inclure Nom.");
        assertTrue(teacherString.contains("Prénom"), "toString() devrait inclure Prénom.");
    }

    @Test
    void testGetterAndSetter() {
        Teacher teacher = new Teacher();
        teacher.setLastName("Nom");
        teacher.setFirstName("Prénom");

        assertEquals("Nom", teacher.getLastName(), "Getter pour lastName devrait retourner la valeur correcte.");
        assertEquals("Prénom", teacher.getFirstName(), "Getter pour firstName devrait retourner la valeur correcte.");
    }
}