package com.ag.entity;

import jakarta.persistence.*;

/**
 * Entité JPA représentant le lien entre un {@link User} et une {@link Entreprise}.
 *
 * Un actionnaire possède un certain nombre d'actions dans une entreprise.
 * Ce nombre d'actions détermine le POIDS de son vote : un actionnaire avec
 * 500 actions compte pour 500 voix, contre 200 pour un autre avec 200 actions.
 *
 * Contrainte : un utilisateur ne peut être actionnaire d'une même entreprise qu'une seule fois.
 */
@Entity
@Table(name = "actionnaires")
public class Actionnaire {

    /** Identifiant unique auto-généré */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * L'utilisateur qui est actionnaire.
     * Chargement LAZY pour éviter les requêtes inutiles.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * L'entreprise dans laquelle l'utilisateur est actionnaire.
     * Chargement LAZY pour les performances.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    /**
     * Nombre d'actions détenues par cet actionnaire dans cette entreprise.
     * Ce chiffre est utilisé comme poids de vote.
     */
    @Column(nullable = false)
    private Integer nombreActions;

    public Actionnaire() {}
    public Actionnaire(Long id, User user, Entreprise entreprise, Integer nombreActions) {
        this.id = id; this.user = user; this.entreprise = entreprise; this.nombreActions = nombreActions;
    }

    public static ActionnaireBuilder builder() { return new ActionnaireBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }
    public Integer getNombreActions() { return nombreActions; }
    public void setNombreActions(Integer nombreActions) { this.nombreActions = nombreActions; }

    public static class ActionnaireBuilder {
        private Long id; private User user; private Entreprise entreprise; private Integer nombreActions;
        public ActionnaireBuilder id(Long id) { this.id = id; return this; }
        public ActionnaireBuilder user(User user) { this.user = user; return this; }
        public ActionnaireBuilder entreprise(Entreprise entreprise) { this.entreprise = entreprise; return this; }
        public ActionnaireBuilder nombreActions(Integer nombreActions) { this.nombreActions = nombreActions; return this; }
        public Actionnaire build() { return new Actionnaire(id, user, entreprise, nombreActions); }
    }
}
