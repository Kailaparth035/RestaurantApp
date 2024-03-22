import React, { Component, useEffect } from "react";
import { BackHandler, Dimensions, StyleSheet, Text, View } from "react-native";
import { NormalisedSizes } from "../../hooks/Normalized";
import { Heading, Label } from "../../components/atoms/Text";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Block } from "../../components/layouts/block";
import { Button, styled } from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";

const TicketRedemption = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate("AdminPanel", {
          screen: "UserPasscode",
        });
        return true;
      }
    );
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        <Block style={[styles.buttonInnerView, { marginRight: 50 }]}>
          <ButtonExtended
            size="mammoth"
            onPress={() => {
              navigation.navigate("ScaningScreen", { screenName: "QrCode" });
            }}
            style={styles.buttonExtended}
            variants=""
          >
            <View style={styles.buttonInnerView}>
              <Text style={styles.buttonText}> Scan {"\n"}QR Code</Text>
            </View>
          </ButtonExtended>
        </Block>
        <Block style={[styles.buttonInnerView, { marginLeft: 50 }]}>
          <ButtonExtended
            size="mammoth"
            onPress={() => {
              navigation.navigate("ScaningScreen", { screenName: "wristBand" });
            }}
            style={styles.buttonExtended}
            variants=""
          >
            <View style={styles.buttonInnerView}>
              <Text style={styles.buttonText}>Scan Wristband</Text>
            </View>
          </ButtonExtended>
        </Block>
      </View>
    </View>
  );
};

export default TicketRedemption;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainView: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: NormalisedSizes(20),
    flexDirection: "row",
    height: "100%",
  },
  buttonInnerView: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: NormalisedSizes(37),
    fontWeight: "600",
    color: "white",
    marginHorizontal: 30,
  },
  buttonExtended: {
    height: NormalisedSizes(160),
    borderRadius: NormalisedSizes(20),
    width: NormalisedSizes(400),
  },
});
