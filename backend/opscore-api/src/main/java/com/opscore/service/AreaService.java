package com.opscore.service;

import com.opscore.dto.AreaResponseDTO;

import java.util.List;

public interface AreaService {
    List<AreaResponseDTO> getAllAreas();
    AreaResponseDTO getAreaById(Long id);
}
