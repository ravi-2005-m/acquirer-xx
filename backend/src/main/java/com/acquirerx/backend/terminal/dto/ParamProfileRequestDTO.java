package com.acquirerx.backend.terminal.dto;

import jakarta.validation.constraints.NotBlank;

public class ParamProfileRequestDTO {

    @NotBlank(message = "Profile name is required")
    private String name;

    @NotBlank(message = "Parameters JSON is required")
    private String paramsJson;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParamsJson() {
        return paramsJson;
    }

    public void setParamsJson(String paramsJson) {
        this.paramsJson = paramsJson;
    }
}