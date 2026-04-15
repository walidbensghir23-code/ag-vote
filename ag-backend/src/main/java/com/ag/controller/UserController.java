package com.ag.controller;

// ================================================================
//  UserController.java — Contrôleur pour les actionnaires (users)
// ================================================================
//
//  Ce contrôleur gère l'espace de l'actionnaire connecté.
//  Toutes les routes commencent par /api/user/
//
//  SÉCURITÉ :
//  → Un token JWT valide est requis (rôle USER ou ADMIN).
//  → L'objet "Principal" est injecté automatiquement par Spring Security.
//    Il contient le username extrait du token JWT.
//    Ainsi on sait exactement qui fait la requête, sans passer l'ID en paramètre.
//
//  FONCTIONNALITÉS :
//  → Consulter les Assemblées Générales disponibles
//  → Voir les résolutions d'une AG
//  → Voter sur une résolution (POUR / CONTRE / NEUTRE)
//  → Consulter son historique de votes
// ================================================================

import com.ag.dto.*;
import com.ag.service.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    // Les services métier nécessaires
    private final AGService agService;
    private final ResolutionService resolutionService;
    private final VoteService voteService;

    // Injection des services via le constructeur
    public UserController(AGService agService,
                          ResolutionService resolutionService,
                          VoteService voteService) {
        this.agService = agService;
        this.resolutionService = resolutionService;
        this.voteService = voteService;
    }


    // ================================================================
    // ASSEMBLÉES GÉNÉRALES — /api/user/ag
    // ================================================================

    // Retourne toutes les AGs disponibles
    // "principal" contient le username de l'utilisateur connecté (extrait du JWT)
    @GetMapping("/ag")
    public List<AssembleeGeneraleDTO> getMyAGs(Principal principal) {
        // principal.getName() → retourne le username depuis le token JWT
        return agService.findAll();
    }

    // Retourne le détail d'une AG (avec ses résolutions)
    @GetMapping("/ag/{id}")
    public AssembleeGeneraleDTO getAG(@PathVariable Long id) {
        return agService.findById(id);
    }


    // ================================================================
    // RÉSOLUTIONS — /api/user/resolutions
    // ================================================================

    // Retourne les résolutions d'une AG spécifique
    // Utilisé pour afficher les résolutions sur la page de vote
    @GetMapping("/resolutions/ag/{agId}")
    public List<ResolutionDTO> getResolutionsByAG(@PathVariable Long agId) {
        // On charge l'AG, puis on retourne sa liste de résolutions
        AssembleeGeneraleDTO ag = agService.findById(agId);
        return ag.getResolutions();
    }


    // ================================================================
    // VOTES — /api/user/vote et /api/user/votes
    // ================================================================

    // Permet à l'actionnaire de voter sur une résolution
    // Le choix possible : POUR, CONTRE, ou NEUTRE
    // Si l'actionnaire a déjà voté → son vote est mis à jour (pas de doublon)
    @PostMapping("/vote")
    public VoteDTO vote(@RequestBody VoteRequest request, Principal principal) {
        // principal.getName() → récupère le username depuis le token JWT
        // C'est grâce au JwtAuthFilter que Principal est renseigné automatiquement
        String username = principal.getName();
        return voteService.vote(username, request);
    }

    // Retourne l'historique de tous les votes de l'utilisateur connecté
    @GetMapping("/votes")
    public List<VoteDTO> getMyVotes(Principal principal) {
        String username = principal.getName(); // username extrait du JWT
        return voteService.findByUser(username);
    }

    // Retourne tous les votes sur une résolution spécifique
    // Permet de voir comment tous les actionnaires ont voté
    @GetMapping("/votes/resolution/{resolutionId}")
    public List<VoteDTO> getVotesByResolution(@PathVariable Long resolutionId) {
        return voteService.findByResolution(resolutionId);
    }
}
