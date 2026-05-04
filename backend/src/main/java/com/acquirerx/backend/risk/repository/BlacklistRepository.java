package com.acquirerx.backend.risk.repository;

import com.acquirerx.backend.risk.entity.Blacklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlacklistRepository extends JpaRepository<Blacklist, Long> {

    Optional<Blacklist> findByTypeAndValueAndActiveTrue(String type, String value);

    List<Blacklist> findByTypeAndActiveTrue(String type);

    Page<Blacklist> findByTypeAndActiveTrue(String type, Pageable pageable);

    List<Blacklist> findByActiveTrue();

    Page<Blacklist> findByActiveTrue(Pageable pageable);

    Long countByTypeAndActiveTrue(String type);
}
