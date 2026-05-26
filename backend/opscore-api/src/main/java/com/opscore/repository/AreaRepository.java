package com.opscore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.opscore.entity.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {

    Optional<Area> findByName(String name);
    boolean existsByName(String name);
}

