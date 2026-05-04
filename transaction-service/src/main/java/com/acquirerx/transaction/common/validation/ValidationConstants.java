package com.acquirerx.transaction.common.validation;

public final class ValidationConstants {

    private ValidationConstants() {
    }

    public static final int DEFAULT_PAGE_MIN = 0;
    public static final int DEFAULT_PAGE_SIZE_MIN = 1;
    public static final int DEFAULT_PAGE_SIZE_MAX = 1000;

    public static final String CURRENCY_REGEX = "^[A-Z]{3}$";
    public static final String REGION_REGEX = "^(NA|EU|APAC|LATAM)$";
    public static final String NETWORK_REGEX = "^(V|M|U|LOCALSIM|LocalSim)$";
    public static final String TXN_STATUS_REGEX = "^(APPROVED|DECLINED|REVERSED|PENDING)$";
    public static final String TXN_TYPE_REGEX = "^(SALE|VOID|REFUND)$";
    public static final String FEE_NETWORK_REGEX = "^(V|M|U|LocalSim)$";
    public static final String FEE_REGION_REGEX = "^(NA|EU|APAC|LATAM)$";
}
