package com.ag.controller;

import com.ag.dto.LoginRequest;
import com.ag.dto.LoginResponse;
import com.ag.dto.RegisterRequest;
import com.ag.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST gérant l'authentification des utilisateurs.
 *
 * Expose deux endpoints publics (accessibles sans token JWT) :
 * - POST /api/auth/login    → connexion avec username/password
 * - POST /api/auth/register → création d'un nouveau compte utilisateur
 *
 * Ces routes sont déclarées publiques dans {@link com.ag.config.SecurityConfig}
 * (requestMatchers("/api/auth/**").permitAll())
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Service métier gérant la logique de login et register */
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint de connexion — POST /api/auth/login
     *
     * Reçoit les identifiants, les vérifie et retourne un token JWT.
     *
     * @param request JSON avec "username" et "password"
     * @return 200 OK avec {@link LoginResponse} contenant le token et les infos user
     *         400 Bad Request si les identifiants sont incorrects
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Endpoint d'inscription — POST /api/auth/register
     *
     * Crée un nouveau compte utilisateur avec le rôle USER
     * et retourne directement un token JWT pour une connexion immédiate.
     *
     * @param request JSON avec "username", "password", "nom", "prenom", "email"
     * @return 200 OK avec {@link LoginResponse} contenant le token du nouveau compte
     *         400 Bad Request si le username est déjà pris
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
