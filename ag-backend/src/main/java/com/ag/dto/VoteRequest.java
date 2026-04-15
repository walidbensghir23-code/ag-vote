package com.ag.dto;

import com.ag.entity.Choix;

public class VoteRequest {
    private Long resolutionId;
    private Choix choix;

    public VoteRequest() {}
    public Long getResolutionId() { return resolutionId; }
    public void setResolutionId(Long resolutionId) { this.resolutionId = resolutionId; }
    public Choix getChoix() { return choix; }
    public void setChoix(Choix choix) { this.choix = choix; }
}
