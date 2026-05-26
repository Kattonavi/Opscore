package com.opscore.controller;

import com.opscore.dto.AreaResponseDTO;
import com.opscore.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/areas")
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public ResponseEntity<List<AreaResponseDTO>> getAllAreas() {
        return ResponseEntity.ok(areaService.getAllAreas());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<AreaResponseDTO> getAreaById(@PathVariable Long id) {
        return ResponseEntity.ok(areaService.getAreaById(id));
    }
}
