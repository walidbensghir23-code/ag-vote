package com.ag.repository;

import com.ag.entity.AssembleeGenerale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AssembleeGeneraleRepository extends JpaRepository<AssembleeGenerale, Long> {
    List<AssembleeGenerale> findByEntrepriseId(Long entrepriseId);

    @Query("SELECT DISTINCT ag FROM AssembleeGenerale ag " +
           "JOIN ag.resolutions r " +
           "JOIN r.entreprise e " +
           "JOIN Actionnaire a ON a.entreprise = e " +
           "WHERE a.user.id = :userId")
    List<AssembleeGenerale> findByActionnaire(@Param("userId") Long userId);
}
