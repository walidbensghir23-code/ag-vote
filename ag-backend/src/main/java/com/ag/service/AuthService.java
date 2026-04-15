package com.ag.service;

import com.ag.dto.LoginRequest;
import com.ag.dto.LoginResponse;
import com.ag.dto.RegisterRequest;
import com.ag.entity.Role;
import com.ag.entity.User;
import com.ag.repository.UserRepository;
import com.ag.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service gérant l'authentification des utilisateurs (connexion et inscription).
 *
 * Fournit deux opérations principales :
 * - {@link #login} : vérifie les identifiants et génère un token JWT
 * - {@link #register} : crée un nouveau compte utilisateur et retourne un token JWT
 *
 * La séparation de cette logique dans un service dédié permet de garder
 * les contrôleurs légers et de faciliter les tests unitaires.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authentifie un utilisateur avec son nom d'utilisateur et mot de passe.
     *
     * Processus :
     * 1. Recherche de l'utilisateur en base par username
     * 2. Vérification du mot de passe avec BCrypt
     * 3. Génération d'un token JWT valable 24h
     * 4. Retour des informations de session (token + profil)
     *
     * @param request Objet contenant username et password
     * @return {@link LoginResponse} avec le token JWT et les infos de l'utilisateur
     * @throws BadCredentialsException si l'utilisateur n'existe pas ou mot de passe incorrect
     */
    public LoginResponse login(LoginRequest request) {
        // Recherche de l'utilisateur — lève une exception si non trouvé
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Identifiants incorrects"));

        // Vérification du mot de passe (comparaison hash BCrypt)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Identifiants incorrects");
        }

        // Génération du token JWT avec username et rôle
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user.getUsername(), user.getRole().name(),
                user.getId(), user.getNom(), user.getPrenom());
    }

    /**
     * Crée un nouveau compte utilisateur avec le rôle USER par défaut.
     *
     * Processus :
     * 1. Vérifie que le nom d'utilisateur n'est pas déjà pris
     * 2. Hache le mot de passe avec BCrypt
     * 3. Sauvegarde le nouvel utilisateur en base
     * 4. Génère un token JWT pour connexion immédiate après inscription
     *
     * @param request Objet contenant username, password, nom, prénom, email
     * @return {@link LoginResponse} avec le token JWT du nouveau compte
     * @throws RuntimeException si le nom d'utilisateur est déjà utilisé
     */
    public LoginResponse register(RegisterRequest request) {
        // Vérification unicité du username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris");
        }

        // Création de l'utilisateur avec rôle USER et mot de passe haché
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Hachage BCrypt
                .role(Role.USER) // Les nouveaux comptes sont sempre USER (jamais ADMIN)
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .build();

        User saved = userRepository.save(user);

        // Connexion automatique après inscription : génération d'un token immédiat
        String token = jwtUtil.generateToken(saved.getUsername(), saved.getRole().name());
        return new LoginResponse(token, saved.getUsername(), saved.getRole().name(),
                saved.getId(), saved.getNom(), saved.getPrenom());
    }
}
