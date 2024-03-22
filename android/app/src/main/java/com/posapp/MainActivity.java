package com.posapp;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.rnfs.RNFSPackage;

import com.anywherecommerce.android.sdk.AnyPay;
import com.anywherecommerce.android.sdk.LogStream;
import com.anywherecommerce.android.sdk.MeaningfulError;
import com.anywherecommerce.android.sdk.RequestListener;
import com.anywherecommerce.android.sdk.Terminal;
import com.anywherecommerce.android.sdk.endpoints.prioritypayments.PriorityPaymentsEndpoint;
import com.anywherecommerce.android.sdk.logging.LogConfigurationProperties;
import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.posapp.utils.PosPermissionDialogActivity;
import com.posapp.utils.Constants;

import java.util.HashMap;

import static com.posapp.utils.Constants.ACTION_USB_PERMISSION;

public class MainActivity extends ReactActivity {
  private static final String TAG = MainActivity.class.getSimpleName() + "Log";

  protected PriorityPaymentsEndpoint endpoint;
  UsbManager usbManager;

  PermissionManager permissionManager;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  ReactContext context;

  @Override
  protected String getMainComponentName() {
    return "PosApp";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    context = getReactInstanceManager().getCurrentReactContext();

    this.permissionManager = new PermissionManager(this);
    ((MainApplication) getApplication()).permissionManager = this.permissionManager;

    AnyPay.initialize(getApplication());
    try {
      Log.i(TAG, "promise success");
      Terminal.restoreState();
      endpoint = (PriorityPaymentsEndpoint) Terminal.getInstance().getEndpoint();
      Log.i(TAG, "endpoint is: " + endpoint);
    } catch (Exception ex) {
      Log.i(TAG, "promise fail");
      this.endpoint = new PriorityPaymentsEndpoint();
      Terminal.initialize(endpoint);
    }

    // Change logging configuration
    LogConfigurationProperties lp = LogStream.getLogger("device").getConfiguration();
    lp.remoteLoggingEnabled = true;
    lp.logLevel = "DEBUG";
    LogStream.getLogger("device").applyConfiguration(lp);
    AnyPay.getSupportKey("", new RequestListener<String>() {
      @Override
      public void onRequestComplete(String s) {
          Log.i("Test Key-----@",s);
      }

      @Override
      public void onRequestFailed(MeaningfulError meaningfulError) {
        Log.i("Test Key-----@",meaningfulError.getLocalizedMessage());
      }
    });

    IntentFilter filter = new IntentFilter();
    filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
    filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
    filter.addAction(ACTION_USB_PERMISSION);


    Intent intent = registerReceiver(permissionManager, filter);
  }

  @Override
  protected void onStop() {
    super.onStop();
    Log.i(TAG, "onStop fired");

    WritableMap payload = Arguments.createMap();
    payload.putString("onActivityEvent", "onStop fired");
    getReactInstanceManager()
        .getCurrentReactContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("onActivityEvent", payload);
  }

  @Override
  protected void onPause() {
      super.onPause();
  }

  @Override
  protected void onResume() {
      super.onResume();
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    // If you register a receiver in onCreate(Bundle) using the activity's context,
    // you should unregister it in onDestroy() to prevent leaking the receiver out of the activity context.
    unregisterReceiver(permissionManager);
  }


}