/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Heading } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { OrderTotal } from "../../components/molecules/OrderTotal";
import { PaymentAction } from "../../components/organisms/PaymentAction";
import { NormalisedSizes } from "../../hooks/Normalized";
import RoninChipService from "../../services/RoninChipService";
import { WriteLog } from "../../CommonLogFile";
import { SYNC_STATUS_VERIFY } from "../../helpers/constants";

let ScanRFIDInProgress = false;
export function ReaderReady(props) {
  const navigation = useNavigation();

  const handleCancel = () => {
    navigation.pop();
  };

  const handleGetUid = async () => {
    if (ScanRFIDInProgress === true) {
      WriteLog("ReaderReady [RFID] RFID scan in progess this is a miss fire! ");
      console.log(`[RFID] RFID scan in progess this is a miss fire!`);
      return;
    }

    ScanRFIDInProgress = true;
    navigation.navigate("RFID");
    // WriteLog("ReaderReady Scanned a wristband going to RFID");
    // console.log("Scanned a wristband going to RFID");
    return await RoninChipService.callScanRfid();
    // return await RoninChipService.callFakeScanRfid("00AABBAABB");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // WriteLog("ReaderReady FIRING RFID SCAN");
      // console.log("FIRING RFID SCAN");
      setTimeout(() => {
        ScanRFIDInProgress = false;
        handleGetUid();
      }, SYNC_STATUS_VERIFY);
    });
    return unsubscribe;
  }, [navigation]);

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
          Please Tap Wristband
        </Heading>
        <OrderTotal style={{ textAlign: "center" }} />
        <PaymentAction paymentType="RFID" />
      </Block>
    </Box>
  );
}
