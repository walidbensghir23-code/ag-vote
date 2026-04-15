package com.ag.security;

import com.ag.entity.User;
import com.ag.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

/**
 * Service Spring Security pour charger les détails d'un utilisateur par son nom d'utilisateur.
 *
 * Implémente l'interface {@link UserDetailsService} requise par Spring Security.
 * Utilisé par {@link JwtAuthFilter} pour récupérer l'utilisateur depuis la base de données
 * lors de la validation d'un token JWT, et par Spring Security pour l'authentification.
 *
 * Le mot de passe haché est automatiquement vérifié par le framework avec BCrypt.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    /** Repository JPA pour accéder aux utilisateurs en base de données */
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Charge un utilisateur par son nom d'utilisateur pour l'authentification Spring Security.
     *
     * Cette méthode est appelée automatiquement par le framework lors de l'authentification.
     * Elle construit un objet {@link UserDetails} Spring à partir de l'entité {@link User}.
     *
     * @param username Le nom d'utilisateur à rechercher
     * @return Un objet UserDetails contenant le username, password et les rôles
     * @throws UsernameNotFoundException si aucun utilisateur n'est trouvé
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));

        // Construction du UserDetails Spring Security avec ROLE_ADMIN ou ROLE_USER
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name()) // Spring ajoute automatiquement le préfixe ROLE_
                .build();
    }
}
