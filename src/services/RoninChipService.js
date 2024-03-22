import { DeviceEventEmitter, NativeModules } from "react-native";

const { RoninChipModule } = NativeModules;

const onRfidScanResult = (event) => console.info(event);
DeviceEventEmitter.addListener("onScanResult", onRfidScanResult);

export default RoninChipModule;
