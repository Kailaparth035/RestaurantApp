package com.posapp.utils;

import static com.posapp.utils.HexHelper.hexStringToByteArray;

public enum RoninChipHexStringCommand {
  CARD_READER_WAKE_UP("FE30120000E018"),
  SCAN_UID("FE20220002271076C1"),
  CARD_READER_RESET("FE020000000C9A"),
  FIRMWARE_VERSION("FE010000009746"),

  TURN_ON_GREEN_LED("FE10000000FA55"),
  TURN_ON_RED_LED("FE11010000BBD1");

  private final String hexStringRequest;

  RoninChipHexStringCommand(String hexadecimalRequest) {
    this.hexStringRequest = hexadecimalRequest;
  }

  public byte[] getAsByteArray() {
    return hexStringToByteArray(this.hexStringRequest);
  }
}