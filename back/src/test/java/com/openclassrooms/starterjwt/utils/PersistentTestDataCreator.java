package com.openclassrooms.starterjwt.utils;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PersistentTestDataCreator {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    public User createTestUser(String nom, boolean isAdmin) {
        User user = User.builder()
                .email(nom+"@test.com")
                .lastName(nom)
                .firstName("Prénom")
                .password("test!1234")// encryptage non nécessaire pour mes tests
                .admin(isAdmin)
                .build();
        User userSaved = userRepository.save(user);
        userRepository.flush();
        return userSaved;
    }

    public Teacher createTestTeacher(String nom) {
        Teacher entity = Teacher.builder()
                .lastName(nom)
                .firstName("Prénom")
                .build();
        Teacher entitySaved = teacherRepository.save(entity);
        userRepository.flush();
        return entitySaved;
    }

}
