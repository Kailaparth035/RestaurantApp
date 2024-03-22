import { useNavigation } from "@react-navigation/native";
import { Button, useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { CheckmarkCircleIcon } from "../../components/atoms/Icons/Icons";
import { Heading } from "../../components/atoms/Text";
import Row from "../../components/particles/Row";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import {
  formatCentsForUiDisplay,
  getSubtotalAfterDiscount,
} from "../../helpers/calc";

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

export function ApprovedStep({ route }) {
  const { totalCharge } = useContext(TransactionContext);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const navigation = useNavigation();

  const theme = useTheme();

  const cartState = useTrackedState();
  const { total } = cartState;
  const { selectedDiscount, discount, discountType } =
    useContext(DiscountContext);

  const totalWithoutTip = selectedDiscount
    ? getSubtotalAfterDiscount(discount, total, discountType)
    : total;

  function NoReceiptButton() {
    return (
      <View>
        <Button
          style={styles.button}
          title="NO RECEIPT"
          onPress={() => navigation.navigate("TransactionCompletedStepCash")}
          status="secondary"
          size="medium"
        >
          NO RECEIPT
        </Button>
      </View>
    );
  }

  function SMSReceiptButton() {
    return (
      <View>
        <Button
          style={styles.button}
          title="SMS RECEIPT"
          onPress={() => navigation.navigate("EnterPhoneNumberStepCash")}
          status="secondary"
          size="medium"
        >
          SMS RECEIPT
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.prompt}>
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
        <View style={styles.sameWidth}>
          <NoReceiptButton />
        </View>

        {/*<View style={styles.sameWidth}>*/}
        {/*  <SMSReceiptButton />*/}
        {/*</View>*/}
      </Row>
    </View>
  );
}
