package com.ag.service;

import com.ag.dto.ResolutionDTO;
import com.ag.entity.Entreprise;
import com.ag.entity.Resolution;
import com.ag.repository.EntrepriseRepository;
import com.ag.repository.ResolutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResolutionService {

    private final ResolutionRepository repository;
    private final EntrepriseRepository entrepriseRepository;

    public ResolutionService(ResolutionRepository repository, EntrepriseRepository entrepriseRepository) {
        this.repository = repository;
        this.entrepriseRepository = entrepriseRepository;
    }

    public List<ResolutionDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ResolutionDTO> findByEntreprise(Long entrepriseId) {
        return repository.findByEntrepriseId(entrepriseId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResolutionDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Résolution non trouvée")));
    }

    public ResolutionDTO create(ResolutionDTO dto) {
        Entreprise e = entrepriseRepository.findById(dto.getEntrepriseId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
        Resolution r = Resolution.builder()
                .titre(dto.getTitre()).description(dto.getDescription())
                .dateAG(dto.getDateAG()).ordre(dto.getOrdre()).entreprise(e)
                .build();
        return toDTO(repository.save(r));
    }

    public ResolutionDTO update(Long id, ResolutionDTO dto) {
        Resolution r = repository.findById(id).orElseThrow(() -> new RuntimeException("Résolution non trouvée"));
        r.setTitre(dto.getTitre()); r.setDescription(dto.getDescription());
        r.setDateAG(dto.getDateAG()); r.setOrdre(dto.getOrdre());
        return toDTO(repository.save(r));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public ResolutionDTO toDTO(Resolution r) {
        ResolutionDTO dto = new ResolutionDTO();
        dto.setId(r.getId()); dto.setTitre(r.getTitre());
        dto.setDescription(r.getDescription()); dto.setDateAG(r.getDateAG());
        dto.setOrdre(r.getOrdre());
        dto.setEntrepriseId(r.getEntreprise().getId());
        dto.setEntrepriseNom(r.getEntreprise().getNom());
        return dto;
    }
}
