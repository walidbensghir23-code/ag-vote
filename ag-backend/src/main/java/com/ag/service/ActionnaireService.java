package com.ag.service;

import com.ag.dto.ActionnaireDTO;
import com.ag.dto.UserDTO;
import com.ag.entity.*;
import com.ag.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActionnaireService {

    private final ActionnaireRepository actionnaireRepository;
    private final UserRepository userRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final PasswordEncoder passwordEncoder;

    public ActionnaireService(ActionnaireRepository actionnaireRepository, UserRepository userRepository,
                               EntrepriseRepository entrepriseRepository, PasswordEncoder passwordEncoder) {
        this.actionnaireRepository = actionnaireRepository;
        this.userRepository = userRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ActionnaireDTO> findAll() {
        return actionnaireRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ActionnaireDTO> findByEntreprise(Long entrepriseId) {
        return actionnaireRepository.findByEntrepriseId(entrepriseId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public ActionnaireDTO create(ActionnaireDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Entreprise entreprise = entrepriseRepository.findById(dto.getEntrepriseId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
        Actionnaire a = Actionnaire.builder()
                .user(user).entreprise(entreprise)
                .nombreActions(dto.getNombreActions())
                .build();
        return toDTO(actionnaireRepository.save(a));
    }

    public ActionnaireDTO update(Long id, ActionnaireDTO dto) {
        Actionnaire a = actionnaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Actionnaire non trouvé"));
        a.setNombreActions(dto.getNombreActions());
        return toDTO(actionnaireRepository.save(a));
    }

    public void delete(Long id) {
        actionnaireRepository.deleteById(id);
    }

    public List<UserDTO> findAvailableUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .map(u -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(u.getId()); dto.setUsername(u.getUsername());
                    dto.setNom(u.getNom()); dto.setPrenom(u.getPrenom());
                    dto.setEmail(u.getEmail()); dto.setRole(u.getRole().name());
                    return dto;
                }).collect(Collectors.toList());
    }

    public UserDTO createUser(UserDTO dto) {
        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.USER)
                .nom(dto.getNom()).prenom(dto.getPrenom()).email(dto.getEmail())
                .build();
        User saved = userRepository.save(user);
        UserDTO result = new UserDTO();
        result.setId(saved.getId()); result.setUsername(saved.getUsername());
        result.setNom(saved.getNom()); result.setPrenom(saved.getPrenom());
        result.setEmail(saved.getEmail()); result.setRole(saved.getRole().name());
        return result;
    }

    public ActionnaireDTO toDTO(Actionnaire a) {
        ActionnaireDTO dto = new ActionnaireDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setUsername(a.getUser().getUsername());
        dto.setUserNom(a.getUser().getNom());
        dto.setUserPrenom(a.getUser().getPrenom());
        dto.setEntrepriseId(a.getEntreprise().getId());
        dto.setEntrepriseNom(a.getEntreprise().getNom());
        dto.setNombreActions(a.getNombreActions());
        return dto;
    }
}
