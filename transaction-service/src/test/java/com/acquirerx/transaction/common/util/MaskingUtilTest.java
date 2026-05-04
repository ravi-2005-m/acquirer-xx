package com.acquirerx.transaction.common.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MaskingUtilTest {

    @Test
    void maskPan_standardPan_returnsFirst6Last4() {
        assertEquals("453201******0366", MaskingUtil.maskPan("4532015112830366"));
    }

    @Test
    void maskPan_shortPan_masksMiddle() {
        assertEquals("453201***2830", MaskingUtil.maskPan("4532015112830"));
    }

    @Test
    void maskPan_longPan_masksMiddle() {
        assertEquals("453201*********4366", MaskingUtil.maskPan("4532015112839994366"));
    }

    @Test
    void maskPan_alreadyMasked_returnsUnchanged() {
        assertEquals("453201******0366", MaskingUtil.maskPan("453201******0366"));
    }

    @Test
    void maskPan_withSpaces_stripsAndMasks() {
        assertEquals("453201******0366", MaskingUtil.maskPan("4532 0151 1283 0366"));
    }

    @Test
    void maskPan_withDashes_stripsAndMasks() {
        assertEquals("453201******0366", MaskingUtil.maskPan("4532-0151-1283-0366"));
    }

    @Test
    void maskPan_null_returnsNull() {
        assertNull(MaskingUtil.maskPan(null));
    }

    @Test
    void maskPan_blank_returnsBlank() {
        assertEquals("", MaskingUtil.maskPan(""));
    }

    @Test
    void looksLikeRawPan_validPan_returnsTrue() {
        assertTrue(MaskingUtil.looksLikeRawPan("4532015112830366"));
    }

    @Test
    void looksLikeRawPan_masked_returnsFalse() {
        assertFalse(MaskingUtil.looksLikeRawPan("453201******0366"));
    }

    @Test
    void looksLikeRawPan_nonNumeric_returnsFalse() {
        assertFalse(MaskingUtil.looksLikeRawPan("not a pan"));
    }
}
