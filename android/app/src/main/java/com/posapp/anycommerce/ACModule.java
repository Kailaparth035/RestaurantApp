package com.posapp.anycommerce;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
import android.app.AlertDialog;
import android.content.DialogInterface;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.anywherecommerce.android.sdk.AnyPay;
import com.anywherecommerce.android.sdk.AuthenticationListener;
import com.anywherecommerce.android.sdk.GenericEventListener;
import com.anywherecommerce.android.sdk.GenericEventListenerWithParam;
import com.anywherecommerce.android.sdk.LogStream;
import com.anywherecommerce.android.sdk.MeaningfulError;
import com.anywherecommerce.android.sdk.MeaningfulErrorListener;
import com.anywherecommerce.android.sdk.MeaningfulMessage;
import com.anywherecommerce.android.sdk.RequestListener;
import com.anywherecommerce.android.sdk.Terminal;
import com.anywherecommerce.android.sdk.devices.CardInterface;
import com.anywherecommerce.android.sdk.devices.CardReader;
import com.anywherecommerce.android.sdk.devices.CardReaderController;
import com.anywherecommerce.android.sdk.devices.ConnectionStatus;
import com.anywherecommerce.android.sdk.devices.bbpos.BBPOSDevice;
import com.anywherecommerce.android.sdk.endpoints.AnyPayTransaction;
import com.anywherecommerce.android.sdk.endpoints.prioritypayments.PriorityPaymentsEndpoint;
import com.anywherecommerce.android.sdk.logging.LogConfigurationProperties;
import com.anywherecommerce.android.sdk.models.TransactionType;
import com.anywherecommerce.android.sdk.persistence.Database;
import com.anywherecommerce.android.sdk.transactions.Transaction;
import com.anywherecommerce.android.sdk.transactions.listener.CardTransactionListener;
import com.anywherecommerce.android.sdk.transactions.listener.TransactionListener;
import com.anywherecommerce.android.sdk.util.Amount;
import com.bbpos.bbdevice.BBDeviceController;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.permissions.PermissionsModule;
import com.posapp.MainActivity;
import com.posapp.MainApplication;
import com.posapp.PermissionManager;
import com.posapp.RoninChipModule;
import com.posapp.utils.Colors;
import com.posapp.utils.Constants;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.time.Instant;

import static com.anywherecommerce.android.sdk.SDKManager.getApplication;

public class ACModule extends ReactContextBaseJavaModule {

    static final int RC_BLUETOOTH = 200;
    static final int RC_BLUETOOTH_CONNECT = 202;
    static final int RC_LOCATION = 201;
    private final long epoch = 1609459200L; // Custom epoch (e.g., Jan 1, 2021, in seconds)
    private static final String TAG = ACModule.class.getSimpleName();
    private final RoninChipModule roninChipModule;
    private final PermissionManager permissionManager;
    protected PriorityPaymentsEndpoint endpoint;
    protected AnyPayTransaction refTransaction;
    protected CardReader cardReader;
    protected EnumSet<CardInterface> enabledEntryModes;
    ReactApplicationContext context;
    int nextTransactionToExecute = 0;
    ArrayList<Transaction> offlineTransactions;
    WritableMap offlineTxsInvoiceIds = Arguments.createMap();
    int transactionsToExecute = 0;
    String cardConnectionType = "";
    boolean cardReaderConnecting = false;
    CardReaderController cardReaderController;
    boolean cardReaderIsConnected = false;
    private boolean offlineIsRunning = false;
    private boolean offlineMode = false;
    boolean triedPcb0 = false;
    boolean triedPcb1 = false;
    private DeviceEventManagerModule.RCTDeviceEventEmitter mEmitter = null;
    private boolean cancelFromSwipe = false;
    private UsbManager usbManager;
    private InputStream inputStream=null;

