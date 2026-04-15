package com.ag.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Entité JPA représentant une Assemblée Générale (AG).
 *
 * Une AG est une réunion officielle des actionnaires d'une {@link Entreprise}
 * au cours de laquelle ils votent sur une liste de {@link Resolution}.
 *
 * La relation entre AG et Résolutions est Many-to-Many (une AG contient
 * plusieurs résolutions, et une résolution peut théoriquement appartenir à plusieurs AGs).
 * Une table de jointure `ag_resolutions` est créée automatiquement par JPA.
 */
@Entity
@Table(name = "assemblees_generales")
public class AssembleeGenerale {

    /** Identifiant unique auto-généré */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Titre descriptif de l'AG (ex: "AG Ordinaire 2024 - TechInnovation SA") */
    @Column(nullable = false)
    private String titre;

    /** Date à laquelle se déroule l'AG */
    private LocalDate date;

    /** Description du contexte et objectifs de l'AG */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Lieu physique ou virtuel de l'AG (ex: "Siège social - Paris 8ème") */
    private String lieu;

    /**
     * L'entreprise qui organise cette AG.
     * Seuls les actionnaires de cette entreprise y sont conviés.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    /**
     * Liste des résolutions à voter lors de cette AG.
     * EAGER : chargé immédiatement avec l'AG pour éviter le problème
     * de session JPA fermée (LazyInitializationException).
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "ag_resolutions",
        joinColumns = @JoinColumn(name = "ag_id"),
        inverseJoinColumns = @JoinColumn(name = "resolution_id")
    )
    private List<Resolution> resolutions;

    public AssembleeGenerale() {}
    public AssembleeGenerale(Long id, String titre, LocalDate date, String description, String lieu, Entreprise entreprise, List<Resolution> resolutions) {
        this.id = id; this.titre = titre; this.date = date; this.description = description;
        this.lieu = lieu; this.entreprise = entreprise; this.resolutions = resolutions;
    }

    public static AGBuilder builder() { return new AGBuilder(); }

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
    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }
    public List<Resolution> getResolutions() { return resolutions; }
    public void setResolutions(List<Resolution> resolutions) { this.resolutions = resolutions; }

    public static class AGBuilder {
        private Long id; private String titre; private LocalDate date;
        private String description; private String lieu;
        private Entreprise entreprise; private List<Resolution> resolutions;
        public AGBuilder id(Long id) { this.id = id; return this; }
        public AGBuilder titre(String titre) { this.titre = titre; return this; }
        public AGBuilder date(LocalDate date) { this.date = date; return this; }
        public AGBuilder description(String d) { this.description = d; return this; }
        public AGBuilder lieu(String l) { this.lieu = l; return this; }
        public AGBuilder entreprise(Entreprise e) { this.entreprise = e; return this; }
        public AGBuilder resolutions(List<Resolution> r) { this.resolutions = r; return this; }
        public AssembleeGenerale build() {
            return new AssembleeGenerale(id, titre, date, description, lieu, entreprise, resolutions);
        }
    }
}
