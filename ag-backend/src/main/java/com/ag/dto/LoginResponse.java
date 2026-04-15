package com.ag.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private Long userId;
    private String nom;
    private String prenom;

    public LoginResponse() {}
    public LoginResponse(String token, String username, String role, Long userId, String nom, String prenom) {
        this.token = token; this.username = username; this.role = role;
        this.userId = userId; this.nom = nom; this.prenom = prenom;
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
}
