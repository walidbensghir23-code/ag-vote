package com.ag.repository;

import com.ag.entity.Resolution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResolutionRepository extends JpaRepository<Resolution, Long> {
    List<Resolution> findByEntrepriseId(Long entrepriseId);
}
