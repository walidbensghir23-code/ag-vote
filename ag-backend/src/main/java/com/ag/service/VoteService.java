package com.ag.service;

import com.ag.dto.VoteDTO;
import com.ag.dto.VoteRequest;
import com.ag.entity.*;
import com.ag.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service gérant les opérations de vote des actionnaires.
 *
 * Fonctionnalités :
 * - {@link #vote} : enregistre ou met à jour le vote d'un actionnaire sur une résolution
 * - {@link #findByResolution} : liste tous les votes pour une résolution donnée
 * - {@link #findByUser} : liste tous les votes exprimés par un utilisateur
 *
 * Règle métier importante : un actionnaire ne peut voter QU'UNE SEULE FOIS par résolution,
 * mais peut MODIFIER son vote à tout moment (comportement "upsert").
 * De plus, l'actionnaire doit appartenir à l'entreprise concernée par la résolution.
 */
@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final ActionnaireRepository actionnaireRepository;
    private final ResolutionRepository resolutionRepository;
    private final UserRepository userRepository;

    public VoteService(VoteRepository voteRepository, ActionnaireRepository actionnaireRepository,
                       ResolutionRepository resolutionRepository, UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.actionnaireRepository = actionnaireRepository;
        this.resolutionRepository = resolutionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Enregistre ou met à jour le vote d'un actionnaire sur une résolution.
     *
     * Comportement "upsert" :
     * - Si l'actionnaire n'a pas encore voté sur cette résolution → création d'un nouveau vote
     * - Si l'actionnaire a déjà voté → mise à jour de son choix existant
     *
     * Vérifications :
     * - L'utilisateur doit exister en base
     * - La résolution doit exister
     * - L'utilisateur doit être actionnaire de l'entreprise liée à la résolution
     *
     * @param username Le nom d'utilisateur du votant (extrait du token JWT)
     * @param request  Objet contenant l'ID de la résolution et le choix (POUR/CONTRE/NEUTRE)
     * @return {@link VoteDTO} représentant le vote enregistré
     * @throws RuntimeException si l'utilisateur n'est pas actionnaire de l'entreprise
     */
    public VoteDTO vote(String username, VoteRequest request) {
        // Récupération de l'utilisateur connecté
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Récupération de la résolution à voter
        Resolution resolution = resolutionRepository.findById(request.getResolutionId())
                .orElseThrow(() -> new RuntimeException("Résolution non trouvée"));

        // Vérification que l'utilisateur est bien actionnaire de l'entreprise concernée
        Actionnaire actionnaire = actionnaireRepository
                .findByUserIdAndEntrepriseId(user.getId(), resolution.getEntreprise().getId())
                .orElseThrow(() -> new RuntimeException("Vous n'êtes pas actionnaire de cette entreprise"));

        // Upsert : recherche d'un vote existant ou création d'un nouveau
        Vote vote = voteRepository.findByActionnaireIdAndResolutionId(actionnaire.getId(), resolution.getId())
                .orElse(Vote.builder().actionnaire(actionnaire).resolution(resolution).build());

        // Mise à jour du choix (même si c'est un nouveau vote)
        vote.setChoix(request.getChoix());
        return toDTO(voteRepository.save(vote));
    }

    /**
     * Retourne tous les votes exprimés pour une résolution donnée.
     * Utile pour l'admin qui souhaite voir les résultats d'un vote.
     *
     * @param resolutionId L'ID de la résolution
     * @return Liste des votes avec leur poids (nombre d'actions)
     */
    public List<VoteDTO> findByResolution(Long resolutionId) {
        return voteRepository.findByResolutionId(resolutionId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Retourne tous les votes exprimés par un utilisateur connecté.
     * L'utilisateur peut avoir voté dans plusieurs entreprises (plusieurs actionnariats).
     *
     * @param username Le nom de l'utilisateur connecté
     * @return Liste de tous ses votes avec les détails des résolutions
     */
    public List<VoteDTO> findByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Récupération de tous les actionnariats de l'utilisateur
        List<Actionnaire> actionnaires = actionnaireRepository.findByUserId(user.getId());

        // Agrégation de tous les votes de tous ses actionnariats
        return actionnaires.stream()
                .flatMap(a -> voteRepository.findByActionnaireId(a.getId()).stream())
                .map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Convertit une entité {@link Vote} en {@link VoteDTO} pour l'API.
     * Le poids du vote correspond au nombre d'actions de l'actionnaire.
     */
    public VoteDTO toDTO(Vote v) {
        VoteDTO dto = new VoteDTO();
        dto.setId(v.getId());
        dto.setChoix(v.getChoix());
        dto.setActionnaireId(v.getActionnaire().getId());
        dto.setActionnaireNom(v.getActionnaire().getUser().getNom() + " " + v.getActionnaire().getUser().getPrenom());
        dto.setResolutionId(v.getResolution().getId());
        dto.setResolutionTitre(v.getResolution().getTitre());
        dto.setPoids(v.getActionnaire().getNombreActions()); // Poids = nombre d'actions
        return dto;
    }
}
