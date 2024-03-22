/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */

import PropTypes from "prop-types";
import { useNetInfo } from "@react-native-community/netinfo";
import React, { useState, useMemo, useEffect } from "react";

export const CardReaderContext = React.createContext();

import { Alert, DeviceEventEmitter, NativeModules } from "react-native";
import { WriteLog } from "../../src/CommonLogFile";

const { ACModule } = NativeModules;

let connectAttempt = false;
let locationInterval;

const acConnectionTypes = {
  NONE: -1,
  BLUETOOTH: 0,
  USB: 1,
};

let acConnectionType = acConnectionTypes.NONE;

let bluetoothRetryTimeout,
  locationRetryTimeout,
  usbRetryTimeout,
  pcbRetryRetryTimeout,
  controllerLinkRetryTimeout,
  freezeDetectTimeout;

let tryingUsb = false;

let stateUpdateWaiting = false;

let failures = {
  usb: 0,
  bluetooth: 0,
};

let usbFailCount = 0;
let bluetoothFailCount = 0;

const BBPOSProductIds = [22352];
const RONINProductIds = [24597, 60000];

let hasHadBoard = false;

let mounted = false;
let tryingBluetooth1 = false;

let lastStringifiedStatus = "";
let _bluetoothConnecting = false;
const _usbConnecting = { connecting: false };

