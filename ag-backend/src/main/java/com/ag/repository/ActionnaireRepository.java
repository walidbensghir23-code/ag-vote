package com.ag.repository;

import com.ag.entity.Actionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ActionnaireRepository extends JpaRepository<Actionnaire, Long> {
    List<Actionnaire> findByEntrepriseId(Long entrepriseId);
    List<Actionnaire> findByUserId(Long userId);
    Optional<Actionnaire> findByUserIdAndEntrepriseId(Long userId, Long entrepriseId);
}
