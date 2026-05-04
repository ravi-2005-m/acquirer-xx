package com.acquirerx.backend.switchmodule.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.util.MaskingUtil;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.risk.dto.RiskCheckResultDTO;
import com.acquirerx.backend.risk.service.RiskService;
import com.acquirerx.backend.switchmodule.dto.AuthResponseDTO;
import com.acquirerx.backend.switchmodule.dto.AuthorizeRequestDTO;
import com.acquirerx.backend.switchmodule.dto.BatchResponseDTO;
import com.acquirerx.backend.switchmodule.dto.RefundRequestDTO;
import com.acquirerx.backend.switchmodule.dto.TransactionFilterDTO;
import com.acquirerx.backend.switchmodule.dto.VoidRequestDTO;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
import com.acquirerx.backend.switchmodule.entity.Batch;
import com.acquirerx.backend.switchmodule.enums.BatchStatus;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.switchmodule.repository.AuthMessageRepository;
import com.acquirerx.backend.switchmodule.repository.BatchRepository;
import com.acquirerx.backend.terminal.entity.Terminal;
import com.acquirerx.backend.terminal.service.TerminalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SwitchService {

    private final AuthMessageRepository authRepo;
    private final BatchRepository batchRepo;
    private final TerminalService terminalService;
    private final RiskService riskService;
    private final TxnRepository txnRepository;

    public BatchResponseDTO openBatch(Long terminalId) {
        Terminal terminal = terminalService.getEntityById(terminalId);

        batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)
                .ifPresent(b -> {
                    throw new IllegalStateException("Batch already open for terminal: " + terminal.getTid());
                });

        Batch batch = new Batch();
        batch.setTerminal(terminal);
        batch.setStatus(BatchStatus.OPEN);
        batch.setOpenTime(LocalDateTime.now());

        Batch saved = batchRepo.save(batch);
        log.info("Batch opened: id={}, terminal={}", saved.getBatchId(), terminal.getTid());
        return toBatchResponse(saved);
    }

    public BatchResponseDTO closeBatch(Long terminalId) {
        Terminal terminal = terminalService.getEntityById(terminalId);

        Batch batch = batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException("No open batch found for terminal: " + terminal.getTid()));

        batch.setStatus(BatchStatus.CLOSED);
        batch.setCloseTime(LocalDateTime.now());

        Batch saved = batchRepo.save(batch);
        log.info("Batch closed: id={}, terminal={}", saved.getBatchId(), terminal.getTid());
        return toBatchResponse(saved);
    }

    public AuthResponseDTO authorize(AuthorizeRequestDTO dto) {
        Terminal terminal = terminalService.getEntityById(dto.getTerminalId());

        batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException("No open batch for terminal. Please open batch first."));

        Merchant merchant = terminal.getStore().getMerchant();

        RiskCheckResultDTO riskResult = riskService.checkRisk(
            dto.getAmount(),
            dto.getPanMasked(),
            terminal.getTid()
        );

        log.info("Risk check result: result={}, score={}, reason={}",
            riskResult.getResult(), riskResult.getScore(), riskResult.getReason());

        AuthMessage auth = new AuthMessage();
        auth.setTerminal(terminal);
        auth.setMerchant(merchant);
        auth.setAmount(dto.getAmount());
        auth.setCurrency(dto.getCurrency());
        auth.setTxnType(dto.getTxnType() != null ? dto.getTxnType() : "SALE");
        auth.setNetwork("LOCALSIM");

        auth.setPanMasked(MaskingUtil.maskPan(dto.getPanMasked()));

        if ("BLOCK".equals(riskResult.getResult())) {
            auth.setStatus(TxnStatus.DECLINED);
            auth.setAuthCode(null);
            auth.setResponseCode("05");
            auth.setRiskScore(riskResult.getScore());
            auth.setRiskReason(riskResult.getReason());

            log.warn("Transaction BLOCKED by risk engine: amount={}, terminal={}, reason={}",
                dto.getAmount(), terminal.getTid(), riskResult.getReason());
        } else if (dto.getAmount() <= 50000) {
            auth.setStatus(TxnStatus.APPROVED);
            auth.setAuthCode("A" + System.currentTimeMillis());
            auth.setResponseCode("00");
            auth.setRiskScore(riskResult.getScore());
            auth.setRiskReason(riskResult.getReason());

            if ("REVIEW".equals(riskResult.getResult())) {
            log.warn("Transaction APPROVED but flagged for REVIEW: amount={}, terminal={}, reason={}",
                dto.getAmount(), terminal.getTid(), riskResult.getReason());
            }
        } else {
            auth.setStatus(TxnStatus.DECLINED);
            auth.setAuthCode(null);
            auth.setResponseCode("51");
            auth.setRiskScore(riskResult.getScore());
            auth.setRiskReason(riskResult.getReason());
        }

        AuthMessage saved = authRepo.save(auth);
        log.info("Transaction {}: authId={}, amount={}, merchant={}, riskResult={}",
            saved.getStatus(), saved.getAuthId(),
            saved.getAmount(), merchant.getLegalName(),
            riskResult.getResult());

        return toAuthResponse(saved);
    }

        public AuthResponseDTO voidTransaction(VoidRequestDTO dto) {
        AuthMessage original = getAuthEntityById(dto.getOriginalAuthId());

        if (original.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException(
                "Cannot void a non-approved transaction: " + dto.getOriginalAuthId());
        }

        if (!"SALE".equals(original.getTxnType())) {
            throw new IllegalStateException(
                "Cannot void a non-SALE transaction: " + original.getTxnType());
        }

        boolean isSettled = txnRepository.findAll().stream()
            .anyMatch(t -> t.getAuthMessage() != null
                && t.getAuthMessage().getAuthId().equals(dto.getOriginalAuthId())
                && t.isSettled());

        if (isSettled) {
            throw new IllegalStateException(
                "Cannot void a settled transaction. Use refund instead.");
        }

        Terminal terminal = terminalService.getEntityById(dto.getTerminalId());

        batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)
            .orElseThrow(() -> new IllegalStateException(
                "No open batch for terminal. Cannot process void."));

        original.setStatus(TxnStatus.REVERSED);
        authRepo.save(original);

        AuthMessage voidAuth = new AuthMessage();
        voidAuth.setTerminal(terminal);
        voidAuth.setMerchant(original.getMerchant());
        voidAuth.setAmount(original.getAmount());
        voidAuth.setCurrency(original.getCurrency());
        voidAuth.setTxnType("VOID");
        voidAuth.setNetwork("LOCALSIM");
        voidAuth.setPanMasked(original.getPanMasked());
        voidAuth.setStatus(TxnStatus.APPROVED);
        voidAuth.setAuthCode("V" + System.currentTimeMillis());
        voidAuth.setResponseCode("00");
        voidAuth.setOriginalAuthId(dto.getOriginalAuthId());

        AuthMessage saved = authRepo.save(voidAuth);

        log.info("Void processed: voidAuthId={}, originalAuthId={}, amount={}",
            saved.getAuthId(), dto.getOriginalAuthId(), saved.getAmount());

        return toAuthResponse(saved);
        }

        public AuthResponseDTO refundTransaction(RefundRequestDTO dto) {
        AuthMessage original = getAuthEntityById(dto.getOriginalAuthId());

        if (original.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException(
                "Cannot refund a non-approved transaction: " + dto.getOriginalAuthId());
        }

        boolean isSettled = txnRepository.findAll().stream()
            .anyMatch(t -> t.getAuthMessage() != null
                && t.getAuthMessage().getAuthId().equals(dto.getOriginalAuthId())
                && t.isSettled());

        if (!isSettled) {
            throw new IllegalStateException(
                "Transaction is not settled yet. Use void instead.");
        }

        if (dto.getAmount() > original.getAmount()) {
            throw new IllegalArgumentException(
                "Refund amount (" + dto.getAmount() +
                    ") cannot exceed original amount (" + original.getAmount() + ")");
        }

        Terminal terminal = terminalService.getEntityById(dto.getTerminalId());

        batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)
            .orElseThrow(() -> new IllegalStateException(
                "No open batch for terminal. Cannot process refund."));

        AuthMessage refundAuth = new AuthMessage();
        refundAuth.setTerminal(terminal);
        refundAuth.setMerchant(original.getMerchant());
        refundAuth.setAmount(dto.getAmount());
        refundAuth.setCurrency(dto.getCurrency() != null
            ? dto.getCurrency()
            : original.getCurrency());
        refundAuth.setTxnType("REFUND");
        refundAuth.setNetwork("LOCALSIM");
        refundAuth.setPanMasked(original.getPanMasked());
        refundAuth.setStatus(TxnStatus.APPROVED);
        refundAuth.setAuthCode("R" + System.currentTimeMillis());
        refundAuth.setResponseCode("00");
        refundAuth.setOriginalAuthId(dto.getOriginalAuthId());

        AuthMessage saved = authRepo.save(refundAuth);

        log.info("Refund processed: refundAuthId={}, originalAuthId={}, refundAmount={}, originalAmount={}",
            saved.getAuthId(), dto.getOriginalAuthId(),
            dto.getAmount(), original.getAmount());

        return toAuthResponse(saved);
        }

    public PagedResponseDTO<AuthResponseDTO> getAll(int page, int size, String sortBy) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<AuthMessage> authPage = authRepo.findAll(pageRequest);
        Page<AuthResponseDTO> dtoPage = authPage.map(this::toAuthResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuthResponseDTO> getByMerchant(Long merchantId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "txnTime")
        );

        Page<AuthMessage> authPage = authRepo.findByMerchant_MerchantId(merchantId, pageRequest);
        Page<AuthResponseDTO> dtoPage = authPage.map(this::toAuthResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuthResponseDTO> search(
            TransactionFilterDTO filter, int page, int size, String sortBy) {

        TxnStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                statusEnum = TxnStatus.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid status value: " + filter.getStatus() +
                                ". Valid values: APPROVED, DECLINED, REVERSED");
            }
        }

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<AuthMessage> authPage = authRepo.findByFiltersPaged(
                statusEnum,
                filter.getTxnType(),
                filter.getMinAmount(),
                filter.getMaxAmount(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getMerchantId(),
                filter.getTerminalId(),
                filter.getNetwork(),
                pageRequest
        );

        log.info("Transaction search: filters={}, page={}, size={}, total={}",
                filter, page, size, authPage.getTotalElements());

        Page<AuthResponseDTO> dtoPage = authPage.map(this::toAuthResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public List<BatchResponseDTO> getBatchesByTerminal(Long terminalId) {
        Terminal terminal = terminalService.getEntityById(terminalId);
        return batchRepo.findByTerminal(terminal)
                .stream()
                .map(this::toBatchResponse)
                .toList();
    }

    public AuthMessage getAuthEntityById(Long authId) {
        return authRepo.findById(authId)
                .orElseThrow(() -> new IllegalStateException("Auth message not found: " + authId));
    }

    private AuthResponseDTO toAuthResponse(AuthMessage auth) {
        AuthResponseDTO r = new AuthResponseDTO();
        r.setAuthId(auth.getAuthId());
        r.setTxnType(auth.getTxnType());
        r.setAmount(auth.getAmount());
        r.setCurrency(auth.getCurrency());
        r.setAuthCode(auth.getAuthCode());
        r.setResponseCode(auth.getResponseCode());
        r.setNetwork(auth.getNetwork());
        r.setStatus(auth.getStatus() != null ? auth.getStatus().name() : null);
        r.setPanMasked(auth.getPanMasked());
        r.setTxnTime(auth.getTxnTime());
        r.setRiskScore(auth.getRiskScore());
        r.setRiskReason(auth.getRiskReason());
        r.setOriginalAuthId(auth.getOriginalAuthId());

        if (auth.getTerminal() != null) {
            r.setTerminalId(auth.getTerminal().getTerminalId());
            r.setTid(auth.getTerminal().getTid());
        }
        if (auth.getMerchant() != null) {
            r.setMerchantId(auth.getMerchant().getMerchantId());
            r.setMerchantName(auth.getMerchant().getLegalName());
        }
        return r;
    }

    private BatchResponseDTO toBatchResponse(Batch batch) {
        BatchResponseDTO r = new BatchResponseDTO();
        r.setBatchId(batch.getBatchId());
        r.setStatus(batch.getStatus() != null ? batch.getStatus().name() : null);
        r.setOpenTime(batch.getOpenTime());
        r.setCloseTime(batch.getCloseTime());

        if (batch.getTerminal() != null) {
            r.setTerminalId(batch.getTerminal().getTerminalId());
            r.setTid(batch.getTerminal().getTid());

            if (batch.getTerminal().getStore() != null &&
                    batch.getTerminal().getStore().getMerchant() != null) {
                r.setMerchantId(batch.getTerminal().getStore().getMerchant().getMerchantId());
                r.setMerchantName(batch.getTerminal().getStore().getMerchant().getLegalName());
            }
        }
        return r;
    }
}
