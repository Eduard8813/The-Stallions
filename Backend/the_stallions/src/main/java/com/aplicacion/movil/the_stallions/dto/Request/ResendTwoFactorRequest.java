package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class ResendTwoFactorRequest {

    @NotBlank(message = "El desafío es obligatorio")
    private String challengeId;

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }
}
