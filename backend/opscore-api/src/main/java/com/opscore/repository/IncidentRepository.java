package com.opscore.repository;

import com.opscore.entity.Incident;
import com.opscore.enums.IncidentStatus;
import com.opscore.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.opscore.dto.AreaMetricsDTO;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {
    long countByStatus(IncidentStatus status);
    long countByPriority(Priority priority);

    @Query("""
       SELECT new com.opscore.dto.AreaMetricsDTO(
            i.area.name,
            COUNT(i)
       )
       FROM Incident i
       GROUP BY i.area.name
       ORDER BY COUNT(i) DESC
       """)
    List<AreaMetricsDTO> countIncidentsByArea();

    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByPriority(Priority priority);
    List<Incident> findByAreaId(Long areaId);
    long countByAreaId(Long areaId);
    List<Incident> findByStatusAndPriority(IncidentStatus status,Priority priority);
}


