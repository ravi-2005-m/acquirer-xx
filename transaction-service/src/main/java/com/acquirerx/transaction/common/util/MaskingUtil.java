package com.acquirerx.transaction.common.util;

public final class MaskingUtil {

    private MaskingUtil() { }

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
        String first6 = clean.substring(0, 6);
        String last4 = clean.substring(len - 4);
        int maskedCount = len - 10;

        return first6 + "*".repeat(maskedCount) + last4;
    }

    public static String maskAll(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "*".repeat(value.length());
    }

    public static boolean looksLikeRawPan(String value) {
        if (value == null) {
            return false;
        }
        String clean = value.replaceAll("[\\s-]", "");
        return clean.matches("^[0-9]{13,19}$");
    }

    public static String maskEmail(String email) {

        if (email == null || !email.contains("@")) {
            return email;
        }

        String[] parts = email.split("@");
        String localPart = parts[0];
        String domain = parts[1];

        if (localPart.length() <= 1) {
            return email;
        }

        String masked = localPart.charAt(0)
                + "*".repeat(localPart.length() - 1);

        return masked + "@" + domain;
    }
}
