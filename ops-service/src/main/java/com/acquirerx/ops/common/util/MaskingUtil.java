package com.acquirerx.ops.common.util;

public final class MaskingUtil {

    private MaskingUtil() {
    }

    public static String maskPan(String pan) {
        if (pan == null || pan.isBlank()) {
            return pan;
        }

        String clean = pan.replaceAll("[\\s-]", "");

        if (clean.contains("*") || clean.contains("X")) {
            return clean;
        }

        if (!clean.matches("^[0-9]{13,19}$")) {
            return maskAll(clean);
        }

        int len = clean.length();
        return clean.substring(0, 6) + "*".repeat(len - 10) + clean.substring(len - 4);
    }

    public static String maskAll(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "*".repeat(value.length());
    }
}
