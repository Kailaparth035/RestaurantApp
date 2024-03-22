import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  DeviceEventEmitter,
  StyleSheet,
  View,
} from "react-native";
import { RNCamera } from "react-native-camera";
import QRCodeScanner from "react-native-qrcode-scanner";
import { Heading } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import MemoArrowIcon from "../../components/atoms/Icons/ArrowIcon";
import { ConnectReaderIcon } from "../../components/atoms/Icons/Icons";
import { useTheme } from "@ui-kitten/components";
import { useAuth } from "../../contexts/AuthContext";
import { getRfidLocal } from "../RfidScreens/utils";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import RoninChipService from "../../services/RoninChipService";
import { startsWith } from "lodash";
import { Q } from "@nozbe/watermelondb";

const ScaningScreen = (props) => {
  const navigation = useNavigation();
  const database = useDatabase();
  const isFocus = useIsFocused();
  const theme = useTheme();
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [shouldGoBack, setShouldGoBack] = useState(false);

  const regHex = /[0-9A-Fa-f]{6}/g;

  const {
    tabletSelections: {
      location: selectedLocation },
  } = useAuth();

  async function getRfidValidLocalDB(scannedUUID) {
    try {
      const rfid_asset = await getRfidLocal(database, scannedUUID);
      //console.log("@@====rfid_asset======", rfid_asset)
      if (Object.keys(rfid_asset).length !== 0) {
        try {
          let data = rfid_asset?.tokens_balance;
          let tokenArray = selectedLocation.redeemable_tokens;
          let result = false;

          if (Object.keys(data).length !== 0) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                const redeemableTokenId = data[key].redeemable_token_id;
                result = tokenArray.indexOf(redeemableTokenId) > -1;
                if (result) {
                  if (data[key].balance > 0) {
                    data[key].balance = (parseInt(data[key].balance) - 1).toString();
                    try {
                      let record = await database.collections
                        .get("rfid_assets")
                        .query(Q.where("uid", scannedUUID))
                        .fetch();
                      await database.action(async () => {
                        await record[0].update((record) => {
                          record.tokens_balance = data;
                          record.is_sync = false;
                        });
                      });
                      setIsActive(false);
                      setShouldGoBack(false);
                      navigation.navigate("TokenRedeemSuccessFail", {
                        message: "1 " + redeemableTokenId + " Redeemed!",
                        status: "success",
                        currentTokenBalance: data,
                        screenName: props?.route?.params?.screenName
                      });
                    } catch (error) {
                      // console.log("error :::", error);
                    }
                    break;
                  } else {
                    const keys = Object.keys(data);
                    const lastKey = keys[keys.length - 1];
                    if (lastKey == redeemableTokenId && data[key].balance == 0) {
                      setIsActive(false);
                      setShouldGoBack(false);
                      navigation.navigate("TokenRedeemSuccessFail", {
                        message: "Insufficent Balance - " + scannedUUID + " has balance of",
                        status: "fail",
                        currentTokenBalance: data,
                        screenName: props?.route?.params?.screenName
                      });
                    }
                  }
                }
              }
            }
            if (!result) {
              setIsActive(false);
              setShouldGoBack(false);
              navigation.navigate("TokenRedeemSuccessFail", {
                message: "Invalid Gate - " + scannedUUID + " has balance of",
                status: "fail",
                currentTokenBalance: data,
                screenName: props?.route?.params?.screenName
              });
            }
          } else {
            setIsActive(false);
            setShouldGoBack(false);
            navigation.navigate("TokenRedeemSuccessFail", {
              message: "Cashless Asset Found With No Balance -" + scannedUUID + ".",
              status: "fail",
              screenName: props?.route?.params?.screenName
            });
          }
          //console.log("@@=====data[key].balance=====", data)
        } catch (error) {
          console.log({ error });
        }
      } else {
        setIsActive(false);
        setShouldGoBack(false);
        navigation.navigate("TokenRedeemSuccessFail", {
          message: "Cashless Asset Not Found - " + scannedUUID + ".",
          status: "fail",
          screenName: props?.route?.params?.screenName
        });
      }
    } catch (error) {
      console.log({ error });
    }
  }

  const executePayment = async (newEvent) => {
    if (regHex.test(newEvent) && newEvent.length >= 8) {
      const result = newEvent;
      try {
        await getRfidValidLocalDB(result);
      } catch (e) {
        setIsActive(false);
        setShouldGoBack(false);
        navigation.navigate("TokenRedeemSuccessFail", {
          message: "Cashless Asset Not Found - " + result + ".",
          status: "fail",
          screenName: props?.route?.params?.screenName
        });
        console.log(`[onRfidScanResult] ${e}`);
      }
    } else {
      setIsActive(false);
      setShouldGoBack(false);
      navigation.navigate("TokenRedeemSuccessFail", {
        message: "Cashless Asset Not Found - " + result + ".",
        status: "fail",
        screenName: props?.route?.params?.screenName
      });
    }
  };

  const onSuccess = (e) => {
    if (e.data) {
      newEvent = e.data;
      if (startsWith(newEvent, "00")) {
        newEvent = newEvent.slice(2);
      }
      executePayment(newEvent);
    }
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onRfidScanResult",
      async (event) => {
        console.log("@@============RFID SCAN RESULT", event);
        if (startsWith(event, "00")) {
          newEvent = event.slice(2);
          executePayment(newEvent);
        } else if (event == "Asset not detected") {
          setShouldGoBack(true);
        }
        regHex.lastIndex = 0; // be sure to reset the index after using .text()
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const scanRFID = async () => {
    try {
      await RoninChipService.callScanRfid();
    } catch (error) {
      console.log("scan called error");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (props?.route?.params?.screenName !== "QrCode") {
        scanRFID();
      }
    }, 900);
  }, [isFocus]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );
  }, []);

  useEffect(() => {
    let interval;
    if (isActive && timer < 15) {
      //console.log("@@======timer=====", timer)
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (timer === 15 && !shouldGoBack) {
      //console.log("@@======goBack=====")
      setShouldGoBack(true);
    }
    return () => clearInterval(interval);
  }, [timer, isActive, shouldGoBack]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // Reset timer when screen comes into focus
      setTimer(0);
      setIsActive(true);
      setShouldGoBack(false);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      // Stop timer when screen loses focus
      setIsActive(false);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    if (shouldGoBack) {
      // Go back only if the flag is set
      navigation.goBack();
    }
  }, [shouldGoBack, navigation]);

  const PaymentMethodIcon = (props) => {
    return <ConnectReaderIcon {...props} />;
  };
  return (
    <View style={styles.mainView}>
      {props?.route?.params?.screenName === "QrCode" ? (
        <QRCodeScanner
          cameraContainerStyle={{ alignSelf: "center" }}
          cameraStyle={{ width: 100, height: 400 }}
          cameraType="front"
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.torch}
        />
      ) : (
        <Block flexDirection="column" style={{ height: 150 }}>
          <Heading variants="h1">Please Tap Wristband</Heading>
          <View style={styles.bottomButtonView}>
            <PaymentMethodIcon
              width={100}
              height={100}
              fill={`${theme["color-basic-700"]}`}
              style={styles.cardIcon}
            />
            <MemoArrowIcon width={100} height={100} />
          </View>
        </Block>
      )}
    </View>
  );
};

export default ScaningScreen;

const styles = StyleSheet.create({
  mainView: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
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
  cardIcon: {
    marginRight: 33,
  },
  bottomButtonView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 60,
  },
});
