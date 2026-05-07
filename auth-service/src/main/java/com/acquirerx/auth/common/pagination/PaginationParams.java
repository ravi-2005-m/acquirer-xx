package com.acquirerx.auth.common.pagination;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

@Data
public class PaginationParams {

    @Min(value = 0, message = "Page number must be >= 0")
    private Integer page = 0;

    @Min(value = 1, message = "Page size must be >= 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    private Integer size = 20;

    private String sortBy;

    @Pattern(regexp = "^(asc|desc|ASC|DESC)$",
             message = "Sort direction must be 'asc' or 'desc'")
    private String sortDir = "desc";

    public Pageable toPageable() {
        if (sortBy == null || sortBy.isBlank()) {
            return PageRequest.of(page, size);
        }
        Sort.Direction direction = Sort.Direction.fromString(sortDir);
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    public void validateSortField(Set<String> allowedFields) {
        if (sortBy == null || sortBy.isBlank()) {
            return;
        }
        if ("id".equalsIgnoreCase(sortBy)) {
            for (String f : allowedFields) {
                if (f.endsWith("Id")) {
                    sortBy = f;
                    return;
                }
            }
        }
        if (!allowedFields.contains(sortBy)) {
            throw new IllegalArgumentException(
                "Cannot sort by '" + sortBy + "'. Allowed fields: " + allowedFields);
        }
    }
}
