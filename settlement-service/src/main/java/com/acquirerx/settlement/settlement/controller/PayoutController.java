package com.acquirerx.settlement.settlement.controller;

import com.acquirerx.settlement.common.response.ApiResponse;
import com.acquirerx.settlement.settlement.entity.Payout;
import com.acquirerx.settlement.settlement.service.PayoutService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payout")
@RequiredArgsConstructor
@Tag(name = "7. Settlement")
public class PayoutController {

    private final PayoutService service;

    @PostMapping("/{settlementId:\\d+}")
    public ApiResponse<Payout> payout(@PathVariable Long settlementId) {
        return new ApiResponse<>("Payout processed", service.processPayout(settlementId));
    }

    @PostMapping("/async/{settlementId:\\d+}")
    public ApiResponse<String> payoutAsync(@PathVariable Long settlementId) {
        service.processPayoutAsync(settlementId);
        return new ApiResponse<>("Payout Started", settlementId.toString());
    }
}
