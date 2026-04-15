package com.ag.config;

// ================================================================
//  SecurityConfig.java — Configuration de la sécurité
// ================================================================
//
//  Ce fichier configure COMMENT Spring Security protège l'application.
//
//  CONCEPTS CLÉS :
//
//  1. STATELESS (sans session)
//     → Il n'y a PAS de session HTTP côté serveur.
//     → L'identité de l'utilisateur est prouvée UNIQUEMENT par le token JWT.
//     → Chaque requête doit contenir le token dans son header.
//     → C'est plus simple et plus scalable qu'une session traditionnelle.
//
//  2. CSRF désactivé
//     → CSRF (Cross-Site Request Forgery) est une attaque sur les cookies de session.
//     → Comme on utilise JWT (pas de cookies), cette protection est inutile.
//     → On la désactive pour simplifier.
//
//  3. CORS configuré
//     → Le navigateur bloque par défaut les requêtes entre domaines différents.
//     → On autorise le frontend React (localhost:5173) à appeler notre API.
//
//  4. Règles d'accès aux routes :
//     /api/auth/**  → PUBLIC (login, register) — pas besoin d'être connecté
//     /api/admin/** → ADMIN seulement (token JWT avec rôle ADMIN requis)
//     /api/user/**  → USER ou ADMIN (token JWT requis)
//     resto         → authentification requise
// ================================================================

import com.ag.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Notre filtre JWT (défini dans JwtAuthFilter.java)
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // ─────────────────────────────────────────────────────────────
    // La chaîne de filtres de sécurité — le cœur de la config
    // ─────────────────────────────────────────────────────────────
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ① Désactiver CSRF (inutile car on utilise JWT, pas de cookies)
            .csrf(AbstractHttpConfigurer::disable)

            // ② Configurer CORS pour autoriser le frontend React
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ③ Mode STATELESS : pas de session HTTP côté serveur
            //    Chaque requête doit apporter son propre token JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ④ Définir les règles d'accès aux endpoints
            .authorizeHttpRequests(auth -> auth
                // Routes publiques — accessibles sans token
                .requestMatchers("/api/auth/**").permitAll()      // login et register
                .requestMatchers("/h2-console/**").permitAll()    // console H2 (base de données)
                .requestMatchers("/uploads/**").permitAll()       // images uploadées

                // Routes réservées aux admins (token JWT avec rôle ADMIN)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Routes pour les utilisateurs connectés (USER ou ADMIN)
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")

                // Toute autre route → authentification requise
                .anyRequest().authenticated()
            )

            // ⑤ Autoriser les iframes (nécessaire pour la console H2)
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))

            // ⑥ Insérer notre filtre JWT AVANT le filtre d'authentification standard
            //    → Notre filtre vérifie le token en premier
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────────
    // Configuration CORS
    // ─────────────────────────────────────────────────────────────
    // CORS = Cross-Origin Resource Sharing
    // On autorise le frontend React (sur le port 5173) à appeler notre API (port 8080)
    // Sans ça, le navigateur bloquerait toutes les requêtes du frontend !
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origines autorisées (les URLs du frontend)
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",  // React en développement (Vite)
            "http://localhost:5174",  // Port alternatif
            "http://localhost:3000"   // React en développement (Create React App)
        ));

        // Méthodes HTTP autorisées
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Headers autorisés (* = tous)
        config.setAllowedHeaders(List.of("*"));

        // Autoriser les cookies et credentials (nécessaire pour certaines configs)
        config.setAllowCredentials(true);

        // Appliquer cette config à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ─────────────────────────────────────────────────────────────
    // Encodeur de mot de passe BCrypt
    // ─────────────────────────────────────────────────────────────
    // BCrypt transforme un mot de passe "123456" en quelque chose comme :
    //   "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    // C'est un hachage irréversible — on ne peut pas retrouver le mot de passe original.
    // Utilisé dans AuthService pour encoder et vérifier les mots de passe.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─────────────────────────────────────────────────────────────
    // Gestionnaire d'authentification
    // ─────────────────────────────────────────────────────────────
    // Spring Security a besoin de ce bean pour l'authentification programmatique.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
