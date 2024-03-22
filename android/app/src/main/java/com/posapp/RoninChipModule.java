package com.posapp;

import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.posapp.utils.Colors;
import com.posapp.utils.HexHelper;
import com.posapp.utils.RoninChipHexStringCommand;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class RoninChipModule extends ReactContextBaseJavaModule {

  public static final int BUFFER_SIZE = 64;
  public static final int READER_TIMEOUT = 500;
  public static final int BAUD_RATE = 115200;
  public static final int PORT_DATA_BITS = 8;
  public static final int WRITE_TIMEOUT = 400;

  public static final String NULL_RFID_SCAN = "FD2022000101206D";

  private static final String TAG = RoninChipModule.class.getSimpleName();
  ReactApplicationContext context;

  UsbManager usbManager;
  byte[] buffer = new byte[BUFFER_SIZE];
  String roninChipResponse;
  UsbSerialPort serialPort;

  private DeviceEventManagerModule.RCTDeviceEventEmitter mEmitter = null;
  private String receivedDataAsString;
  private boolean nullRfidScan = false;

  public RoninChipModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.usbManager = (UsbManager) reactContext.getSystemService(reactContext.USB_SERVICE);
    context = reactContext;
  }

  private static void wait(int ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      ex.printStackTrace();
    }
  }

  public static Boolean validateBuffer(byte[] buffer) {
    boolean valid = false;
    String lastFourChar = "";
    String reminderFirstChar = "";
    String bufferString = HexHelper.hex(buffer);
    int bufferCrc = 0;
    int computedCrc = 0;

    if (bufferString.length() >= 4) {
      lastFourChar = bufferString.substring(bufferString.length() - 4);
      reminderFirstChar = bufferString.substring(0, bufferString.length() - 4);
      bufferCrc = Integer.decode("0x" + lastFourChar);
      computedCrc = HexHelper.crc16(HexHelper.hexStringToByteArray(reminderFirstChar));
      valid = computedCrc == bufferCrc;
    }

    return valid;
  }

  public static String parseRfidResponse(String receivedData) {
    if (receivedData != null ) {
      if(receivedData.length() < 11){ // Minimum length is 11 for the dataLength to work
        return "Asset not detected";
      }
      String dataLengthString = receivedData.substring(6, 10);
      int dataLength = Integer.decode("0x" + dataLengthString);
      if(receivedData.length() < 15){ // Minimum length is 15 for the uid to work
        return "UID can't be detected";
      }
      String uid = receivedData.substring(10, receivedData.length() - 4);
      return uid;
    } else {
      return "Asset not detected";
    }
  }


  public static String parseFirmwareResponse(String receivedData) {
    String version = "unknown";
    if (receivedData != null) {
      String hexFirmware = receivedData.substring(10, receivedData.length() - 4);
      version = HexHelper.hexStringToAscii(hexFirmware);
    }
    Log.d(TAG, "Firmware version: " + version);
    return version;
  }

  @NonNull
  @Override
  public String getName() {
    return "RoninChipModule";
  }

  @ReactMethod
  public void wakeUpCardReader() {
    Log.d(TAG, "waking up reader");
    sendDataToRoninChip(
        RoninChipHexStringCommand.CARD_READER_WAKE_UP.getAsByteArray(), false, false);
  }

  @ReactMethod
  public void resetReader() {
    Log.d(TAG, "resetting reader");
    sendDataToRoninChip(RoninChipHexStringCommand.CARD_READER_RESET.getAsByteArray(), false, false);
  }

  @ReactMethod
  public void callScanRfid() {

    String scanResponse = this.scanRfid();
    context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("onRfidScanResult", scanResponse);
  }

  @ReactMethod
  public void getFirmwarePromise(Promise promise) {
    try {
      String firmwareResponse = "No response";
      String roninChipResponse2 =
          sendDataToRoninChip(
              RoninChipHexStringCommand.FIRMWARE_VERSION.getAsByteArray(), true, false);
      if (!nullRfidScan) {
        firmwareResponse = parseFirmwareResponse(roninChipResponse2);
      }
      Log.d(TAG, "Firmware response promise: " + firmwareResponse);
      promise.resolve(firmwareResponse);
    } catch (Exception e) {
      promise.reject("Error", e);
    }
  }

  @ReactMethod
  public void getFirmwareVersion() {

    String firmwareResponse = "No response";
    String roninChipResponse2 =
        sendDataToRoninChip(
            RoninChipHexStringCommand.FIRMWARE_VERSION.getAsByteArray(), true, false);
    if (!nullRfidScan) {
      firmwareResponse = parseFirmwareResponse(roninChipResponse2);
    }

    Toast.makeText(context, "Firmware version: " + firmwareResponse, Toast.LENGTH_LONG).show();
  }

  @ReactMethod
  public void callFakeScanRfid(String returnedUid) {

    wait(1000);
    String scanResponse = returnedUid;
    context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("onRfidScanResult", scanResponse);
  }

  public String scanRfid() {
    String scanResponse = "Asset not detected";
    roninChipResponse =
        sendDataToRoninChip(RoninChipHexStringCommand.SCAN_UID.getAsByteArray(), true, true);
    System.out.println("[RFID RESPONSE] " + roninChipResponse);
    if (!nullRfidScan) {
      scanResponse = parseRfidResponse(roninChipResponse);
    }
    
    return scanResponse;
  }

  @ReactMethod // color can be "red", "green"
  public void turnOnLed(String colorName) {

    if (colorName.equals(Colors.GREEN.getName())) {
      turnOnLed(Colors.GREEN);
    } else if (colorName.equals(Colors.RED.getName())) {
      turnOnLed(Colors.RED);
    } else {
      Log.d(TAG, colorName + " is not a valid color");
    }
  }

  public void turnOnLed(Colors color) {

    if (color == Colors.GREEN) {
      sendDataToRoninChip(
          RoninChipHexStringCommand.TURN_ON_GREEN_LED.getAsByteArray(), false, false);
    } else if (color == Colors.RED) {
      sendDataToRoninChip(RoninChipHexStringCommand.TURN_ON_RED_LED.getAsByteArray(), false, false);
    }
  }

  public String sendDataToRoninChip(byte[] data, Boolean readResponse, Boolean enableSuccessLed) {

    String result = "";

    List<UsbSerialDriver> availableDrivers =
        UsbSerialProber.getDefaultProber().findAllDrivers(usbManager);
    if (availableDrivers.isEmpty()) {
      return null;
    }

    // Open a connection to the first available driver.
    UsbSerialDriver driver = availableDrivers.get(0);
    UsbDeviceConnection connection = usbManager.openDevice(driver.getDevice());
    if (connection == null) {
      Log.d(TAG, "Connection is null");
      return null;
    }

    serialPort = driver.getPorts().get(0); // Most devices have just one port (port 0)

    try {
      serialPort.open(connection);
      serialPort.setParameters(
          BAUD_RATE, PORT_DATA_BITS, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
      serialPort.write(data, WRITE_TIMEOUT);
      if (readResponse) {
        read(enableSuccessLed);
        result = receivedDataAsString;
      }
      return result;
    } catch (IOException e) {
      Log.d(TAG, "Could not write data to usb device");
      e.printStackTrace();
      return null;
    } finally {
      emptyBuffer();
    }
  }

  private void emptyBuffer() {
    Arrays.fill(buffer, (byte) 0);
  }

  private void read(Boolean enableSuccessLed) {
    receivedDataAsString = "";
    int len = 0;
    boolean validMessage = false;
    byte[] trimmedBuffer;
    nullRfidScan = false;

    try {
      while (!validMessage) {
        len = serialPort.read(buffer, READER_TIMEOUT);
        trimmedBuffer = Arrays.copyOf(buffer, len);
        receive(trimmedBuffer);
        validMessage = validateBuffer(HexHelper.hexStringToByteArray(receivedDataAsString));
        if (receivedDataAsString.equals(NULL_RFID_SCAN)) {
          nullRfidScan = true;
        }
      }

      if (nullRfidScan) {
        turnOnLed(Colors.RED);
      } else {
        if (enableSuccessLed) {
          turnOnLed(Colors.GREEN);
        }
      }

    } catch (IOException e) {
      // when using read with timeout, USB bulkTransfer returns -1 on timeout _and_ errors
      // like connection loss, so there is typically no exception thrown here on error
    }
  }

  private void receive(byte[] data) {
    int receivedDataLength = data.length;
    receivedDataAsString += HexHelper.hex(data);
    // System.out.println("[RFID BUFFER] "+receivedDataAsString);
  }
}