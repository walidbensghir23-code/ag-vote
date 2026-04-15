package com.ag.dto;

import java.time.LocalDate;
import java.util.List;

public class AssembleeGeneraleDTO {
    private Long id;
    private String titre;
    private LocalDate date;
    private String description;
    private String lieu;
    private Long entrepriseId;
    private String entrepriseNom;
    private String entrepriseLogoUrl;
    private List<Long> resolutionIds;
    private List<ResolutionDTO> resolutions;

    public AssembleeGeneraleDTO() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }
    public Long getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Long entrepriseId) { this.entrepriseId = entrepriseId; }
    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }
    public String getEntrepriseLogoUrl() { return entrepriseLogoUrl; }
    public void setEntrepriseLogoUrl(String entrepriseLogoUrl) { this.entrepriseLogoUrl = entrepriseLogoUrl; }
    public List<Long> getResolutionIds() { return resolutionIds; }
    public void setResolutionIds(List<Long> resolutionIds) { this.resolutionIds = resolutionIds; }
    public List<ResolutionDTO> getResolutions() { return resolutions; }
    public void setResolutions(List<ResolutionDTO> resolutions) { this.resolutions = resolutions; }
}
