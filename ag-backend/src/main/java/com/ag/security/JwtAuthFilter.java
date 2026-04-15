package com.ag.security;

// ================================================================
//  JwtAuthFilter.java — Filtre de vérification JWT
// ================================================================
//
//  COMMENT ÇA MARCHE ?
//  --------------------
//  Ce filtre est exécuté AUTOMATIQUEMENT avant chaque requête HTTP.
//  Il intercepte la requête, vérifie le token JWT, et décide si
//  l'utilisateur est autorisé à accéder à la ressource.
//
//  FLUX DE VÉRIFICATION (pour chaque requête) :
//
//  [Navigateur] → requête HTTP avec header "Authorization: Bearer <token>"
//       ↓
//  [JwtAuthFilter] → extrait le token du header
//       ↓
//  [JwtUtil] → vérifie la signature et la date d'expiration
//       ↓ (si valide)
//  [UserDetailsService] → charge l'utilisateur depuis la base de données
//       ↓
//  [SecurityContext] → enregistre l'utilisateur comme "authentifié"
//       ↓
//  [Contrôleur] → traite la requête normalement
//
//  Si le token est absent ou invalide :
//    → La requête continue SANS authentification
//    → Spring Security bloquera les routes protégées avec une erreur 401
//
//  "OncePerRequestFilter" = ce filtre s'exécute UNE SEULE FOIS par requête
// ================================================================

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // On a besoin de 2 services pour vérifier le token :
    private final JwtUtil jwtUtil;                        // pour valider le token
    private final UserDetailsServiceImpl userDetailsService; // pour charger l'utilisateur en base

    // Injection des dépendances via le constructeur (bonne pratique Spring)
    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // ─────────────────────────────────────────────────────────────
    // Méthode principale : vérification du token à chaque requête
    // ─────────────────────────────────────────────────────────────
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ÉTAPE 1 : Lire le header "Authorization" de la requête HTTP
        // Exemple de header : Authorization: Bearer eyJhbGci...
        String authHeader = request.getHeader("Authorization");

        // ÉTAPE 2 : Vérifier si le header existe et commence par "Bearer "
        // Si non → on saute la vérification (la requête continue sans auth)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            // ÉTAPE 3 : Extraire le token (supprimer les 7 premiers caractères "Bearer ")
            String token = authHeader.substring(7);

            // ÉTAPE 4 : Valider le token avec JwtUtil
            // (vérifie la signature et la date d'expiration)
            if (jwtUtil.validateToken(token)) {

                // ÉTAPE 5 : Extraire le username depuis le token
                String username = jwtUtil.getUsernameFromToken(token);

                // ÉTAPE 6 : Charger l'utilisateur complet depuis la base de données
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // ÉTAPE 7 : Créer l'objet d'authentification Spring Security
                // Cet objet contient : le username, ses rôles (ADMIN/USER)
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,                    // l'utilisateur
                                null,                           // pas de mot de passe (déjà vérifié via JWT)
                                userDetails.getAuthorities()    // les rôles (ROLE_ADMIN, ROLE_USER...)
                        );

                // Ajouter les détails de la requête (adresse IP, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // ÉTAPE 8 : Enregistrer l'authentification dans le contexte de sécurité
                // Après ça, Spring Security considère cet utilisateur comme connecté ✅
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            // Si validateToken() retourne false → on ne fait rien
            // Spring Security bloquera lui-même la requête si la route est protégée
        }

        // ÉTAPE 9 : Passer la requête au filtre suivant (ou au contrôleur)
        // Cette ligne est OBLIGATOIRE sinon la requête est bloquée ici
        filterChain.doFilter(request, response);
    }
}
