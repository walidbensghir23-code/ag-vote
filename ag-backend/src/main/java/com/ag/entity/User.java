package com.ag.entity;

import jakarta.persistence.*;

/**
 * Entité JPA représentant un utilisateur de la plateforme.
 *
 * Un utilisateur peut avoir le rôle ADMIN (gestionnaire) ou USER (actionnaire).
 * Il peut être lié à plusieurs entreprises via la table {@link Actionnaire}.
 */
@Entity
@Table(name = "users")
public class User {

    /** Identifiant unique auto-généré en base de données */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom d'utilisateur unique utilisé pour la connexion */
    @Column(unique = true, nullable = false)
    private String username;

    /** Mot de passe haché (BCrypt) — jamais stocké en clair */
    @Column(nullable = false)
    private String password;

    /** Rôle de l'utilisateur : ADMIN ou USER (voir enum {@link Role}) */
    @Enumerated(EnumType.STRING)
    private Role role;

    /** Nom de famille de l'utilisateur */
    private String nom;

    /** Prénom de l'utilisateur */
    private String prenom;

    /** Adresse email de l'utilisateur */
    private String email;

    public User() {}

    public User(Long id, String username, String password, Role role, String nom, String prenom, String email) {
        this.id = id; this.username = username; this.password = password;
        this.role = role; this.nom = nom; this.prenom = prenom; this.email = email;
    }

    public static UserBuilder builder() { return new UserBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    /** Builder pour faciliter la création d'instances User (remplace Lombok @Builder) */
    public static class UserBuilder {
        private Long id; private String username; private String password;
        private Role role; private String nom; private String prenom; private String email;
        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder nom(String nom) { this.nom = nom; return this; }
        public UserBuilder prenom(String prenom) { this.prenom = prenom; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public User build() { return new User(id, username, password, role, nom, prenom, email); }
    }
}