    public ACModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        this.roninChipModule = new RoninChipModule(reactContext);
        this.usbManager = (UsbManager) reactContext.getSystemService(Context.USB_SERVICE);
        this.cardReaderController = cardReaderController;
        this.cardReaderIsConnected = cardReaderIsConnected;
        this.cardReader = cardReader;
        this.permissionManager = ((MainApplication) getApplication()).permissionManager;
    }

    public static void wait(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            ex.printStackTrace();
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "ACModule";
    }

    private void validateConfiguration() {

        WritableMap payload = Arguments.createMap();

        payload.putString("Terminal", "Validating... Please wait");

        endpoint.validateConfiguration(
                new AuthenticationListener() {
                    @Override
                    public void onAuthenticationComplete() {
                        WritableMap payload = Arguments.createMap();

                        payload.putString("Terminal", "Validation Success");
                        Log.i(TAG, "Terminal validation success");

                        context
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onAuthenticationComplete", payload);
                    }

                    @Override
                    public void onAuthenticationFailed(MeaningfulError meaningfulError) {
                        WritableMap payload = Arguments.createMap();

                        payload.putString("Terminal", "Validation Failed");
                        Log.i(TAG, "Terminal validation failed");

                        context
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onAuthenticationFailed", payload);
                    }
                });
    }

    private void emitStringEvent(String eventName, String payload) {
        if (mEmitter == null) {
            mEmitter =
                    getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        }
        if (mEmitter != null) {
            mEmitter.emit(eventName, payload);
        }

    }

    private void emitObjectEvent(String eventName, WritableMap payload) {

        if (mEmitter == null) {
            mEmitter =
                    getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        }
        if (mEmitter != null) {
            mEmitter.emit(eventName, payload);
        }

    }

    private void sendEvent(String eventName, String message) {
        WritableMap params = Arguments.createMap();
        params.putString("message", message);
        if (mEmitter == null) {
            mEmitter =
                    getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        }
        if (mEmitter != null) {
            mEmitter.emit(eventName, params);
        }
    }


    @ReactMethod
    public void addCardReaderListener() {
        Log.i(TAG, "connectReader: fired");
        //possible if null set else move on
        this.cardReaderController = CardReaderController.getControllerFor(BBPOSDevice.class);
        emitStringEvent("cardConnectActivity", "connecting device" + " connect status: " + this.cardReaderController.getConnectionStatus().value());

        if (CardReaderController.isCardReaderConnected()) {
            this.cardReader = CardReaderController.getConnectedReader();
            String serial = CardReaderController.getConnectedReader().getSerialNumber();
            emitStringEvent("productionCardReaderLogs", serial + "already connected");
            return;
        }

        this.cardReaderController.subscribeOnCardReaderConnected(new GenericEventListenerWithParam<CardReader>() {
            @Override
            public void onEvent(CardReader deviceInfo) {
                ACModule.this.cardReaderConnecting = false;
                ACModule.this.cardReader = CardReaderController.getConnectedReader();
                EnumSet<CardInterface> enabledEntryModes = EnumSet.noneOf(CardInterface.class);
                enabledEntryModes.add(CardInterface.SWIPE);
                enabledEntryModes.add(CardInterface.TAP);
                enabledEntryModes.add(CardInterface.INSERT);
                CardReaderController.getConnectedReader().setEnabledInterfaces(enabledEntryModes);

                emitStringEvent("productionCardReaderLogs", "card reader connected");
                if (deviceInfo == null) {
                    emitStringEvent("cardConnectActivity", "unknown device connected");
                    Log.i(TAG, "Unknown device connected");
                } else {
                    emitStringEvent("onCardReaderConnected", "Device Connected " + deviceInfo.getModelDisplayName() + "Line 217");
                    Log.i(TAG, "Device Connected " + deviceInfo.getModelDisplayName());
                    Toast.makeText(context, "Device Connected " + deviceInfo.getModelDisplayName(), Toast.LENGTH_LONG).show();
                    roninChipModule.turnOnLed(Colors.GREEN);
                }
            }
        });

        this.cardReaderController.subscribeOnCardReaderConnecting(new GenericEventListener() {
            @Override
            public void onEvent() {
                Log.i(TAG, "Device connecting");
                emitStringEvent("productionCardReaderLogs", "card reader connecting ");
                ACModule.this.cardReaderConnecting = true;
            }
        });

        this.cardReaderController.subscribeOnCardReaderDisconnected(
                () -> {
                    Log.i(TAG, "Device disconnected1");
                    ACModule.this.cardReader = null;
                    roninChipModule.turnOnLed(Colors.RED);
                    emitStringEvent("onCardReaderDisconnected", "Device disconnected2");
                    emitStringEvent("productionCardReaderLogs", "onCardReaderDisconnected");
                    ACModule.this.cardReader = null;
                    ACModule.this.cardReaderConnecting = false;
                });


        this.cardReaderController.subscribeOnCardReaderConnectFailed(new MeaningfulErrorListener() {
            @Override
            public void onError(MeaningfulError error) {
                Log.e(TAG, "OnCardReaderConnectFailed: " + error.toString());
                sendEvent("onCardReaderConnectFailed", ":" + error.message.toString() + ':' + error.src.toString() + ':' + error.detail.toString() + ":" + error.context.toString());
                emitStringEvent("productionCardReaderLogs", "onCardReaderConnectFailed: " + error.message.toString() + ':' + error.src.toString() + ':' + error.detail.toString() + ":" + error.context.toString());
                Log.e(TAG, "connect status2: " + cardReaderController.getConnectionStatus().value());
                Log.e(TAG, "connected2: " + cardReaderController.isCardReaderConnected());
                Log.e(TAG, "Is polling2: " + cardReaderController.isPollingForConnection());
                ACModule.this.cardReaderConnecting = false;
            }
        });

        this.cardReaderController.subscribeOnCardReaderConnectFailed(new MeaningfulErrorListener() {
            @Override
            public void onError(MeaningfulError error) {
                String message = error.toString();
                WritableMap payload = Arguments.createMap();
                payload.putString("message", message);
                emitObjectEvent("subscribeOnCardReaderConnectFailed", payload);
                emitStringEvent("productionCardReaderLogs", "subscribeOnCardReaderConnectFailed: " + message + ':' + error.src.toString() + ':' + error.detail.toString() + ":" + error.context.toString());


                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                        "subscribeOnCardReaderConnectFailed",
                        "subscribeOnCardReaderConnectFailed failed" + message);
                Log.i(TAG, "subscribeOnCardReaderConnectFailed");
                Toast.makeText(context, message, Toast.LENGTH_LONG).show();
                error.printStackTrace();
                ACModule.this.cardReaderConnecting = false;
                ACModule.this.cardReader = null;
            }
        });

        this.cardReaderController.subscribeOnCardReaderError(new MeaningfulErrorListener() {
            @Override
            public void onError(MeaningfulError error) {
                String message = error.toString();
                Log.i(TAG, "Device message: " + message);
                emitStringEvent("subscribeOnCardReaderError", "subscribeOnCardReaderError" + message);
                emitStringEvent("productionCardReaderLogs", "subscribeOnCardReaderError: " + message);
                Toast.makeText(context, message, Toast.LENGTH_LONG).show();
                ACModule.this.cardReaderConnecting = false;
                ACModule.this.cardReader = null;
            }
        });
    }

    @ReactMethod
    public void setMerchantCredentials(String consumerKey, String secret, String merchantId) {
        this.endpoint = new PriorityPaymentsEndpoint();
        this.endpoint.setConsumerKey(consumerKey);
        this.endpoint.setSecret(secret);
        this.endpoint.setMerchantId(merchantId);
        this.endpoint.setUrl("https://api.mxmerchant.com/checkout/v3/");
        this.endpoint.setEnableJsonPassthru(true);
    }

    @ReactMethod
    public void toggleSwipe(String price, String refId, String metadata, String dynamicDescriptor, Boolean allowBatchMode) {
        String swipeState;

        cancelFromSwipe = true;

        this.cardReader = CardReaderController.getConnectedReader();

        this.enabledEntryModes = cardReader.getCardInterfaces();

        if (this.enabledEntryModes.contains(CardInterface.SWIPE)) {
            this.enabledEntryModes.clear();
            this.enabledEntryModes.add(CardInterface.INSERT);
            this.enabledEntryModes.add(CardInterface.TAP);
            swipeState = "swipeOff";
            Log.i(TAG, "SWIPE OFF");
        } else {
            this.enabledEntryModes.clear();
            this.enabledEntryModes.add(CardInterface.SWIPE);
            Log.i(TAG, "SWIPE ON");
            swipeState = "swipeOn";
        }

        this.cardReader.setEnabledInterfaces(this.enabledEntryModes);

        final Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(
                () -> {
                    Log.i(TAG, "toggle swipe sending transaction");
                    startEMV(price, refId, metadata, dynamicDescriptor, allowBatchMode);
                },
                1000);
    }

    @ReactMethod
    public void requestLocationPermission(final Promise promise) {
        Activity activity = getCurrentActivity();

        if (ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            emitStringEvent("cardConnectActivity", "Fine Location Permission Missing");

            activity.runOnUiThread(() -> {
                ActivityCompat.OnRequestPermissionsResultCallback permissionCallback = new ActivityCompat.OnRequestPermissionsResultCallback() {
                    @Override
                    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
                        if (requestCode == RC_LOCATION) {
                            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                                Toast.makeText(context, "Location Permission Granted", Toast.LENGTH_LONG).show();
                                emitStringEvent("cardConnectActivity", "location permission granted");
                                promise.resolve(true);
                            } else {
                                Toast.makeText(context, "Location Permission Denied", Toast.LENGTH_LONG).show();
                                emitStringEvent("cardConnectActivity", "location permission denied");
                                promise.resolve(false);

                            }
                        }
                    }
                };

                ActivityCompat.requestPermissions(activity, ACPermissionsController.permissions, RC_LOCATION);
            });

            emitStringEvent("cardConnectActivity", "Checking for permissions");
        } else {
            emitStringEvent("cardConnectActivity", "Location Permission Granted");
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestBluetoothPermission(final Promise promise) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.resolve(false);
            return;
        }

        boolean isBluetoothConnectPermission = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;

        if (ActivityCompat.checkSelfPermission(activity, isBluetoothConnectPermission ? Manifest.permission.BLUETOOTH_CONNECT : Manifest.permission.BLUETOOTH) != PackageManager.PERMISSION_GRANTED) {
            emitStringEvent("cardConnectActivity", "no bluetooth permission");
            ActivityCompat.OnRequestPermissionsResultCallback permissionCallback = new ActivityCompat.OnRequestPermissionsResultCallback() {
                @Override
                public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
                    if (requestCode == (isBluetoothConnectPermission ? RC_BLUETOOTH_CONNECT : RC_BLUETOOTH)) {
                        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                            Toast.makeText(context, "Bluetooth Permission Granted", Toast.LENGTH_LONG).show();
                            emitStringEvent("cardConnectActivity", "bluetooth permission granted");
                            promise.resolve(true);
                        } else {
                            Toast.makeText(context, "Bluetooth Permission Denied", Toast.LENGTH_LONG).show();
                            emitStringEvent("cardConnectActivity", "bluetooth permission denied");
                            promise.resolve(false);
                        }
                    }
                }
            };

            activity.runOnUiThread(() -> {
                ActivityCompat.requestPermissions(activity, isBluetoothConnectPermission ? ACPermissionsController.advPermissions : ACPermissionsController.permissions, isBluetoothConnectPermission ? RC_BLUETOOTH_CONNECT : RC_BLUETOOTH);
            });
        } else {
            emitStringEvent("cardConnectActivity", "bluetooth permission already granted");
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestBluetoothConnection(final Promise promise) {
        Activity activity = getCurrentActivity();
        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        this.cardReaderIsConnected = CardReaderController.isCardReaderConnected();

            if (this.cardReaderConnecting) {
                promise.resolve(false);
                return;
            }

            if (!this.cardReaderIsConnected) {
                final Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();

                if (!pairedDevices.isEmpty()) {
                    BluetoothDevice selectedDevice = null;

                    for (BluetoothDevice device : pairedDevices) {
                        String deviceName = device.getName();
                        if (deviceName != null && deviceName.startsWith("CHB")) {
                            selectedDevice = device;
                            break;
                        }
                    }

                    if (selectedDevice != null) {
                        if (activity != null) {
                            final BluetoothDevice finalSelectedDevice = selectedDevice;
                            activity.runOnUiThread(() -> {
                                String deviceName = finalSelectedDevice.getName();
                                Toast.makeText(context, deviceName, Toast.LENGTH_LONG).show();
                                Log.i("selectedDevice", deviceName);
                                ACModule.this.cardReaderController.connectSpecificBluetoothDevice(finalSelectedDevice);
                            });
                        } else {
                            this.cardReaderConnecting = false;
                        }
                    } else {
                        Toast.makeText(context, "No device starting with CHB found", Toast.LENGTH_LONG).show();
                        this.cardReaderConnecting = false;
                    }

                } else {
                    Toast.makeText(context, "Bluetooth Off, or No Paired Devices", Toast.LENGTH_LONG).show();
                    this.cardReaderConnecting = false;
                }

                promise.resolve(false);

            } else {
                promise.resolve(true);
            }

        }

    @ReactMethod
    public void requestUsbPermission(final Promise promise) {
        if (permissionManager == null) {
            promise.resolve(false);
            return;
        }

        Activity activity = getCurrentActivity();
        boolean hasPerm = permissionManager.verifyBbposPermission();
        emitStringEvent("cardConnectActivity", "USB Permission = " + hasPerm);
        if (!hasPerm) {
            emitStringEvent("cardConnectActivity", "Requesting USB Permissions");
            emitStringEvent("productionCardReaderLogs", "requestUsbPermission: needsBbposPermissions");
            activity.runOnUiThread(() -> {
                permissionManager.requestUsbPermission(Constants.BBPOS_VENDOR_ID);
                promise.resolve(false);
            });

        } else {
            emitStringEvent("cardConnectActivity", "USB permission already granted");
            Toast.makeText(context, "USB Permission Already Granted", Toast.LENGTH_LONG).show();
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestPCBPermission(final Promise promise) {
        if (permissionManager == null) {
            Log.d("RZ", "no permission manager");
            promise.resolve(false);
            return;
        }

        Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.resolve(false);
            return;
        }

        activity.runOnUiThread(() -> {
            boolean hasRoninChip0Permission = permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP_VENDOR_ID);
            boolean hasRoninChip1Permission = permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP1_VENDOR_ID);

            boolean oneHasPermission = false;

            if (!hasRoninChip0Permission) {
                if (hasRoninChip1Permission) {
                    promise.resolve(true);
                    return;
                }

            } else {
                promise.resolve(true);
                return;
            }

            if (!triedPcb0) {
                triedPcb0 = true;
                permissionManager.requestUsbPermission(Constants.RONIN_CHIP_VENDOR_ID);
            } else {
                triedPcb0 = false;
                permissionManager.requestUsbPermission(Constants.RONIN_CHIP1_VENDOR_ID);
            }

            emitStringEvent("cardConnectActivity", "PCB Permission = " + (oneHasPermission));

            promise.resolve(false);
        });

    }


    @ReactMethod
    public void requestUSBConnection(final Promise promise) {
        if (permissionManager == null) {
            promise.resolve(false);
            return;
        }

        this.cardReaderIsConnected = CardReaderController.isCardReaderConnected();
        this.cardReaderConnecting = CardReaderController.getConnectionStatus() == ConnectionStatus.CONNECTING;

        // Order matters here.. don't believe the lint warning

        Activity activity = getCurrentActivity();

        if (activity != null) {
            activity.runOnUiThread(() -> {
                boolean hasPerm = permissionManager.verifyBbposPermission();
                boolean hasRoninChipPermission = permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP_VENDOR_ID) || permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP1_VENDOR_ID);

                emitStringEvent("cardConnectActivity", "USB Permission = " + hasPerm);
                emitStringEvent("cardConnectActivity", "PCB Permission = " + hasRoninChipPermission);

                WritableMap payload = Arguments.createMap();
                String controllerStatus = "";
                if (this.cardReaderConnecting) {
                    controllerStatus = "CONNECTING";
                }
                emitStringEvent("cardConnectActivity", controllerStatus);
                if (CardReaderController.isCardReaderConnected()) {
                    controllerStatus = "CONNECTED";
                }
                emitStringEvent("cardConnectActivity", controllerStatus);
                if (!CardReaderController.isCardReaderConnected()) {
                    controllerStatus = "DISCONNECTED";
                }
                emitStringEvent("cardConnectActivity", controllerStatus);
                payload.putString("connectionStatus", controllerStatus);
                emitStringEvent("cardConnectActivity", "connection status - connectOther, " + "connenction status: " + controllerStatus);
                if (!this.cardReaderIsConnected && !this.cardReaderConnecting) {
                    emitStringEvent("productionCardReaderLogs", "requestUsbConnection: controllerConnectionStatus" + controllerStatus);
                    emitStringEvent("cardConnectActivity", "connection status not connecting - connectOther");
                    cardReaderController.connectOther(CardReader.ConnectionMethod.USB);
                    promise.resolve(false);

                    emitStringEvent("productionCardReaderLogs", "post connectOther(usb): controllerConnectionStatus" + controllerStatus);
                } else {
                    promise.resolve(this.cardReaderIsConnected);
                }
            });

        } else {
            promise.resolve(false);
        }

    }

    @ReactMethod
    public void switchReaderConnectionType(String connectType) {
        cardConnectionType = connectType;
    }

    @ReactMethod
    public void showReaderConnection(final Promise promise) {
        WritableMap payload = Arguments.createMap();

        boolean hasManager = permissionManager != null;

        boolean hasPerm = hasManager && permissionManager.verifyBbposPermission();
        boolean hasRoninChipPermission = hasManager && permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP_VENDOR_ID) || hasManager && permissionManager.verifyRoninChipPermission(Constants.RONIN_CHIP1_VENDOR_ID);
        String connectionStatus = null;
        if (this.cardReaderConnecting) {
            connectionStatus = "CONNECTING";
        }
        if (CardReaderController.isCardReaderConnected()) {
            connectionStatus = "CONNECTED";
        }
        if (!CardReaderController.isCardReaderConnected()) {
            connectionStatus = "DISCONNECTED";
        }

        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean isBluetoothConnection = mBluetoothAdapter != null && mBluetoothAdapter.isEnabled();
        int permissions = PackageManager.PERMISSION_GRANTED;
        int bluetoothPermission = ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH);
        int bluetoothConnectPermission = ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT);
        int fineLocationPermission = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION);
        if (usbManager.getDeviceList() != null) {
            payload.putString("deviceList", usbManager.getDeviceList().toString());
        }

        if (mBluetoothAdapter != null) {
            payload.putString("bluetoothAdapterNameBondedDevices", mBluetoothAdapter.getBondedDevices().toString());
            payload.putBoolean("bluetoothAdapterEnabled", mBluetoothAdapter.isEnabled());
        } else {
            payload.putBoolean("bluetoothAdapterEnabled", false);
            payload.putString("bluetoothAdapterNameBondedDevices", "[]");
        }
        if (CardReaderController.isCardReaderConnected()) {
            this.cardReader = CardReaderController.getConnectedReader();
            payload.putString("connectionType", this.cardReader.getConnectionMethod().toString().toLowerCase());
            payload.putBoolean("connected", this.cardReader.isConnected());
        } else {
            payload.putString("connectionType", "none");
            payload.putBoolean("connected", false);
        }
        payload.putBoolean("hasUsbPermissions", hasPerm);
        payload.putBoolean("hasRoninChipPermissions", hasRoninChipPermission);
        payload.putBoolean("usbOnly", !isBluetoothConnection);
        payload.putString("connectionStatus", connectionStatus);
        payload.putString("controllerConnectionStatus", cardReaderController.getConnectionStatus().toString());
        payload.putBoolean("hasBluetoothPermissions", bluetoothPermission > -1);
        payload.putBoolean("hasBluetoothConnectPermissions", bluetoothConnectPermission > -1);
        payload.putBoolean("hasFineLocationPermissions", fineLocationPermission > -1);
        payload.putBoolean("cardReaderConnecting", cardReaderConnecting);

        promise.resolve(payload);
    }

    @ReactMethod
    public void cardReaderDisconnect(final Promise promise) {
        if (permissionManager == null) {
            promise.resolve(false);
            return;
        }


        Activity activity = getCurrentActivity();

//            boolean hasPerm = permissionManager.verifyBbposPermission();
//            boolean hasRoninChipPermission = permissionManager.verifyRoninChipPermission();

        activity.runOnUiThread(() -> {
//                permissionManager.requestUsbPermission(Constants.BBPOS_VENDOR_ID);
            try {
                this.cardReader.disconnect();
            } catch (Exception e) {
                Log.d(TAG, e + " -- tried to cleanup an already gone connection");
            }

            roninChipModule.turnOnLed(Colors.RED);
        });

        promise.resolve(true);
    }

    public boolean isOnline() {
        Runtime runtime = Runtime.getRuntime();
        try {
            Process ipProcess = runtime.exec("/system/bin/ping -c 1 8.8.8.8");
            int exitValue = ipProcess.waitFor();
            return (exitValue == 0);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return false;
    }

    @ReactMethod
    public void showPendingOfflineTransactions(Promise promise) {
        try {
            final ArrayList<Transaction> txs = Database.getInstance().getAllOfflineDeferredTransactions();
            WritableMap map = Arguments.createMap();
            map.putInt("size", txs.size());
            if (txs.size() > 0) {
                for (int i = 0; i < txs.size(); i++) {
                    Transaction offlineTx = txs.get(i);
                    WritableMap invoiceMap = Arguments.createMap();
                    invoiceMap.putString("-isCancelled", String.valueOf(!offlineTx.isCancelled()));
                    invoiceMap.putString("-getWarnings", String.valueOf(offlineTx.getWarnings()));
                    invoiceMap.putString("-status", String.valueOf(offlineTx.getCurrentStatus()));
                    map.putMap(offlineTx.getCustomField("invoice").toString(), invoiceMap);
                }
            }

            promise.resolve(map);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            promise.reject("test error");
        }

    }

    @ReactMethod
    public void showCurrentTransaction(Promise promise) {
        if (refTransaction != null) {
            WritableMap map = Arguments.createMap();
            WritableMap invoiceMap = Arguments.createMap();
            invoiceMap.putString("status", String.valueOf(refTransaction.getCurrentStatus()));
            invoiceMap.putString("getWarnings", String.valueOf(refTransaction.getWarnings()));
            if (refTransaction.getCardReader() != null) {
                invoiceMap.putString("transactionCardReaderStatus", String.valueOf(refTransaction.getCardReader().getConnectionStatus()));
            }

            map.putMap("currentTransaction", invoiceMap);
            map.putString("transactionDetails", refTransaction.toString());
            promise.resolve(map);
        } else {
            promise.resolve("no transaction");
        }
    }


    private long generateReplayId(String deviceSerialNumber) {
        // New epoch: January 1st, 2023
        long newEpoch = 1672531200L; // Seconds since January 1st, 1970 to January 1st, 2023

        long currentSeconds = (System.currentTimeMillis() / 1000) - newEpoch;

        String last9Characters = deviceSerialNumber.substring(Math.max(0, deviceSerialNumber.length() - 9));
        StringBuilder digitsOnly = new StringBuilder();
        for (char c : last9Characters.toCharArray()) {
            if (Character.isDigit(c)) {
                digitsOnly.append(c);
            }
        }
        int serialNumber = Integer.parseInt(digitsOnly.toString());

        // Concatenate serialNumber and currentSeconds as strings
        String concatenatedId = String.format("%09d%09d", serialNumber, currentSeconds);

        // Parse the concatenated string back to long
        return Long.parseLong(concatenatedId);
    }

    //Called by CreditStart
    @ReactMethod
    public void startEMV(String price, String refId, String metadata, String dynamicDescriptor, Boolean allowBatchMode) {
        validateConfiguration();
        BBDeviceController.setDebugLogEnabled(true);
//        Terminal.getInstance().getConfiguration().setProperty("strictOfflineModeEnabled", true);
        this.cardReader = CardReaderController.getConnectedReader();
        Log.i(TAG, "Starting EMV transaction");
        Log.i(TAG, "Price: " + price);
        Log.i(TAG, "offlineMode: " + this.offlineMode);
        emitStringEvent("productionCardReaderLogs", "startEmv");
        if (this.cardReader == null || !this.cardReader.isConnected() || this.cardReaderConnecting) {
            Log.i(TAG, "No card reader connected");

            WritableMap payload = Arguments.createMap();
            payload.putString("On EMV START", "no reader connected EMV");
            emitObjectEvent("onCardReaderEvent", payload);
            emitStringEvent("productionCardReaderLogs", "no card reader");
            return;
        }

        Log.i(TAG, "startEMV: " + CardReaderController.getConnectedReader().getModelDisplayName());

        sendEMVTransaction(price, refId, metadata, dynamicDescriptor, allowBatchMode);
    }

    private void sendEMVTransaction(String price, String refId, String metadata, String dynamicDescriptor, Boolean allowBatchMode) {
        emitStringEvent("productionCardReaderLogs", "send transaction: refID " + refId);
        Activity activity = getCurrentActivity();
        Log.i(TAG, "sendEMVTransaction: fired");
        final AnyPayTransaction transaction = new AnyPayTransaction();
        Log.i(TAG, "sendEMV: " + CardReaderController.getConnectedReader().getModelDisplayName());
        Log.i(TAG, "endpoint equals: " + endpoint);
        Log.i(TAG, "dynamicDescriptor: " + dynamicDescriptor);
        Log.i(TAG, "offlineMode: " + this.offlineMode);
        Terminal.getInstance().getConfiguration().setProperty("strictOfflineModeEnabled", this.offlineMode);
        String deviceSerialNumber = ((BBPOSDevice)CardReaderController.getConnectedReader()).serialNumber;
        long replayId = generateReplayId(deviceSerialNumber);
        Log.i(TAG, "replayId: " + replayId);
        transaction.setEndpoint(endpoint);
        transaction.enableTrace();
        transaction.useCardReader(CardReaderController.getConnectedReader());
        transaction.setTransactionType(TransactionType.SALE);
        transaction.setTotalAmount(new Amount(price));
        transaction.setCurrency("USD");
        transaction.setAllowOffline(allowBatchMode);
        transaction.addCustomField("meta", metadata);
        transaction.addCustomField("invoice", refId);
        transaction.addCustomField("dynamicDescriptor", dynamicDescriptor);
        transaction.addCustomField("replayId", replayId);


        refTransaction = transaction;

        activity.runOnUiThread(
                () -> {
                    Log.i(TAG, "run: fired");
                    emitStringEvent("productionCardReaderLogs", "transactionStatus1" + String.valueOf(transaction.isCancelled()));
                    emitStringEvent("productionCardReaderLogs", "transactionStatus2" + String.valueOf(transaction.getCurrentStatus()));
                    emitStringEvent("productionCardReaderLogs", "cardReaderIsConnected" + String.valueOf(transaction.getCurrentStatus()));
                    emitStringEvent("productionCardReaderLogs", "transactionExecuting");
                    transaction.execute(
                            new CardTransactionListener() {
                                @Override
                                public void onCardReaderEvent(MeaningfulMessage event) {
                                    String eventMessage = event.message;
                                    emitStringEvent("productionCardReaderLogs", "onCardREaderEvent" + eventMessage);
                                    if (eventMessage.equals("PRESENT_CARD")) {
                                        eventMessage = "Insert or Tap Card";
                                    } else if (eventMessage.equals("SWIPE_CARD")) {

                                        eventMessage = "Swipe Card";
                                    }

                                    Log.i(TAG, "onCardReaderEvent: " + event.message);
                                    WritableMap payload = Arguments.createMap();
                                    payload.putString("message", eventMessage);
                                    emitObjectEvent("onCardReaderEvent", payload);
                                }

                                @Override
                                public void onTransactionCompleted() {
                                    Log.i(
                                            TAG,
                                            "Transaction completed - Invoice number: " + transaction.getExternalId());

                                    WritableMap payload = Arguments.createMap();
                                    payload.putString("message", transaction.isApproved().toString());
                                    payload.putString("isApproved", transaction.isApproved().toString());
                                    payload.putString("invoiceNumber", transaction.getExternalId());
                                    payload.putString("transaction", transaction.toJson());
                                    WritableMap swipePayload = Arguments.createMap();
                                    emitStringEvent("productionCardReaderLogs", "onTransactionApproved");
                                    if (transaction.isApproved()) {
                                        Log.i(TAG, "Transaction completed! - Payload" + payload);
                                        emitObjectEvent("onTransactionCompleted", payload);
                                        swipePayload.putString("message", "APPROVED");
                                        refTransaction = null;
                                        roninChipModule.turnOnLed(Colors.GREEN);
                                        emitStringEvent("productionCardReaderLogs", "onTransactionApproved: approved");
                                    } else if (cancelFromSwipe) {
                                        swipePayload.putString("message", "");
                                        emitStringEvent("productionCardReaderLogs", "onTransactionApproved: canceled");
                                    } else {
                                        swipePayload.putString("message", "DECLINED");
                                        roninChipModule.turnOnLed(Colors.RED);
                                        emitStringEvent("productionCardReaderLogs", "onTransactionApproved: declined");
                                    }
                                    swipePayload.putString("ref_id", transaction.getCustomField("invoice").toString());

                                    Log.i(TAG, "Transaction completed!" + swipePayload);
                                    emitObjectEvent("onCardReaderEvent", swipePayload);
                                    cancelFromSwipe = false;
                                }

                                @Override
                                public void onTransactionFailed(MeaningfulError reason) {
                                    WritableMap payload = Arguments.createMap();
                                    payload.putString("transaction", transaction.toJson());
                                    payload.putString("reason", reason.toString());
                                    emitStringEvent("onTransactionFailed", reason.toString());

                                    emitStringEvent("productionCardReaderLogs", "onTransactionFailed: " + reason.toString());
                                    if (transaction.isDeferred()) {
                                        Log.i(TAG, "Transaction deferred to offline transactions - Invoice number: " + transaction.getExternalId());
                                        roninChipModule.turnOnLed(Colors.GREEN);
                                        payload.putString("message", "DEFERRED");
                                    } else if (cancelFromSwipe) {
                                        payload.putString("message", "");
                                        emitStringEvent("productionCardReaderLogs", "onTransactionFailed: cancel from swipe");
                                    } else {
                                        payload.putString("message", "DECLINED");
                                        emitStringEvent("productionCardReaderLogs", "onTransactionFailed: Declined");
                                        Log.i(TAG, "Transaction declined - Invoice number: " + transaction.getExternalId());
                                    }

                                    Log.i(TAG, "Transaction failed, emmitted event: " + payload);
                                    payload.putString("invoiceNumber", transaction.getExternalId());
                                    payload.putString("ref_id", transaction.getCustomField("invoice").toString());
                                    emitObjectEvent("onCardReaderEvent", payload);
                                }
                            });
                });
    }
    @ReactMethod
    public void processOfflineTransactions() {
        if (offlineIsRunning) {
            Log.d("RZ", "Already Processing Offline Transactions");
            roninChipModule.turnOnLed(Colors.RED);
            return;
        }
        try {
            offlineTransactions = Database.getInstance().getAllOfflineDeferredTransactions();
            if (offlineTransactions.size() > 0) {
                roninChipModule.turnOnLed(Colors.RED);
            }
        } catch (IllegalAccessException e) {
            Log.d("RZ", "Failed to get offline transactions", e);
        }
        if (offlineMode) {
            Log.d("RZ", "Device in OfflineMode");
            return;
        }
        offlineIsRunning = true;
        try {
            if ((transactionsToExecute > 0 && nextTransactionToExecute >= transactionsToExecute) || nextTransactionToExecute == 0) {
                Log.d("RZ", "Starting to Process Offline Transactions");
                try {
                    offlineTransactions = Database.getInstance().getAllOfflineDeferredTransactions();
                    nextTransactionToExecute = 0;
                    transactionsToExecute = offlineTransactions.size();
                    offlineTxsInvoiceIds = Arguments.createMap();
                    Log.d("RZ", "Size of offlineTransactions: " + offlineTransactions.size());
                    Thread thread =
                            new Thread() {
                                @Override
                                public void run() {
                                    final CountDownLatch latch = new CountDownLatch(1);
                                    try {
                                        if (offlineTransactions.size() > 0) {
                                            emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: start");
                                            executeOfflineTransactions(latch);
                                            Log.d("RZ", "Processing Offline Transaction#: " + latch);
                                        }

                                        latch.await();
                                        emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: await finished");
                                    } catch (InterruptedException e) {
                                        latch.countDown();
                                    } finally {
                                        offlineIsRunning = false;  // Reset the flag
                                        Log.d("RZ", "Finished Processing Offline Transactions");
                                    }
                                }
                            };
                    if (offlineTransactions.size() > 0) {
                        thread.start();
                    }
                } catch (Exception exception) {
                    exception.printStackTrace();
                }
            } else {
                return;
            }
        } finally {
            if (Thread.currentThread().getId() == Thread.currentThread().getId()) {
                offlineIsRunning = false;  // Make sure to reset the flag in case of exceptions as well
            }
        }
    }

    private void cancelOfflineTransaction(String refId, CountDownLatch latch) {
        try {
            int offlineTxIndex = 0;
            for (Transaction offlineTx : offlineTransactions) {
                if (offlineTx.getCustomField("invoice") == refId) {
                    emitStringEvent("productionCardReaderLogs", "cancelOfflineTransactions: size" + offlineTransactions.size());
                    emitStringEvent("productionCardReaderLogs", "cancelOfflineTransactions: refId" + offlineTx.getCustomField("invoice"));
                    Database.getInstance().delete(offlineTx);
                    break;
                }
                offlineTxIndex++;

            }
            offlineTransactions = Database.getInstance().getAllOfflineDeferredTransactions();
            transactionsToExecute = offlineTransactions.size();
            emitStringEvent("productionCardReaderLogs", "cancelOfflineTransactions: size after cancelling offline" + offlineTransactions.size());
            executeOfflineTransactions(latch);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            emitStringEvent("productionCardReaderLogs", "cancelOfflineTransactions: error" + e.getMessage());
        }
    }

    private void executeOfflineTransactions(CountDownLatch latch) {
        if (offlineTransactions != null && offlineTransactions.size() > 0 && nextTransactionToExecute < offlineTransactions.size()) {
            final Transaction transaction = offlineTransactions.get(nextTransactionToExecute);

            if (transaction != null) {
                String invoiceId = transaction.getCustomField("invoice").toString();
                if (offlineTxsInvoiceIds.hasKey(invoiceId) || transaction.isCancelled()) {
                    cancelOfflineTransaction(invoiceId, latch);
                } else {
                    emitStringEvent("executeOfflineTransaction", "transactionIsCancelled" + transaction.isCancelled());
                    emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: " + invoiceId + " status: " + transaction.getCurrentStatus());
                    emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: isCancelled" + transaction.isCancelled());
                    transaction.execute(
                            new TransactionListener() {
                                @Override
                                public void onTransactionCompleted() {
                                    offlineTxsInvoiceIds.putString(invoiceId, invoiceId);
                                    emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: " + invoiceId + " status: " + transaction.getCurrentStatus());
                                    nextTransactionToExecute++;
                                    executeOfflineTransactions(latch);
                                }

                                @Override
                                public void onTransactionFailed(MeaningfulError reason) {
                                    Log.e("executeOfflineTransactions", "onTransactionFailed, ERROR IS: "
                                            + reason + "\nFAILED TRANSACTION IS: " + transaction);
                                    //                            offlineTxsInvoiceIds.putString(invoiceId, invoiceId);
                                    emitStringEvent("productionCardReaderLogs", "executeOfflineTransaction: " + invoiceId + " failed: " + reason.toString());
                                    nextTransactionToExecute++;
                                    executeOfflineTransactions(latch);

                                }
                            }
                    );
                }
            } else if (nextTransactionToExecute >= transactionsToExecute) {
                latch.countDown();
            } else {
                nextTransactionToExecute++;
                executeOfflineTransactions(latch);
            }
        } else {
            latch.countDown();
        }
    }

    @ReactMethod
    private void cancelTransaction(String refId) {
        final Transaction transaction = (AnyPayTransaction) refTransaction;
        emitStringEvent("productionCardReaderLogs", "cancelTransaction: refId " + refId);
        emitStringEvent("productionCardReaderLogs", "cancelTransaction: ref not null " + String.valueOf(refTransaction != null));
        if (refTransaction != null) {
            Activity activity = getCurrentActivity();
            if (!refTransaction.getCardReader().isConnected() && CardReaderController.isCardReaderConnected()) {
                refTransaction.useCardReader(CardReaderController.getConnectedReader());
            }
            activity.runOnUiThread(
                    () -> {
                        if (CardReaderController.isCardReaderConnected()) {
                            try {
                                if (refTransaction.getCustomField("invoice").toString().equals(refId)) {
                                    emitStringEvent("productionCardReaderLogs", "cancelTransaction: start");
                                    refTransaction.cancel();
                                    //  emitStringEvent("productionCardReaderLogs", "cancelTransaction: invoiceId - refId" + refTransaction.getCustomField("invoice").toString().equals(refId));
                                }
                            } catch (Exception e) {
                                Log.i(TAG, "Transaction cancellation failed: " + e);
                                emitStringEvent("productionCardReaderLogs", "cancelTransactionFailed" + refTransaction.isCancelled());
                            }
                            Log.i(TAG, "Transaction canceled");

                        } else {
                            Log.i(TAG, "no device connected");
                            emitStringEvent("productionCardReaderLogs", "cancelTransaction: delete");
                            refTransaction.delete();
                        }
                    });
            emitStringEvent("productionCardReaderLogs", "cancelTransaction: invoiceId" + refTransaction.getCustomField("invoice").toString());
            emitStringEvent("productionCardReaderLogs", "cancelTransaction: invoiceId - refId" + refTransaction.getCustomField("invoice").toString().equals(refId));

        }
    }

    @ReactMethod
    public void getPendingOfflineTsx(Promise promise) {
        try {
            ArrayList pendingTsx = Database.getInstance().getAllOfflineDeferredTransactions();
            promise.resolve(pendingTsx);
            Log.i(TAG, "Pending offline transactions: " + pendingTsx);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    public void getDeviceId(Promise promise) {
        try {
            String android_id =
                    Settings.Secure.getString(
                            getReactApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);
            promise.resolve(android_id);
            Log.i(TAG, "getDeviceId: " + android_id);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    public void getMacAddress(Promise promise) {
        try {
            if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                return;
            }
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : all) {
                if (!nif.getName().equalsIgnoreCase("wlan0")) continue;

                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    promise.resolve("no ID");
                }
                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    String hex = Integer.toHexString(b & 0xFF);
                    if (hex.length() == 1)
                        hex = "0".concat(hex);
                    res1.append(hex.concat(":"));
                }

                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                promise.resolve(res1.toString());
                Log.i(TAG, "getMacAddress: " + res1.toString());
            }
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    private void reLaunchApp() {
        Activity activity = getCurrentActivity();
        Intent intent = new Intent(activity, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        context.startActivity(intent);
        Runtime.getRuntime().exit(0);
    }

    @ReactMethod
    private void configureScanner() {
        Activity activity = getCurrentActivity();
        activity.runOnUiThread(() -> {
            BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            if (bluetoothAdapter.getBondedDevices().size() > 0) {
                for (BluetoothDevice mDevice : bluetoothAdapter.getBondedDevices()) {
                    if (mDevice.getName().equals("BarCode Scanner HID")) {
                        connectToBluetoothDevice(mDevice);
                        break;
                    }
                }
            }
        });
    }

    private void connectToBluetoothDevice(BluetoothDevice bluetoothDevice){
        Handler handler = new Handler();
        try {
            BluetoothSocket  bluetoothSocket =(BluetoothSocket) bluetoothDevice.getClass().getMethod("createRfcommSocket", new Class[]{int.class}).invoke(bluetoothDevice, Integer.valueOf(1));
            bluetoothSocket.connect();
            inputStream = bluetoothSocket.getInputStream();
            new Thread(new Runnable() {
                @Override
                public void run() {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while (true) {
                        try {
                            bytesRead = inputStream.read(buffer);
                            final String receivedData = new String(buffer, 0, bytesRead);
                            handler.post(new Runnable() {
                                @Override
                                public void run() {
                                    // Handle the received data on the UI thread
                                    //receivedDataTextView.setText(receivedData);
                                    context
                                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                            .emit("onBarcodeScanResult", receivedData.toString().trim());
                                }
                            });
                        } catch (IOException e) {
                            // Handle read errors
                            Log.e(TAG, "Error reading data: " + e.getMessage());
                            break;
                        }
                    }
                }
            }).start();

        } catch (IOException e) {
            // Handle connection errors
            Log.e(TAG, "Bluetooth connection error: " + e.getMessage());
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }


    }

    @ReactMethod
    public void getOfflineMode(boolean flag) {
        this.offlineMode = flag;
    }
}