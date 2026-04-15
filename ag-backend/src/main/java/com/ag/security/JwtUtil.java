package com.ag.security;

// ================================================================
//  JwtUtil.java — Utilitaire pour gérer les tokens JWT
// ================================================================
//
//  C'est quoi JWT (JSON Web Token) ?
//  ----------------------------------
//  Un JWT est une chaîne de texte encodée divisée en 3 parties :
//
//    eyJhbGciOiJIUzI1NiJ9   ← HEADER (algorithme de signature)
//    .eyJzdWIiOiJhZG1pbiJ9   ← PAYLOAD (données : username, rôle, expiration)
//    .SflKxwRJSMeKKF2QT4fw   ← SIGNATURE (preuve que le token n'a pas été modifié)
//
//  Ce que fait cette classe :
//  1. generateToken()   → crée un token quand l'utilisateur se connecte
//  2. getUsernameFromToken() → lit le username depuis un token
//  3. validateToken()   → vérifie que le token est valide et pas expiré
//
//  Le token est signé avec une clé secrète (jwtSecret).
//  Sans cette clé, personne ne peut fabriquer un faux token !
// ================================================================

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // ─────────────────────────────────────────────────────────────
    // Configuration lue depuis application.properties
    // ─────────────────────────────────────────────────────────────

    // La clé secrète utilisée pour signer les tokens
    // Exemple dans application.properties : app.jwt.secret=monSecretTresLong64caracteres...
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // Durée de vie du token en millisecondes
    // Exemple : app.jwt.expiration=86400000  (= 86400 secondes = 24 heures)
    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    // ─────────────────────────────────────────────────────────────
    // Méthode privée : créer la clé de signature
    // ─────────────────────────────────────────────────────────────
    // HMAC-SHA256 est l'algorithme utilisé pour signer le token.
    // La clé secrète est convertie en objet SecretKey utilisable par la librairie.
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ─────────────────────────────────────────────────────────────
    // 1. Générer un token JWT
    // ─────────────────────────────────────────────────────────────
    // Appelé par AuthService lors de la connexion réussie.
    // Le token contient :
    //   - "sub" (subject) = le nom d'utilisateur
    //   - "role"          = le rôle (ADMIN ou USER)
    //   - "iat"           = date de création (issued at)
    //   - "exp"           = date d'expiration (dans 24h par défaut)
    // Tout ça est signé avec la clé secrète → personne ne peut falsifier le token.
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)                                          // qui est connecté ?
                .claim("role", role)                                        // quel est son rôle ?
                .issuedAt(new Date())                                       // quand le token a été créé
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration)) // quand il expire
                .signWith(getSigningKey())                                  // signature avec la clé secrète
                .compact();                                                 // convertir en String
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Extraire le nom d'utilisateur depuis un token
    // ─────────────────────────────────────────────────────────────
    // Appelé par JwtAuthFilter pour savoir qui est l'utilisateur.
    // On "parse" (décode) le token en vérifiant d'abord la signature.
    // Si la signature est invalide, une exception est lancée.
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())   // vérifier la signature avec notre clé secrète
                .build()
                .parseSignedClaims(token)      // décoder le token
                .getPayload()
                .getSubject();                 // récupérer le "subject" = username
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Valider un token JWT
    // ─────────────────────────────────────────────────────────────
    // Retourne true  si le token est correct et non expiré
    // Retourne false si le token est :
    //   - mal formé (modifié par quelqu'un)
    //   - expiré (plus de 24h)
    //   - signé avec une mauvaise clé (faux token)
    public boolean validateToken(String token) {
        try {
            // Si le parsing réussit sans exception → token valide ✅
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token invalide, expiré, ou mal formé ❌
            // On retourne false et Spring Security bloquera la requête
            return false;
        }
    }
}
