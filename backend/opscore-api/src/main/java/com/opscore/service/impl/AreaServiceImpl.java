package com.opscore.service.impl;

import com.opscore.dto.AreaResponseDTO;
import com.opscore.entity.Area;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.IncidentRepository;
import com.opscore.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final IncidentRepository incidentRepository;

    @Override
    public List<AreaResponseDTO> getAllAreas() {
        return areaRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public AreaResponseDTO getAreaById(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found with id: " + id));
        return toDto(area);
    }

    private AreaResponseDTO toDto(Area area) {
        long count = incidentRepository.countByAreaId(area.getId());
        return AreaResponseDTO.builder()
                .id(area.getId())
                .name(area.getName())
                .description(area.getDescription())
                .color(area.getColor())
                .incidentCount(count)
                .build();
    }
}
