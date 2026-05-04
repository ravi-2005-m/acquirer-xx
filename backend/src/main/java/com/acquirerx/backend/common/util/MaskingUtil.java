package com.acquirerx.backend.common.util;

public class MaskingUtil {

    private MaskingUtil() { }

    public static String maskPan(String pan) {

        if (pan == null || pan.length() < 4) {
            return pan;
        }

        String lastFour = pan.substring(pan.length() - 4);

        return "************" + lastFour;
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
