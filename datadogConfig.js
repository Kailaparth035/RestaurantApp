import {
  DdLogs,
  DdSdkReactNative,
  DdSdkReactNativeConfiguration,
} from "@datadog/mobile-react-native";
import { DD_APPLICATION_ID, DD_CLIENT_TOKEN, DD_ENVIRONMENT } from "@env";

export default function initializeDatadog() {
  const config = new DdSdkReactNativeConfiguration(
    DD_CLIENT_TOKEN,
    DD_ENVIRONMENT,
    DD_APPLICATION_ID,
    true,
    true,
    true,
    "granted"
  );
  config.nativeCrashReportEnabled = true;
  config.sampleRate = 100;

  DdSdkReactNative.initialize(config).then(() => {
    DdLogs.info("The RN Sdk was properly initialized");
  });
}
