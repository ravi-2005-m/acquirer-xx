package com.acquirerx.transaction.logging;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PanMaskingConverter extends ClassicConverter {

    private static final Pattern PAN_PATTERN = Pattern.compile("\\b(?:\\d[\\s-]?){13,19}\\b");

    @Override
    public String convert(ILoggingEvent event) {
        String message = event.getFormattedMessage();
        if (message == null) {
            return "";
        }

        Matcher matcher = PAN_PATTERN.matcher(message);
        StringBuffer output = new StringBuffer();

        while (matcher.find()) {
            String matched = matcher.group();
            String digits = matched.replaceAll("[\\s-]", "");
            String replacement = mask(digits);
            matcher.appendReplacement(output, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(output);
        return output.toString();
    }

    private String mask(String digits) {
        if (digits.length() < 13 || digits.length() > 19) {
            return digits;
        }
        String first6 = digits.substring(0, 6);
        String last4 = digits.substring(digits.length() - 4);
        int middle = digits.length() - 10;
        return first6 + "*".repeat(middle) + last4;
    }
}
