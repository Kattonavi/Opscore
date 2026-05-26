package com.opscore.repository;

import com.opscore.entity.Incident;
import com.opscore.entity.IncidentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentLogRepository extends JpaRepository<IncidentLog, Long> {
    List<IncidentLog> findByIncidentOrderByCreatedAtAsc(Incident incident);
}
