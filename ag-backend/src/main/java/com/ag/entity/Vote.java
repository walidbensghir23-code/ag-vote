package com.ag.entity;

import jakarta.persistence.*;

/**
 * Entité JPA représentant un vote exprimé par un actionnaire sur une résolution.
 *
 * Un vote lie un {@link Actionnaire} à une {@link Resolution} avec un choix parmi :
 * POUR, CONTRE ou NEUTRE (voir enum {@link Choix}).
 *
 * Contrainte d'unicité : un actionnaire ne peut voter qu'UNE SEULE FOIS par résolution.
 * Si l'actionnaire revote, son vote précédent est mis à jour (upsert dans {@link com.ag.service.VoteService}).
 *
 * Le poids du vote est calculé dynamiquement à partir du nombre d'actions de l'actionnaire.
 */
@Entity
@Table(name = "votes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"actionnaire_id", "resolution_id"}))
public class Vote {

    /** Identifiant unique auto-généré */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * L'actionnaire qui exprime ce vote.
     * Son nombre d'actions détermine le poids du vote.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actionnaire_id", nullable = false)
    private Actionnaire actionnaire;

    /** La résolution sur laquelle porte ce vote */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolution_id", nullable = false)
    private Resolution resolution;

    /** Le choix exprimé : POUR, CONTRE ou NEUTRE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Choix choix;

    public Vote() {}
    public Vote(Long id, Actionnaire actionnaire, Resolution resolution, Choix choix) {
        this.id = id; this.actionnaire = actionnaire; this.resolution = resolution; this.choix = choix;
    }

    public static VoteBuilder builder() { return new VoteBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Actionnaire getActionnaire() { return actionnaire; }
    public void setActionnaire(Actionnaire actionnaire) { this.actionnaire = actionnaire; }
    public Resolution getResolution() { return resolution; }
    public void setResolution(Resolution resolution) { this.resolution = resolution; }
    public Choix getChoix() { return choix; }
    public void setChoix(Choix choix) { this.choix = choix; }

    public static class VoteBuilder {
        private Long id; private Actionnaire actionnaire; private Resolution resolution; private Choix choix;
        public VoteBuilder id(Long id) { this.id = id; return this; }
        public VoteBuilder actionnaire(Actionnaire a) { this.actionnaire = a; return this; }
        public VoteBuilder resolution(Resolution r) { this.resolution = r; return this; }
        public VoteBuilder choix(Choix c) { this.choix = c; return this; }
        public Vote build() { return new Vote(id, actionnaire, resolution, choix); }
    }
}
