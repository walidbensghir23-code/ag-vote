package com.ag.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Entité JPA représentant une résolution soumise au vote lors d'une AG.
 *
 * Une résolution est un sujet ou une décision sur lequel les actionnaires doivent voter.
 * Exemples : "Approbation des comptes", "Distribution de dividendes", "Nomination d'un directeur".
 *
 * Chaque résolution appartient à une {@link Entreprise} et a un numéro d'ordre
 * permettant de définir l'ordre du jour de l'AG.
 */
@Entity
@Table(name = "resolutions")
public class Resolution {

    /** Identifiant unique auto-généré */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Titre court et descriptif de la résolution (affiché dans l'interface) */
    @Column(nullable = false)
    private String titre;

    /** Description détaillée de la résolution (contexte, enjeux...) */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Date de l'AG lors de laquelle cette résolution sera votée */
    private LocalDate dateAG;

    /** Numéro d'ordre de la résolution dans l'ordre du jour de l'AG (1, 2, 3...) */
    private Integer ordre;

    /**
     * L'entreprise concernée par cette résolution.
     * Seuls les actionnaires de cette entreprise pourront voter sur cette résolution.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    public Resolution() {}
    public Resolution(Long id, String titre, String description, LocalDate dateAG, Integer ordre, Entreprise entreprise) {
        this.id = id; this.titre = titre; this.description = description;
        this.dateAG = dateAG; this.ordre = ordre; this.entreprise = entreprise;
    }

    public static ResolutionBuilder builder() { return new ResolutionBuilder(); }

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
    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public static class ResolutionBuilder {
        private Long id; private String titre; private String description;
        private LocalDate dateAG; private Integer ordre; private Entreprise entreprise;
        public ResolutionBuilder id(Long id) { this.id = id; return this; }
        public ResolutionBuilder titre(String titre) { this.titre = titre; return this; }
        public ResolutionBuilder description(String desc) { this.description = desc; return this; }
        public ResolutionBuilder dateAG(LocalDate d) { this.dateAG = d; return this; }
        public ResolutionBuilder ordre(Integer o) { this.ordre = o; return this; }
        public ResolutionBuilder entreprise(Entreprise e) { this.entreprise = e; return this; }
        public Resolution build() { return new Resolution(id, titre, description, dateAG, ordre, entreprise); }
    }
}
