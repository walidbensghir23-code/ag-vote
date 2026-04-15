package com.ag.service;

import com.ag.dto.AssembleeGeneraleDTO;
import com.ag.dto.ResolutionDTO;
import com.ag.entity.AssembleeGenerale;
import com.ag.entity.Entreprise;
import com.ag.entity.Resolution;
import com.ag.repository.AssembleeGeneraleRepository;
import com.ag.repository.EntrepriseRepository;
import com.ag.repository.ResolutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AGService {

    private final AssembleeGeneraleRepository agRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final ResolutionRepository resolutionRepository;
    private final ResolutionService resolutionService;

    public AGService(AssembleeGeneraleRepository agRepository, EntrepriseRepository entrepriseRepository,
                     ResolutionRepository resolutionRepository, ResolutionService resolutionService) {
        this.agRepository = agRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.resolutionRepository = resolutionRepository;
        this.resolutionService = resolutionService;
    }

    public List<AssembleeGeneraleDTO> findAll() {
        return agRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AssembleeGeneraleDTO> findByEntreprise(Long entrepriseId) {
        return agRepository.findByEntrepriseId(entrepriseId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AssembleeGeneraleDTO findById(Long id) {
        return toDTO(agRepository.findById(id).orElseThrow(() -> new RuntimeException("AG non trouvée")));
    }

    public List<AssembleeGeneraleDTO> findByUser(Long userId) {
        return agRepository.findByActionnaire(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AssembleeGeneraleDTO create(AssembleeGeneraleDTO dto) {
        Entreprise e = entrepriseRepository.findById(dto.getEntrepriseId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
        List<Resolution> resolutions = new ArrayList<>();
        if (dto.getResolutionIds() != null) {
            resolutions = resolutionRepository.findAllById(dto.getResolutionIds());
        }
        AssembleeGenerale ag = AssembleeGenerale.builder()
                .titre(dto.getTitre()).date(dto.getDate())
                .description(dto.getDescription()).lieu(dto.getLieu())
                .entreprise(e).resolutions(resolutions)
                .build();
        return toDTO(agRepository.save(ag));
    }

    @Transactional
    public AssembleeGeneraleDTO update(Long id, AssembleeGeneraleDTO dto) {
        AssembleeGenerale ag = agRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AG non trouvée"));
        ag.setTitre(dto.getTitre()); ag.setDate(dto.getDate());
        ag.setDescription(dto.getDescription()); ag.setLieu(dto.getLieu());
        if (dto.getResolutionIds() != null) {
            ag.setResolutions(resolutionRepository.findAllById(dto.getResolutionIds()));
        }
        return toDTO(agRepository.save(ag));
    }

    @Transactional
    public void delete(Long id) {
        agRepository.deleteById(id);
    }

    public AssembleeGeneraleDTO toDTO(AssembleeGenerale ag) {
        AssembleeGeneraleDTO dto = new AssembleeGeneraleDTO();
        dto.setId(ag.getId()); dto.setTitre(ag.getTitre());
        dto.setDate(ag.getDate()); dto.setDescription(ag.getDescription());
        dto.setLieu(ag.getLieu());
        dto.setEntrepriseId(ag.getEntreprise().getId());
        dto.setEntrepriseNom(ag.getEntreprise().getNom());
        dto.setEntrepriseLogoUrl(ag.getEntreprise().getLogoUrl());
        if (ag.getResolutions() != null) {
            dto.setResolutionIds(ag.getResolutions().stream().map(Resolution::getId).collect(Collectors.toList()));
            dto.setResolutions(ag.getResolutions().stream().map(resolutionService::toDTO).collect(Collectors.toList()));
        }
        return dto;
    }
}
