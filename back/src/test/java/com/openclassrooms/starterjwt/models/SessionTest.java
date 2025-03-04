package com.openclassrooms.starterjwt.models;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.Date;
import java.util.Locale;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


@Slf4j
class SessionTest {
    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        Locale.setDefault(Locale.FRENCH);
    }

    @Test
    void whenNameIsBlank_thenValidationFails() {
        Session session = Session.builder()
                .name("") // nom obligatoire
                .description("Description")
                .date(new Date())
                .build();

        Set<ConstraintViolation<Session>> violations = validator.validate(session);

        assertEquals(1, violations.size());
        //assertTrue(violations.iterator().next().getMessage().contains("must not be blank"));
        violations.forEach(violation -> {
            //log.info(violation.getMessage());
            assertTrue(violation.getMessage().contains("ne doit pas être vide") ||
                    violation.getMessage().contains("must not be blank"));
        });
    }

    @Test
    void whenDescriptionExceedsMaxLength_thenValidationFails() {
        String longDescription = "a".repeat(2501); // exceeds max size of 2500

        Session session = Session.builder()
                .name("session yoga")
                .description(longDescription)
                .date(new Date())
                .build();

        Set<ConstraintViolation<Session>> violations = validator.validate(session);

        assertEquals(1, violations.size());
        violations.forEach(violation -> {
            //log.info(violation.getMessage());
            assertEquals("la taille doit être comprise entre 0 et 2500", violation.getMessage());
        });
    }

    @Test
    void whenAllFieldsAreValid_thenValidationSucceeds() {
        Session session = Session.builder()
                .name("Session yoga")
                .description("Description")
                .date(new Date())
                .build();

        Set<ConstraintViolation<Session>> violations = validator.validate(session);

        assertTrue(violations.isEmpty());
    }

}