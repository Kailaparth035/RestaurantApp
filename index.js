import "fast-text-encoding";
/**
 * @format
 */
import { AppRegistry, LogBox } from "react-native";
// import Reactotron from "reactotron-react-native";
import "react-native-gesture-handler";
import { name as appName } from "./app.json";
// import initializeDatadog from "./datadogConfig";
import App from "./src/App";

// confirmation of hermes being enabled
if (typeof HermesInternal === "undefined") {
  console.log("Hermes is not enabled");
} else {
  console.log("Hermes is enabled");
}
LogBox.ignoreAllLogs(true);

// https://github.com/jhen0409/react-native-debugger/issues/382
// resolves JSON native debugger issue: Error: Unexpected token o in JSON at position 1
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
global.FormData = global.originalFormData || global.FormData;

if (window.FETCH_SUPPORT) {
  window.FETCH_SUPPORT.blob = false;
} else {
  global.Blob = global.originalBlob || global.Blob;
  global.FileReader = global.originalFileReader || global.FileReader;
}
AppRegistry.registerComponent(appName, () => App);
