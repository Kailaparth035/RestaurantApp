import { DeviceEventEmitter, NativeModules } from "react-native";

const { ACModule } = NativeModules;

const onCardReaderConnectFailed = (event) => console.info(event);
DeviceEventEmitter.addListener(
    "onCardReaderConnectFailed",
    onCardReaderConnectFailed
);

const onCardReaderError = (event) => console.info(event);
DeviceEventEmitter.addListener("onCardReaderError", onCardReaderError);

const onCardReaderConnected = (event) => console.info(event);
DeviceEventEmitter.addListener("onCardReaderConnected", onCardReaderConnected);

const onMultipleBluetoothDevicesFound = (event) => console.info(event);
DeviceEventEmitter.addListener(
    "onMultipleBluetoothDevicesFound",
    onMultipleBluetoothDevicesFound
);

// const onCardReaderEvent = event => console.info(event);
// DeviceEventEmitter.addListener('onCardReaderEvent', event => console.info(event.message) );
const onCardReaderEvent = (event) => console.info(event);
DeviceEventEmitter.addListener("onCardReaderEvent", onCardReaderEvent);

const onActivityEvent = (event) => console.info(event);
DeviceEventEmitter.addListener("onActivityEvent", onActivityEvent);

const onTransactionEvent = (event) => console.info(event);
DeviceEventEmitter.addListener("onTransactionEvent", onTransactionEvent);

const onRfidScanResult = (event) => console.info(event);
DeviceEventEmitter.addListener("onScanResult", onRfidScanResult);

export default ACModule;