package com.acquirerx.terminal.terminal.controller;

import com.acquirerx.terminal.common.dto.PagedResponseDTO;
import com.acquirerx.terminal.common.enums.Status;
import com.acquirerx.terminal.common.pagination.PaginationParams;
import com.acquirerx.terminal.common.response.ApiResponse;
import com.acquirerx.terminal.terminal.dto.TerminalFilterDTO;
import com.acquirerx.terminal.terminal.dto.TerminalRequestDTO;
import com.acquirerx.terminal.terminal.dto.TerminalResponseDTO;
import com.acquirerx.terminal.terminal.dto.TerminalStatsDTO;
import com.acquirerx.terminal.terminal.service.TerminalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "4. Terminals")
@Validated
public class TerminalController {

    private final TerminalService service;

    @PostMapping("/stores/{storeId:\\d+}/terminals")
    public ApiResponse<TerminalResponseDTO> create(@PathVariable Long storeId,
                                                   @Valid @RequestBody TerminalRequestDTO dto) {
        return new ApiResponse<>("Terminal created", service.create(storeId, dto));
    }

    @GetMapping("/stores/{storeId:\\d+}/terminals")
    public ApiResponse<PagedResponseDTO<TerminalResponseDTO>> getByStore(
            @PathVariable Long storeId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Terminals fetched", service.getByStore(storeId, pagination));
    }

    @GetMapping("/terminals")
    public ApiResponse<PagedResponseDTO<TerminalResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Terminals fetched", service.getAll(pagination));
    }

    @PostMapping("/terminals/search")
    public ApiResponse<PagedResponseDTO<TerminalResponseDTO>> search(
            @Valid @RequestBody TerminalFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Terminals fetched", service.searchTerminals(filter, pagination));
    }

    @GetMapping("/terminals/stats")
    public ApiResponse<TerminalStatsDTO> getStats() {
        return new ApiResponse<>("Terminal stats fetched", service.getTerminalStats());
    }

    @GetMapping("/terminals/{id:\\d+}")
    public ApiResponse<TerminalResponseDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Terminal fetched", service.getTerminalById(id));
    }

    @PutMapping("/terminals/{id:\\d+}")
    public ApiResponse<TerminalResponseDTO> update(@PathVariable Long id,
                                                   @Valid @RequestBody TerminalRequestDTO dto) {
        return new ApiResponse<>("Terminal updated", service.update(id, dto));
    }

    @DeleteMapping("/terminals/{id:\\d+}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return new ApiResponse<>("Terminal deleted", "OK");
    }

    @PatchMapping("/terminals/{id:\\d+}/status")
    public ApiResponse<TerminalResponseDTO> updateStatus(@PathVariable Long id,
                                                         @RequestParam Status newStatus) {
        return new ApiResponse<>("Status updated", service.updateStatus(id, newStatus));
    }
}
