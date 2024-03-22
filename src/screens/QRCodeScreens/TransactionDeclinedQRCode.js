import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { CloseXCircleIcon } from "../../components/atoms/Icons/Icons";
import { Heading, Label } from "../../components/atoms/Text";
import { Box } from "../../components/layouts/BoxContainer";
import Row from "../../components/particles/Row";
import { useAuth } from "../../contexts/AuthContext";
import { WriteLog } from "../../CommonLogFile";

export function TransactionDeclinedQRCode({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    tabletSelections: { location: selectedLocation, menu: selectedMenu },
  } = useAuth();
  const handleCancel = () => {
    if (selectedMenu?.is_tips) {
      return navigation.navigate("TipStepQRCode");
    } else {
      return navigation.navigate("Menu");
    }
  };
  const handleRestart = () => {
    if (!selectedMenu?.is_tips) {
      return navigation.navigate("QRCodeReaderReady");
    }else {
      return navigation.navigate("TipStepQRCode");
    }
  };

  const { errorType, errorHeader, errorMessage } = route.params;
  // WriteLog(
  //   "TransactionDeclinedRfid Rfid Invalid - [error while doing the Lookup] :"
  // );
  console.log(
    "Rfid Invalid - [error while doing the Lookup] :",
    errorType || "no error"
  );
  return (
    <Box level="1" width="100%" style={styles.prompt}>
      <CloseXCircleIcon
        width={100}
        height={100}
        fill={`${theme["color-primary-500"]}`}
        style={styles.marginVertical}
      />
      <Heading variants="h2">
        {errorHeader ? errorHeader : `Something Went Wrong.`}
      </Heading>
      <Heading variants="h3" style={{ color: `${theme["color-basic-700"]}` }}>
        {errorMessage
          ? errorMessage
          : `We're sorry, your transaction is declined.`}
      </Heading>
      <Heading variants="h4" style={{ color: `${theme["color-basic-700"]}` }}>
        Please flip back to cashier
      </Heading>
      <Row style={styles.marginVertical}>
        <View style={styles.sameWidth}>
          <ButtonExtended
            style={styles.button}
            title="Try Again"
            onPress={handleRestart}
            status="primary"
            size="giant"
          >
            <Label
              buttonLabel="none"
              variants="label"
              variantStyle="uppercaseBold"
            >
              Try Again
            </Label>
          </ButtonExtended>
        </View>
        <View style={styles.sameWidth}>
          <ButtonExtended
            style={styles.button}
            onPress={handleCancel}
            status="secondary"
            size="giant"
          >
            <Label
              buttonLabel="none"
              variants="label"
              variantStyle="uppercaseBold"
            >
              Cancel
            </Label>
          </ButtonExtended>
        </View>
      </Row>
    </Box>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  marginVertical: {
    marginVertical: 10,
  },
  prompt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  sameWidth: {
    flex: 1,
  },
});
