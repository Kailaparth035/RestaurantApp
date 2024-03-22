package com.posapp.utils;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class HexHelperTest {

    public static final String SAMPLE_RFID_SCAN_RESPONSE_WITHOUT_CRC = "FD20220005008E5F4C3F"; // crc: 0xC004
    public static final String SAMPLE_RFID_SCAN_RESPONSE_WITHOUT_CRC2 = "FD2022000800029B4D61709460"; // crc: 0xE8B2

    @Test
    @DisplayName("Compute CRC")
    void computeCRC16() {
        byte[] data;
        int computedCrc;

        data = HexHelper.hexStringToByteArray(SAMPLE_RFID_SCAN_RESPONSE_WITHOUT_CRC);
        computedCrc = HexHelper.crc16(data);
        assertEquals(0xC004, computedCrc, "CRC computed should match expected 0xC004");

        data = HexHelper.hexStringToByteArray(SAMPLE_RFID_SCAN_RESPONSE_WITHOUT_CRC2);
        computedCrc = HexHelper.crc16(data);
        assertEquals(0xE8B2, computedCrc, "CRC computed should match expected 0xE8B2");
    }

    @Test
    @DisplayName("Convert hexstring to Ascii")
    void convertHexStringToAscii() {
        String hexString = "312e332e30e663";
        String converted = HexHelper.hexStringToAscii(hexString);
        assertEquals("1.3.0", converted, "Int decimal should match expected ");
    }
}