package com.ag.dto;

public class EntrepriseDTO {
    private Long id;
    private String nom;
    private String siret;
    private String description;
    private String secteur;
    private String logoUrl;

    public EntrepriseDTO() {}
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
}
