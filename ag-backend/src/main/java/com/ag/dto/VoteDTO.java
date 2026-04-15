package com.ag.dto;

import com.ag.entity.Choix;

public class VoteDTO {
    private Long id;
    private Long actionnaireId;
    private String actionnaireNom;
    private Long resolutionId;
    private String resolutionTitre;
    private Choix choix;
    private Integer poids;

    public VoteDTO() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getActionnaireId() { return actionnaireId; }
    public void setActionnaireId(Long actionnaireId) { this.actionnaireId = actionnaireId; }
    public String getActionnaireNom() { return actionnaireNom; }
    public void setActionnaireNom(String actionnaireNom) { this.actionnaireNom = actionnaireNom; }
    public Long getResolutionId() { return resolutionId; }
    public void setResolutionId(Long resolutionId) { this.resolutionId = resolutionId; }
    public String getResolutionTitre() { return resolutionTitre; }
    public void setResolutionTitre(String resolutionTitre) { this.resolutionTitre = resolutionTitre; }
    public Choix getChoix() { return choix; }
    public void setChoix(Choix choix) { this.choix = choix; }
    public Integer getPoids() { return poids; }
    public void setPoids(Integer poids) { this.poids = poids; }
}
