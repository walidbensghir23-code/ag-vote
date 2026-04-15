package com.ag.entity;

import jakarta.persistence.*;

/**
 * Entité JPA représentant une entreprise inscrite sur la plateforme.
 */
@Entity
@Table(name = "entreprises")
public class Entreprise {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String siret;
    private String description;
    private String secteur;

    /** URL du logo/photo de l'entreprise (lien externe ou base64) */
    @Column(length = 1000)
    private String logoUrl;

    public Entreprise() {}

    public Entreprise(Long id, String nom, String siret, String description, String secteur, String logoUrl) {
        this.id = id; this.nom = nom; this.siret = siret;
        this.description = description; this.secteur = secteur;
        this.logoUrl = logoUrl;
    }

    public static EntrepriseBuilder builder() { return new EntrepriseBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSecteur() { return secteur; }
    public void setSecteur(String secteur) { this.secteur = secteur; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public static class EntrepriseBuilder {
        private Long id; private String nom; private String siret;
        private String description; private String secteur; private String logoUrl;
        public EntrepriseBuilder id(Long id) { this.id = id; return this; }
        public EntrepriseBuilder nom(String nom) { this.nom = nom; return this; }
        public EntrepriseBuilder siret(String siret) { this.siret = siret; return this; }
        public EntrepriseBuilder description(String description) { this.description = description; return this; }
        public EntrepriseBuilder secteur(String secteur) { this.secteur = secteur; return this; }
        public EntrepriseBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public Entreprise build() { return new Entreprise(id, nom, siret, description, secteur, logoUrl); }
    }
}
