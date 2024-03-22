package com.posapp;

import static com.posapp.utils.Constants.ACTION_USB_PERMISSION;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.util.Log;

import com.posapp.utils.Constants;

import java.util.ArrayList;
import java.util.HashMap;

public class PermissionManager extends BroadcastReceiver {
  private static final String TAG = PermissionManager.class.getSimpleName();

  private final UsbManager usbManager;

  private Context context;

  private boolean bbposPermissionGranted = false;
  private boolean roninPermissionGranted = false;

  public final HashMap<Integer, UsbDevice> connectedDevices;

  public PermissionManager(Context context) {
    this.context = context;
    this.usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE); // todo.. look into sharing a UsbManager instance across entire app
    this.connectedDevices = new HashMap<>();
  }

  @Override
  public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();

      Log.d("RZ", "Action: " + action);

      switch(action) {
          case ACTION_USB_PERMISSION:
              synchronized (this) {
                  UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                  if (device != null) {
                      if (device.getDeviceName() != null) {
                          Log.d("RZ", "Adding bbpos device");
                          if (device.getVendorId() == Constants.BBPOS_VENDOR_ID) {
                              this.bbposPermissionGranted = true;
                              this.connectedDevices.put(device.getVendorId() + device.getProductId(), device);
                          }

                          if ((device.getVendorId() == Constants.RONIN_CHIP_VENDOR_ID) ||
                                  (device.getVendorId() == Constants.RONIN_CHIP1_VENDOR_ID)) {
                              Log.d("RZ", "Adding ronin device");
                              this.roninPermissionGranted = true;
                              this.connectedDevices.put(device.getVendorId() + device.getProductId(), device);
                          }
                      }
                  }
              }
          break;

          case UsbManager.ACTION_USB_DEVICE_ATTACHED:
              synchronized (this) {
                  UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                  if (device != null) {
                      if (device.getDeviceName() != null) {
                          // Check if permission is already granted for the device
                          if (!usbManager.hasPermission(device)) {
                              PendingIntent usbIntent = PendingIntent.getBroadcast(context, 0, new Intent(ACTION_USB_PERMISSION), PendingIntent.FLAG_MUTABLE);
                              try {
                                  Log.d("RZ", "Requesting permission for device." + device);
                                  usbManager.requestPermission(device, usbIntent);
                              } catch (Exception e) {
                                  // Log or handle the exception
                                  Log.e("RZ", "Error requesting USB permission", e);
                              }
                          } else {
                              Log.d("RZ", "Already have permission for device." + device);
                              // You already have permission. You can proceed with your logic here.
                          }
                      }
                  }
              }
              break;

          case UsbManager.ACTION_USB_DEVICE_DETACHED:
              synchronized (this) {
                  UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                  if (device != null) {
                      int vendorId = device.getVendorId();


                      Integer key = vendorId + device.getProductId();
                      if (this.connectedDevices.containsKey(key)) {
                          this.connectedDevices.remove(key);
                      }

                  }

              }

          break;
      }

  }

  private void setRoninPermissionGranted(boolean roninPermissionGranted) {
    this.roninPermissionGranted = roninPermissionGranted;
  }

  public boolean isBbposPermissionGranted() {
    return bbposPermissionGranted;
  }

  private void setBbposPermissionGranted(boolean bbposPermissionGranted) {
    this.bbposPermissionGranted = bbposPermissionGranted;
  }

  private synchronized ArrayList<UsbDevice> getConnectedUsbDevices() {
      ArrayList<UsbDevice> allConnected = new ArrayList<>(usbManager.getDeviceList().values());

//      Log.w("RZ", "AllConnected: " + allConnected);

      for (UsbDevice usbDevice : this.connectedDevices.values()) {
          if (usbDevice != null) {
              boolean alreadySeenInLegacy = false;

              for (UsbDevice knownUsbDevice : allConnected) {
                  if (knownUsbDevice.getDeviceId() == usbDevice.getDeviceId() && knownUsbDevice.getVendorId() == usbDevice.getVendorId()) {
                      alreadySeenInLegacy = true;
                  }

              }

              if (!alreadySeenInLegacy) {
                  allConnected.add(usbDevice);
              }

          }

      }

      return allConnected;
  }

  public void requestUsbPermission(int usbDeviceVendorId) {
    String usbDeviceName = "none";
//    PendingIntent usbIntent = null;

      Log.d("RZ", "USB Device VendorID" + usbDeviceVendorId);



    for(UsbDevice usbDevice : getConnectedUsbDevices()) {
        Log.d("RZ", "USB Device Name: " + usbDevice.getDeviceName());
      if (usbDevice.getVendorId() == Constants.BBPOS_VENDOR_ID
          && usbDevice.getVendorId() == usbDeviceVendorId) {

        usbDeviceName = usbDevice.getDeviceName();
        Log.d("RZ", "BBPOS device found : " + usbDevice.getProductName());

        boolean hasPerm = usbManager.hasPermission(usbDevice);
        this.setRoninPermissionGranted(hasPerm);
      } else if (((usbDevice.getVendorId() == Constants.RONIN_CHIP_VENDOR_ID) ||
              (usbDevice.getVendorId() == Constants.RONIN_CHIP1_VENDOR_ID))
              && usbDevice.getVendorId() == usbDeviceVendorId) {

          Log.d("RZ", "RONIN chip device found : " + usbDevice.getProductName());

        usbDeviceName = "RoninChip";
        boolean hasPerm = usbManager.hasPermission(usbDevice);
        this.setRoninPermissionGranted(hasPerm);

        Log.d(TAG, "RoninChip found : " + usbDevice.getProductName());
      } else {
          Log.d("RZ", "not anything usb device something" + usbDevice.getDeviceName());

          Log.d(TAG, "No device found : no permission");
      }

      boolean hasPerm = usbManager.hasPermission(usbDevice);

      if (!hasPerm) {
        PendingIntent usbIntent = PendingIntent.getBroadcast(context, 0, new Intent(ACTION_USB_PERMISSION), PendingIntent.FLAG_MUTABLE);

        try {
          usbManager.requestPermission(usbDevice, usbIntent);
        } catch (Exception e) {
          Log.d("RZ", "Could not grant permission to " + usbDeviceName);
        }

      }

      Log.d(TAG, "Device : " + usbDevice.getProductName() + " has permissions: " + hasPerm);
    }
    Log.d(
        TAG,
        "vendorID bbpos  : "
            + Constants.BBPOS_VENDOR_ID
            + " has permissions: "
            + bbposPermissionGranted);
    Log.d(
        TAG,
        "vendorID ronin  : "
            + Constants.RONIN_CHIP_VENDOR_ID
            + " has permissions: "
            + roninPermissionGranted);

  }

   public boolean verifyRoninChipPermission(int vendorId) {
     boolean hasPerm = false;
     for(UsbDevice usbDevice : this.getConnectedUsbDevices()) {
//       Log.d("RZ", "usb device found : " + usbDevice.getProductName());

       if (usbDevice.getVendorId() == vendorId) {
//         Log.d(TAG, "ronin device found : " + usbDevice.getProductName());
         if (!hasPerm) {
             hasPerm = usbManager.hasPermission(usbDevice);
         }

       }

     }

    return hasPerm;
  }

  public boolean verifyBbposPermission() {
    boolean hasPerm = false;
      for(UsbDevice usbDevice : this.getConnectedUsbDevices()) {
//        Log.d(TAG, "usb device found : " + usbDevice.getProductName());

        if (usbDevice.getVendorId() == Constants.BBPOS_VENDOR_ID) {
//          Log.d(TAG, "BBPOS device found : " + usbDevice.getProductName());
          hasPerm = usbManager.hasPermission(usbDevice);
          break;
        }
    }

    return hasPerm;
  }

}