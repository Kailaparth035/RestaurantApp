/* eslint-disable react-native/no-inline-styles */
import {  useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Heading } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { OrderTotal } from "../../components/molecules/OrderTotal";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { SCREEN_NAME } from "../../helpers/constants";

export function QRCodeReaderReady(props) {
  const navigation = useNavigation();
  const scannerRef = useRef(null);

  const onSuccess = (e) => {
    console.log("@@=====e=======", e.data)
    navigation.navigate(SCREEN_NAME.QRCODE, { data: e.data, });
  };

  return (
    <Box
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Block
        flexDirection="column"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Heading>
          Please Scan QR Code
        </Heading>
        <OrderTotal style={{ textAlign: "center" }} />

        <Box
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: 300,
            width: 540,
            marginTop: 20,
          }}>
          <QRCodeScanner
            cameraType="front"
            onRead={onSuccess}
            ref={scannerRef}
            flashMode={RNCamera.Constants.FlashMode.torch}
            cameraStyle={{ width: 420, height: 300, alignSelf: "center" }}
          />
        </Box>
      </Block>
    </Box>
  );
}
