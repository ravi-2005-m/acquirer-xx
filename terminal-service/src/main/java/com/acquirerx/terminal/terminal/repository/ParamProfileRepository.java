package com.acquirerx.terminal.terminal.repository;

import com.acquirerx.terminal.terminal.entity.ParamProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParamProfileRepository extends JpaRepository<ParamProfile, Long> {

    List<ParamProfile> findByStatus(String status);

    boolean existsByName(String name);

    Long countByStatus(String status);
}
