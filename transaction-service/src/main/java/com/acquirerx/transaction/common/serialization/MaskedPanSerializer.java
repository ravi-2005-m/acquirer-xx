package com.acquirerx.transaction.common.serialization;

import com.acquirerx.transaction.common.util.MaskingUtil;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;

public class MaskedPanSerializer extends StdSerializer<String> {

    public MaskedPanSerializer() {
        super(String.class);
    }

    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider provider)
            throws IOException {
        gen.writeString(MaskingUtil.maskPan(value));
    }
}
