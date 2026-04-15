package com.ag.service;

import com.ag.dto.EntrepriseDTO;
import com.ag.entity.Entreprise;
import com.ag.repository.EntrepriseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntrepriseService {

    private final EntrepriseRepository repository;

    public EntrepriseService(EntrepriseRepository repository) {
        this.repository = repository;
    }

    public List<EntrepriseDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EntrepriseDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Entreprise non trouvée")));
    }

    public EntrepriseDTO create(EntrepriseDTO dto) {
        Entreprise e = Entreprise.builder()
                .nom(dto.getNom()).siret(dto.getSiret())
                .description(dto.getDescription()).secteur(dto.getSecteur())
                .logoUrl(dto.getLogoUrl())
                .build();
        return toDTO(repository.save(e));
    }

    public EntrepriseDTO update(Long id, EntrepriseDTO dto) {
        Entreprise e = repository.findById(id).orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
        e.setNom(dto.getNom()); e.setSiret(dto.getSiret());
        e.setDescription(dto.getDescription()); e.setSecteur(dto.getSecteur());
        e.setLogoUrl(dto.getLogoUrl());
        return toDTO(repository.save(e));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public EntrepriseDTO toDTO(Entreprise e) {
        EntrepriseDTO dto = new EntrepriseDTO();
        dto.setId(e.getId()); dto.setNom(e.getNom());
        dto.setSiret(e.getSiret()); dto.setDescription(e.getDescription());
        dto.setSecteur(e.getSecteur()); dto.setLogoUrl(e.getLogoUrl());
        return dto;
    }
}
