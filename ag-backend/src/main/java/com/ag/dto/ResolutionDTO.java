package com.ag.dto;

import java.time.LocalDate;

public class ResolutionDTO {
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateAG;
    private Integer ordre;
    private Long entrepriseId;
    private String entrepriseNom;

    public ResolutionDTO() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDateAG() { return dateAG; }
    public void setDateAG(LocalDate dateAG) { this.dateAG = dateAG; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
    public Long getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Long entrepriseId) { this.entrepriseId = entrepriseId; }
    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }
}
