package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class VerifyTwoFactorRequest {

    @NotBlank(message = "El desafío es obligatorio")
    private String challengeId;

    @NotBlank(message = "El código es obligatorio")
    private String code;

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
