package com.posapp;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.posapp.utils.HexHelper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RoninChipModuleTest {

    public static final String VALID_SAMPLE_RFID_SCAN_RESPONSE =    "FD20220005008E5F4C3FC004";
    public static final String INVALID_SAMPLE_RFID_SCAN_RESPONSE =  "FD2022000500825F4C3FC004";
    public static final String INVALID_SAMPLE_RFID_SCAN_RESPONSE2 = "FD20220005008E5F4C3FC006";

    public static final String VALID_SAMPLE_RFID_SCAN_RESPONSE2 =   "FD2022000800029B4D61709460E8B2";


    @Test
    @DisplayName("Validate data payload by using CRC")
    void validateBuffer() {
        byte[] data;
        Boolean isValid = false;

        data = HexHelper.hexStringToByteArray(VALID_SAMPLE_RFID_SCAN_RESPONSE);
        isValid = RoninChipModule.validateBuffer(data);
        assertEquals(true, isValid, "Message is complete and valid and because CRC matches");

        data = HexHelper.hexStringToByteArray(INVALID_SAMPLE_RFID_SCAN_RESPONSE);
        isValid = RoninChipModule.validateBuffer(data);
        assertEquals(false, isValid, "Message is incomplete because CRC does not matches");

        data = HexHelper.hexStringToByteArray(INVALID_SAMPLE_RFID_SCAN_RESPONSE2);
        isValid = RoninChipModule.validateBuffer(data);
        assertEquals(false, isValid, "Message is incomplete because CRC does not matches");

        data = HexHelper.hexStringToByteArray(VALID_SAMPLE_RFID_SCAN_RESPONSE2);
        isValid = RoninChipModule.validateBuffer(data);
        assertEquals(true, isValid, "Message is complete and valid and because CRC matches");
    }

    @Test
    @DisplayName("Parse RFID response to extract UID")
    void parseRfidResponse() {
        String parsedUid;

        parsedUid = RoninChipModule.parseRfidResponse(VALID_SAMPLE_RFID_SCAN_RESPONSE);
        assertEquals("008E5F4C3F", parsedUid, "UID should match 008E5F4C3F");

        parsedUid = RoninChipModule.parseRfidResponse(VALID_SAMPLE_RFID_SCAN_RESPONSE2);
        assertEquals("00029B4D61709460", parsedUid, "UID should match 00029B4D61709460");

    }
}