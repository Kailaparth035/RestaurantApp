import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { BackHandler, StyleSheet } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { CheckmarkCircleIcon } from "../../components/atoms/Icons/Icons";
import { Heading, Label } from "../../components/atoms/Text";
import { Box } from "../../components/layouts/BoxContainer";
import Row from "../../components/particles/Row";
import { TransactionContext } from "../../contexts/TransactionContext";
import { formatCentsForUiDisplay } from "../../helpers/calc";

export function TransactionApprovedCredit(props) {
  const theme = useTheme();
  const { totalCharge, orderTotals, updateOrderWithPhoneNumber } = useContext(TransactionContext);
  const {reference_id} = props;
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const handleReceipt = () => {
    navigation.navigate("EnterPhoneNumberStepCredit", {reference_id});
  };

  const handleNoReceipt = () => {
    updateOrderWithPhoneNumber({ref_id: reference_id, phone_number: ""});
    navigation.navigate("TransactionCompletedStepCredit",{reference_id});
  };
  
  const {total_paid} = orderTotals

  return (
    <Box style={styles.prompt}>
      <Heading variants="h2">BANZAI!</Heading>
      <CheckmarkCircleIcon
        width={100}
        height={100}
        fill={`${theme["color-success-500"]}`}
        style={styles.marginVertical}
      />
      <Heading variants="h1">${formatCentsForUiDisplay(total_paid)}</Heading>
      <Heading
        variants="h4"
        style={{ color: `${theme["color-basic-700"]}`, marginVertical: 20 }}
      >
        PAID, Thank you!
      </Heading>
      <Row>
        <ButtonExtended
          style={styles.button}
          title="SMS RECEIPT"
          onPress={handleReceipt}
          status="secondary"
          size="giant"
        >
          <Label>SMS RECEIPT</Label>
        </ButtonExtended>
        <ButtonExtended
          style={styles.button}
          title="NO RECEIPT"
          onPress={handleNoReceipt}
          status="secondary"
          size="giant"
        >
          <Label>NO RECEIPT</Label>
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
