package com.ag.dto;

public class ActionnaireDTO {
    private Long id;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String username;
    private Long entrepriseId;
    private String entrepriseNom;
    private Integer nombreActions;

    public ActionnaireDTO() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNom() { return userNom; }
    public void setUserNom(String userNom) { this.userNom = userNom; }
    public String getUserPrenom() { return userPrenom; }
    public void setUserPrenom(String userPrenom) { this.userPrenom = userPrenom; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Long getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Long entrepriseId) { this.entrepriseId = entrepriseId; }
    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }
    public Integer getNombreActions() { return nombreActions; }
    public void setNombreActions(Integer nombreActions) { this.nombreActions = nombreActions; }
}