function CardReaderContextProvider({ children }) {
  const netInfo = useNetInfo();
  const [locationServicesEnabled, setLocationServicesEnabled] = useState();
  const [bluetoothEnabled, setBluetoothEnabled] = useState();
  const [usbEnabled, setUsbEnabled] = useState();
  const [pcbEnabled, setPcbEnabled] = useState();
  const [pcbConnected, setPcbConnected] = useState();
  const [statusInterval, setStatusInterval] = useState();
  const [currentControllerStatus, setCurrentControllerStatus] = useState();
  const [bluetoothConnected, setBluetoothConnected] = useState();
  const [usbConnected, setUsbConnected] = useState();
  const [cardReaderListenerInitialized, setCardReaderListenerInitialized] =
    useState();
  const [usingUsb, setUsingUsb] = useState(false);
  const [usingBluetooth, setUsingBluetooth] = useState(false);
  const [tryingBluetooth, setTryingBluetooth] = useState(false);
  const [cardReaderConnected, setCardReaderConnected] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);

  const [executionLogs, setExecutionLogs] = useState([]);

  const handleEmptyControllerStatus = ({ connected }) => {
    WriteLog(
      "CardReaderContext  AuthContext GOT AN EMPTY STATUS HERE" + connected
    );
    // console.log("GOT AN EMPTY STATUS HERE", connected);
  };

  const tryAndRetry = (current_value) =>
    current_value === false ? undefined : false;

  const handlePolledControllerStatus = ({
    bluetoothAdapterNameBondedDevices,
    cardReaderConnecting,
    connected,
    connectionStatus,
    connectionType,
    deviceList: usbDeviceList,
    hasBluetoothConnectPermissions,
    hasBluetoothPermissions,
    hasFineLocationPermissions,
    hasRoninChipPermissions,
    hasUsbPermissions,
    usbOnly,
    bluetoothAdapterEnabled,
  }) => {
    setCurrentControllerStatus({
      bluetoothAdapterNameBondedDevices,
      cardReaderConnecting,
      connected,
      connectionStatus,
      connectionType,
      deviceList: usbDeviceList,
      hasBluetoothConnectPermissions,
      hasBluetoothPermissions,
      hasFineLocationPermissions,
      hasRoninChipPermissions,
      hasUsbPermissions,
      usbOnly,
      bluetoothAdapterEnabled,
      randomToken: (Math.random() + 1).toString(36).substring(7),
    });
  };

  useEffect(() => {
    initializeReaderListener().then(() => {
      setStatusInterval(
        setInterval(() => {
          getConnectionInfo()
            .then(handlePolledControllerStatus)
            .catch(handleEmptyControllerStatus);
        }, 2500)
      );
    });

    mounted = true;

    return () => {
      mounted = false;
      // disconnectCardReader().then((d) => {
      //     console.log("DISCONNECTED CARD READER", d);
      // })
    };
  }, []);

  useEffect(() => {
    if (pcbConnected) {
      hasHadBoard = true;
    }
  }, [pcbConnected]);

  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  useEffect(() => {
    if (!currentControllerStatus) {
      return;
    }

    // This makes sure the function only runs when the primary dependency updates... not for all of them.
    const thisStringified = JSON.stringify(currentControllerStatus);
    if (lastStringifiedStatus === thisStringified) {
      return;
    } else {
      lastStringifiedStatus = thisStringified;
    }

    if (currentControllerStatus?.connected === undefined) {
      WriteLog("CardReaderContext possibly frozen?");
      // console.log("possibly frozen?");
      return;
    }

    const {
      bluetoothAdapterNameBondedDevices,
      cardReaderConnecting,
      connected,
      connectionStatus,
      connectionType,
      deviceList,
      hasBluetoothConnectPermissions,
      bluetoothAdapterEnabled,
      hasBluetoothPermissions,
      hasFineLocationPermissions,
      hasRoninChipPermissions,
      hasUsbPermissions,
      usbOnly,
    } = currentControllerStatus;

    // Initialize the controller
    if (!cardReaderListenerInitialized) {
      WriteLog("CardReaderContext [reader] initialized state");
      // console.log("[reader] initialized state");
      //setUsingUsb(true);
      setCardReaderListenerInitialized(true);
      return;
    }

    // Handle Location Services
    if (!locationServicesEnabled && hasFineLocationPermissions) {
      setLocationServicesEnabled(tryAndRetry(locationServicesEnabled));
      return;
    }

    setCardReaderConnected(connected);

    let modifiedPcbPermissions = false;

    const hasRonin =
      RONINProductIds.some((id) => deviceList?.includes(id)) &&
      hasRoninChipPermissions;

    let modifiedBluetoothPermissions = false;

    if (bluetoothAdapterEnabled) {
      // Handle Bluetooth Permissions

      // Controller indicated bluetooth permissions are not available, but we think they are
      if (bluetoothEnabled && !hasBluetoothPermissions && !tryingBluetooth) {
        setBluetoothEnabled(false);
        return;
      } else if (!bluetoothEnabled && hasBluetoothPermissions) {
        setBluetoothEnabled(true);
        return;
      }

      // If the controller is disconnected and we are not using usb
      if (!["CONNECTED", "CONNECTING"].includes(connectionStatus)) {
        // If bluetooth is enabled but not connected
        if (bluetoothEnabled && !bluetoothConnected) {
          //setBluetoothConnected(tryAndRetry(bluetoothConnected));
        }
      }
    } else {
      if (usingBluetooth) {
        setUsingBluetooth(false);
      }

      let bluetoothConnectionToggle = false;

      if (bluetoothConnected) {
        setBluetoothConnected(false);
        bluetoothConnectionToggle = true;
      }

      if (bluetoothEnabled) {
        setBluetoothEnabled(false);
        bluetoothConnectionToggle = true;
      }

      if (bluetoothConnectionToggle) {
        setUsingBluetooth(false);
        failures.bluetooth = 0;
        failures.usb = 0;
        setUsingUsb(true);
      }
    }

    // Handle PCB Permissions
    if (!pcbEnabled) {
      if (hasRoninChipPermissions) {
        WriteLog("CardReaderContext enabling pcb");
        // console.log("enabling pcb");
        setPcbEnabled(true);
        modifiedPcbPermissions = true;
      } else {
        setPcbEnabled(tryAndRetry(pcbEnabled));
      }
    } else {
      if (!hasRoninChipPermissions) {
        WriteLog("CardReaderContext disabling pcb");
        // console.log("disabling pcb");
        setPcbEnabled(tryAndRetry(pcbEnabled));
        modifiedPcbPermissions = true;
      }
    }

    // Handle connections
    if (connected) {
      if (usingBluetooth && bluetoothEnabled && !bluetoothConnected) {
        setBluetoothConnected(true);
      }

      if (usingUsb && usbEnabled && !usbConnected) {
        setUsbConnected(true);
      }
    }

    // Check for disconnected status
    if (!connected && connectionStatus !== "CONNECTING") {
      let modifiedUsbUsage = false;

      // This is our initial state
      if (!usingUsb && !usingBluetooth && hasRonin) {
        WriteLog("CardReaderContext starting out with usb");
        // console.log("starting out with usb");
        setUsingUsb(true);
        setUsingBluetooth(false);
        return;
      } else if (!usingUsb && !usingBluetooth && !hasRonin) {
        WriteLog("CardReaderContext starting out with bluetooth");
        // console.log("starting out with bluetooth");
        setUsingBluetooth(true);
        return;
      }
      //
      // if (!usingUsb && !usingBluetooth && !pcbEnabled) {
      //     console.log("trying bluetooth inner");
      //     setUsingBluetooth(true);
      //     setUsingUsb(false);
      //
      // }

      if (usingUsb) {
        if (usingBluetooth) {
          setUsingBluetooth(false);
          _usbConnecting.connecting = false;
        } else {
          if (hasRonin) {
            setUsbConnected(false);

            if (failures.usb === 0) {
              _usbConnecting.connecting = false;
            }

            if (failures.usb < 1) {
              _usbConnecting.connecting = true;
              setUsbEnabled(tryAndRetry(usbEnabled));
              failures.usb++;
            } else {
              // disconnectCardReader().then(() => {})
              if (bluetoothAdapterEnabled) {
                setUsbEnabled(false);
                setUsingBluetooth(true);
                setUsingUsb(false);
              }

              _usbConnecting.connecting = false;
              failures.usb = 0;
            }
          } else {
            setUsingBluetooth(true);
            setUsingUsb(false);
          }
        }
      } else {
        if (!usingBluetooth) {
          setUsingBluetooth(true);
          return;
        }

        if (bluetoothConnected) {
          setBluetoothConnected(false);
          return;
        }

        if (bluetoothEnabled && !bluetoothConnected) {
          if (failures.bluetooth < 1 && !usingUsb) {
            setUsingBluetooth(true);
            WriteLog(
              "CardReaderContext bluetooth trying" +
                failures.bluetooth +
                pcbEnabled
            );
            // console.log("bluetooth trying", failures.bluetooth, pcbEnabled);
            setBluetoothEnabled(tryAndRetry(bluetoothEnabled));
          } else {
            // disconnectCardReader().then(() => {});
            if (pcbEnabled) {
              setUsingUsb(true);
              usbFailCount = 0;
              setUsingBluetooth(false);
            } else {
              WriteLog(
                "CardReaderContext no usb available.. going to keep trying bluetooth"
              );
              // console.log("no usb available.. going to keep trying bluetooth");
            }

            failures.bluetooth = 0;
          }

          failures.bluetooth++;
        }
      }
    }
  }, [
    currentControllerStatus,
    lastStringifiedStatus,
    tryingBluetooth,
    cardReaderListenerInitialized,
    pcbEnabled,
    usbEnabled,
    usbConnected,
    bluetoothConnected,
    usingUsb,
    usingBluetooth,
    pcbConnected,
    bluetoothEnabled,
    locationServicesEnabled,
    _usbConnecting.connecting,
  ]);

  useEffect(() => {
    if (!cardReaderListenerInitialized) {
      return;
    }

    if (!locationServicesEnabled) {
      WriteLog("CardReaderContext GETTING LOCATION");
      // console.log("GETTING LOCATION");
      requestLocationPermission().then((hasLocationPermissions) => {
        if (hasLocationPermissions) {
          setLocationServicesEnabled(true);
        } else {
          setTimeout(() => {
            blockUserUntilPermission(
              "Location Permissions",
              "Please make sure that location permissions are on for this application.",
              () => {
                if (!locationServicesEnabled) {
                  setLocationServicesEnabled(
                    locationServicesEnabled === false ? undefined : false
                  );
                }
              }
            );
          }, 1);
        }
      });
    }
  }, [cardReaderListenerInitialized, locationServicesEnabled]);

  useEffect(() => {
    if (!cardReaderListenerInitialized || !usingBluetooth) {
      return;
    }

    if (!bluetoothEnabled && !bluetoothConnected) {
      WriteLog("CardReaderContext need bluetooth permissions");
      // console.log("need bluetooth permissions");

      requestBluetoothPermission().then((bluetoothHasPermissions) => {
        if (bluetoothHasPermissions) {
          setBluetoothEnabled(true);
        }
        WriteLog(
          "CardReaderContext do we have bluetooth permissions?" +
            bluetoothHasPermissions
        );
        console.log(
          "do we have bluetooth permissions?",
          bluetoothHasPermissions
        );
      });
    }
  }, [
    cardReaderListenerInitialized,
    bluetoothEnabled,
    bluetoothConnected,
    usingUsb,
  ]);

  // Manage the bluetooth connection
  useEffect(() => {
    if (!cardReaderListenerInitialized && _bluetoothConnecting) {
      return;
    }

    if (!bluetoothEnabled || usingUsb || !usingBluetooth) {
      return;
    }

    // todo might need to rework this if/else a little bit or remove
    if (bluetoothEnabled && bluetoothConnected === undefined) {
      setBluetoothConnected(false);
      return;
    }

    if (bluetoothEnabled && !bluetoothConnected) {
      _bluetoothConnecting = true;
      bluetoothReaderConnect().then((bluetoothAlreadyConnected) => {
        if (bluetoothAlreadyConnected) {
          setBluetoothConnected(true);
          bluetoothFailCount = 0;
        } else {
          bluetoothFailCount++;
        }

        _bluetoothConnecting = false;
      });
    }
  }, [
    cardReaderListenerInitialized,
    bluetoothConnected,
    bluetoothEnabled,
    usbConnected,
    usingUsb,
  ]);

  // Handle permissions and connection for usb
  useEffect(() => {
    if (!pcbEnabled || !usingUsb || usingBluetooth) {
      // console.log("skipping usb", !pcbEnabled, !usingUsb, usingBluetooth)
      return;
    }

    if (!usbEnabled && !usbConnected) {
      requestUsbPermission().then((hasUsbPermissions) => {
        if (hasUsbPermissions) {
          setUsbEnabled(true);
        }
      });
    } else if (usbEnabled && !usbConnected) {
      usbReaderConnect().then((usbAlreadyConnected) => {
        WriteLog("CardReaderContext CALLING CARD READER CONNECT!");
        WriteLog("CardReaderContext usb reel rezult" + usbAlreadyConnected);
        WriteLog("CardReaderContext needed to connect to usb");
        WriteLog("CardReaderContext" + failures.usb);

        console.log("CALLING CARD READER CONNECT!");
        console.log(usbAlreadyConnected, "usb reel rezult");

        console.log("needed to connect to usb");
        console.log(failures.usb);

        if (usbAlreadyConnected) {
          setUsbConnected(true);
        }
      });
    }
  }, [
    cardReaderListenerInitialized,
    usbConnected,
    usbEnabled,
    pcbEnabled,
    usingUsb,
    usingBluetooth,
  ]);

  useEffect(() => {
    // console.log("pcb is enabled?", pcbEnabled)
    if (locationServicesEnabled && !pcbEnabled) {
      requestPCBPermission().then((e) => {
        // console.log("pcb result", e)
        if (e) {
          setPcbEnabled(true);
        }
      });
    }
  }, [pcbEnabled, locationServicesEnabled]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "deviceConnecting",
      (event) => {
        WriteLog("CardReaderContext cardReaderPermissions" + { event: event });
        console.log("cardReaderPermissions", { event });
        // setReaderStatus({
        //     connected: true,
        //     loading: false,
        //     connectionError: "",
        // });
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const externalStatus = useMemo(() => {
    return {
      connected: cardReaderConnected,
      loading: !cardReaderConnected,
      controllerConnectionStatus: !cardReaderListenerInitialized
        ? "UNKNOWN"
        : cardReaderConnected
        ? "CONNECTED"
        : "DISCONNECTED",
      hasBluetoothPermissions: bluetoothEnabled === true,
      connectionError: "",
      pcbEnabled: pcbEnabled, // dont change this to just `pcbEnabled`, it can be `undefined`.. always want to return a bool
      usingUsb,
      bluetoothConnected: cardReaderConnected && bluetoothConnected === true,
      usbConnected: cardReaderConnected && usbConnected === true,
      usbReaderConnect: () => {
        console.log("disabled"), WriteLog("CardReaderContext disabled");
      },
      bluetoothReaderConnect: () => {
        console.log("disabled"), WriteLog("CardReaderContext disabled");
      },
    };
  }, [
    cardReaderListenerInitialized,
    usingUsb,
    bluetoothConnected,
    usbConnected,
    bluetoothEnabled,
    bluetoothConnected,
    usbConnected,
    pcbEnabled,
    pcbConnected,
    cardReaderConnected,
  ]);

  const blockUserUntilPermission = (title, message, onPress) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Retry",
          onPress,
        },
      ],
      { cancelable: false }
    );
  };

  const initializeReaderListener = async () => {
    WriteLog("CardReaderContext initializing reader listener");
    console.log("initializing reader listener");
    try {
      return ACModule.addCardReaderListener();
    } catch (error) {
      WriteLog("CardReaderContext Error during reader listener init" + error);
      console.error("Error during reader listener init", error);
      return false;
    }
  };

  const disconnectCardReader = async () => {
    WriteLog("CardReaderContext disconnecting from card reader");
    console.log("disconnecting from card reader");
    try {
      return await ACModule.cardReaderDisconnect();
    } catch (error) {
      console.error("Error during disconnect", error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    WriteLog("CardReaderContext requesting location permission");
    console.log("requesting location permission");
    try {
      return await ACModule.requestLocationPermission();
    } catch (error) {
      WriteLog("CardReaderContext Error during location permission:" + error);
      console.error("Error during location permission:", error);
      return false;
    }
  };

  const requestBluetoothPermission = async () => {
    WriteLog("CardReaderContext requesting bluetooth permission");
    console.log("requesting bluetooth permission");
    try {
      return ACModule.requestBluetoothPermission();
    } catch (error) {
      WriteLog("CardReaderContext Error during bluetooth permission:" + error);
      console.error("Error during bluetooth permission:", error);
      return false;
    }
  };

  const requestUsbPermission = async () => {
    try {
      return await ACModule.requestUsbPermission();
    } catch (error) {
      WriteLog("CardReaderContext Error during usb permission:" + error);
      console.error("Error during usb permission:", error);
    }

    return false;
  };

  const requestPCBPermission = async () => {
    try {
      return await ACModule.requestPCBPermission();
    } catch (error) {
      WriteLog("CardReaderContext Error during pcb permission:" + error);
      console.error("Error during pcb permission:", error);
      return false;
    }
  };

  const bluetoothReaderConnect = async () => {
    try {
      return await ACModule.requestBluetoothConnection();
    } catch (e) {
      return false;
    }
  };

  const usbReaderConnect = async () => {
    try {
      return await ACModule.requestUSBConnection();
    } catch (error) {
      // Handle errors here
      WriteLog(
        "CardReaderContext Error during permission requests or USB connection:" +
          error
      );
      console.error(
        "Error during permission requests or USB connection:",
        error
      );
    }
  };

  const getConnectionInfo = async () => {
    return await ACModule.showReaderConnection();
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "productionCardReaderLogs",
      (event) => {
        // setExecutionLogs((prevState) => [...prevState, event]);
        // console.log("event logs", event)
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <CardReaderContext.Provider value={{ ...externalStatus, ...{ netInfo } }}>
      {children}
    </CardReaderContext.Provider>
  );
}

CardReaderContextProvider.propTypes = {
  children: PropTypes.element,
};

export const useCardReaderContext = () => React.useContext(CardReaderContext);

export default CardReaderContextProvider;
