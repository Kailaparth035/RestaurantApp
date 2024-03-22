import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { WriteLog } from "../../../src/CommonLogFile";

const QrCodeScanner = () => {
  const onSuccess = (e) => {
    alert(e.data);
    WriteLog("QrCodeScanner " + e.data);
    console.log("e ::::", e.data);
  };
  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner
        cameraType="front"
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.torch}
      />
    </View>
  );
};
export default QrCodeScanner;

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)",
  },
  buttonTouchable: {
    padding: 16,
  },
});
