import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { BackHandler, StyleSheet } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { CheckmarkCircleIcon } from "../../components/atoms/Icons/Icons";
import { Heading, Label } from "../../components/atoms/Text";
import { Box } from "../../components/layouts/BoxContainer";
import Row from "../../components/particles/Row";
import { useTrackedState } from "../../contexts/CartContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import { formatCentsForUiDisplay } from "../../helpers/calc";

export function TransactionApprovedRfid(props) {
  const theme = useTheme();
  const { tip, totalCharge } = useContext(TransactionContext);
  const cartState = useTrackedState();
  const { total } = cartState;

  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const handleNoReceipt = () => {
    return navigation.navigate("TransactionRfidComplete");
  };

  return (
    <Box style={styles.prompt}>
      <Heading variants="h2">BANZAI!</Heading>
      <CheckmarkCircleIcon
        width={100}
        height={100}
        fill={`${theme["color-success-500"]}`}
        style={styles.marginVertical}
      />
      <Heading variants="h1">${formatCentsForUiDisplay(totalCharge)}</Heading>
      <Heading
        variants="h4"
        style={{ color: `${theme["color-basic-700"]}`, marginVertical: 20 }}
      >
        PAID, Thank you!
      </Heading>
      <Row>
        <ButtonExtended
          style={styles.button}
          title="CONTINUE"
          onPress={handleNoReceipt}
          status="secondary"
          size="giant"
        >
          <Label>CONTINUE</Label>
        </ButtonExtended>
      </Row>
    </Box>
  );
}

const styles = StyleSheet.create({
  // ** TODO: global style
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  marginVertical: {
    marginVertical: 10,
  },
  prompt: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
});
