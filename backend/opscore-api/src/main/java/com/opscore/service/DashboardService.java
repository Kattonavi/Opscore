package com.opscore.service;

import com.opscore.dto.AreaMetricsDTO;
import com.opscore.dto.incident.IncidentPriorityMetricsDTO;
import com.opscore.dto.incident.IncidentStatusMetricsDTO;

import java.util.List;

public interface DashboardService {
    IncidentStatusMetricsDTO getIncidentStatusMetrics();
    IncidentPriorityMetricsDTO getIncidentPriorityMetrics();
    List<AreaMetricsDTO> getAreaMetrics();

}
