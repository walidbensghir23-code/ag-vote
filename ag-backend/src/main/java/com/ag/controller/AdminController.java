package com.ag.controller;

// ================================================================
//  AdminController.java — Contrôleur réservé aux administrateurs
// ================================================================
//
//  Ce contrôleur gère toutes les opérations CRUD pour l'admin.
//  Toutes les routes commencent par /api/admin/
//
//  SÉCURITÉ :
//  → Seul un utilisateur avec le token JWT contenant le rôle ADMIN
//    peut accéder à ces routes. Spring Security bloque automatiquement
//    les autres utilisateurs avec une erreur 403 Forbidden.
//
//  ROUTES DISPONIBLES :
//  ┌─────────────────────────────────────────────────────────────┐
//  │ Entreprises  │ GET/POST/PUT/DELETE /api/admin/entreprises   │
//  │ Actionnaires │ GET/POST/PUT/DELETE /api/admin/actionnaires  │
//  │ Résolutions  │ GET/POST/PUT/DELETE /api/admin/resolutions   │
//  │ AGs          │ GET/POST/PUT/DELETE /api/admin/ag            │
//  │ Utilisateurs │ GET/POST            /api/admin/users         │
//  └─────────────────────────────────────────────────────────────┘
// ================================================================

import com.ag.dto.*;
import com.ag.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // Les services métier injectés (chacun gère une entité)
    private final EntrepriseService entrepriseService;
    private final ActionnaireService actionnaireService;
    private final ResolutionService resolutionService;
    private final AGService agService;

    // Injection des services via le constructeur
    public AdminController(EntrepriseService entrepriseService,
                           ActionnaireService actionnaireService,
                           ResolutionService resolutionService,
                           AGService agService) {
        this.entrepriseService = entrepriseService;
        this.actionnaireService = actionnaireService;
        this.resolutionService = resolutionService;
        this.agService = agService;
    }


    // ================================================================
    // ENTREPRISES — /api/admin/entreprises
    // ================================================================

    // Retourne la liste de toutes les entreprises
    // Appelé par : GET http://localhost:8080/api/admin/entreprises
    @GetMapping("/entreprises")
    public List<EntrepriseDTO> getEntreprises() {
        return entrepriseService.findAll();
    }

    // Retourne une entreprise par son ID
    // Exemple : GET http://localhost:8080/api/admin/entreprises/1
    @GetMapping("/entreprises/{id}")
    public EntrepriseDTO getEntreprise(@PathVariable Long id) {
        return entrepriseService.findById(id);
    }

    // Crée une nouvelle entreprise
    // Le corps JSON de la requête est mappé sur EntrepriseDTO
    @PostMapping("/entreprises")
    public EntrepriseDTO createEntreprise(@RequestBody EntrepriseDTO dto) {
        return entrepriseService.create(dto);
    }

    // Met à jour une entreprise existante
    // {id} dans l'URL + les nouvelles données dans le corps JSON
    @PutMapping("/entreprises/{id}")
    public EntrepriseDTO updateEntreprise(@PathVariable Long id, @RequestBody EntrepriseDTO dto) {
        return entrepriseService.update(id, dto);
    }

    // Supprime une entreprise par son ID
    // Retourne 204 No Content si suppression réussie
    @DeleteMapping("/entreprises/{id}")
    public ResponseEntity<Void> deleteEntreprise(@PathVariable Long id) {
        entrepriseService.delete(id);
        return ResponseEntity.noContent().build(); // code HTTP 204
    }


    // ================================================================
    // ACTIONNAIRES — /api/admin/actionnaires
    // ================================================================
    // Un "actionnaire" est le lien entre un User et une Entreprise
    // avec le nombre d'actions qu'il possède.

    // Retourne tous les actionnaires (toutes entreprises confondues)
    @GetMapping("/actionnaires")
    public List<ActionnaireDTO> getActionnaires() {
        return actionnaireService.findAll();
    }

    // Retourne les actionnaires d'une entreprise spécifique
    @GetMapping("/actionnaires/entreprise/{id}")
    public List<ActionnaireDTO> getByEntreprise(@PathVariable Long id) {
        return actionnaireService.findByEntreprise(id);
    }

    // Crée un nouvel actionnaire (lier un utilisateur à une entreprise)
    @PostMapping("/actionnaires")
    public ActionnaireDTO createActionnaire(@RequestBody ActionnaireDTO dto) {
        return actionnaireService.create(dto);
    }

    // Met à jour le nombre d'actions d'un actionnaire
    @PutMapping("/actionnaires/{id}")
    public ActionnaireDTO updateActionnaire(@PathVariable Long id, @RequestBody ActionnaireDTO dto) {
        return actionnaireService.update(id, dto);
    }

    // Supprime le lien actionnaire (l'utilisateur et l'entreprise restent)
    @DeleteMapping("/actionnaires/{id}")
    public ResponseEntity<Void> deleteActionnaire(@PathVariable Long id) {
        actionnaireService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Retourne tous les utilisateurs (pour la liste déroulante dans le formulaire)
    @GetMapping("/users")
    public List<UserDTO> getAvailableUsers() {
        return actionnaireService.findAvailableUsers();
    }

    // Crée un nouvel utilisateur avec le rôle USER
    @PostMapping("/users")
    public UserDTO createUser(@RequestBody UserDTO dto) {
        return actionnaireService.createUser(dto);
    }


    // ================================================================
    // RÉSOLUTIONS — /api/admin/resolutions
    // ================================================================
    // Une résolution est un sujet soumis au vote dans une AG.
    // Exemple : "Approuver le budget 2025"

    // Retourne toutes les résolutions
    @GetMapping("/resolutions")
    public List<ResolutionDTO> getResolutions() {
        return resolutionService.findAll();
    }

    // Retourne les résolutions d'une entreprise spécifique
    @GetMapping("/resolutions/entreprise/{id}")
    public List<ResolutionDTO> getResolutionsByEntreprise(@PathVariable Long id) {
        return resolutionService.findByEntreprise(id);
    }

    // Retourne une résolution par son ID
    @GetMapping("/resolutions/{id}")
    public ResolutionDTO getResolution(@PathVariable Long id) {
        return resolutionService.findById(id);
    }

    // Crée une nouvelle résolution
    @PostMapping("/resolutions")
    public ResolutionDTO createResolution(@RequestBody ResolutionDTO dto) {
        return resolutionService.create(dto);
    }

    // Met à jour une résolution existante
    @PutMapping("/resolutions/{id}")
    public ResolutionDTO updateResolution(@PathVariable Long id, @RequestBody ResolutionDTO dto) {
        return resolutionService.update(id, dto);
    }

    // Supprime une résolution
    @DeleteMapping("/resolutions/{id}")
    public ResponseEntity<Void> deleteResolution(@PathVariable Long id) {
        resolutionService.delete(id);
        return ResponseEntity.noContent().build();
    }


    // ================================================================
    // ASSEMBLÉES GÉNÉRALES — /api/admin/ag
    // ================================================================
    // Une AG regroupe une entreprise, une date, un lieu, et des résolutions.

    // Retourne toutes les AGs
    @GetMapping("/ag")
    public List<AssembleeGeneraleDTO> getAGs() {
        return agService.findAll();
    }

    // Retourne une AG par son ID (avec ses résolutions incluses)
    @GetMapping("/ag/{id}")
    public AssembleeGeneraleDTO getAG(@PathVariable Long id) {
        return agService.findById(id);
    }

    // Retourne les AGs d'une entreprise spécifique
    @GetMapping("/ag/entreprise/{id}")
    public List<AssembleeGeneraleDTO> getAGsByEntreprise(@PathVariable Long id) {
        return agService.findByEntreprise(id);
    }

    // Crée une nouvelle AG avec les résolutions sélectionnées
    @PostMapping("/ag")
    public AssembleeGeneraleDTO createAG(@RequestBody AssembleeGeneraleDTO dto) {
        return agService.create(dto);
    }

    // Met à jour une AG (date, lieu, résolutions...)
    @PutMapping("/ag/{id}")
    public AssembleeGeneraleDTO updateAG(@PathVariable Long id, @RequestBody AssembleeGeneraleDTO dto) {
        return agService.update(id, dto);
    }

    // Supprime une AG
    @DeleteMapping("/ag/{id}")
    public ResponseEntity<Void> deleteAG(@PathVariable Long id) {
        agService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
