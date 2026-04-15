package com.ag.repository;

import com.ag.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByActionnaireIdAndResolutionId(Long actionnaireId, Long resolutionId);
    List<Vote> findByResolutionId(Long resolutionId);
    List<Vote> findByActionnaireId(Long actionnaireId);
}
