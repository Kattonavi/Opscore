package com.opscore.controller;

import com.opscore.dto.incident.IncidentPriorityMetricsDTO;
import com.opscore.dto.incident.IncidentStatusMetricsDTO;
import com.opscore.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opscore.dto.AreaMetricsDTO;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor

public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/incidents/status")
    public ResponseEntity<IncidentStatusMetricsDTO>
    getIncidentStatusMetrics() {
        return ResponseEntity.ok(
                dashboardService.getIncidentStatusMetrics()
        );
    }

    @GetMapping("/incidents/priority")
    public ResponseEntity<IncidentPriorityMetricsDTO>
    getIncidentPriorityMetrics() {
        return ResponseEntity.ok(
                dashboardService.getIncidentPriorityMetrics()
        );
    }

    @GetMapping("/incidents/area")
    public ResponseEntity<List<AreaMetricsDTO>>
    getAreaMetrics() {
        return ResponseEntity.ok(
                dashboardService.getAreaMetrics()
        );
    }
}
