package com.opscore.repository;

import com.opscore.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByIncidentId(Long incidentId);

    List<Assignment> findByIncidentIdOrderByAssignedAtDesc(Long incidentId);

}


