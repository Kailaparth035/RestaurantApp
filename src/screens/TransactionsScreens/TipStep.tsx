import { useNavigation } from "@react-navigation/native";
import { Layout } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet } from "react-native";
import TipCalculator from "../../components/TipCalculator";

const styles = StyleSheet.create({
  Layout: {
    alignItems: "stretch",
    display: "flex",
    height: 400,
  },
  button: {
    marginHorizontal: 60,
    marginVertical: 20,
  },
});

export const TipStep = (props: any) => {
  const navigation = useNavigation();

  const handleNextButton = () => {
    switch (props?.route?.name) {
      case "TipStepCredit":
        //@ts-ignore
        navigation.navigate("CreditStart");
        break;
      case "TipStepRfid":
        //@ts-ignore
        navigation.navigate("ReaderReady");
        break;
      case "TipStepQRCode":
        //@ts-ignore
        navigation.navigate("QRCodeReaderReady");
        break;
      default:
        //@ts-ignore
        navigation.navigate("Menu");
        break;
    }
  };
  const handleBackPress = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  return (
    <Layout style={styles.Layout}>
      <TipCalculator
        next={handleNextButton}
        tipPercentage={props?.route?.params?.tip_percentage} />
    </Layout>
  );
};
