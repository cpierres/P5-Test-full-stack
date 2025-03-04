package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {

    @Test
    void getAuthorities() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder().build();
        assertNotNull(userDetails.getAuthorities(), "Authorities should not be null");
        assertTrue(userDetails.getAuthorities().isEmpty(), "Authorities should be an empty collection");
    }
}