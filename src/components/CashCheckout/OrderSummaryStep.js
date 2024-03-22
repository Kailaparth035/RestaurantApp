import { Button, Layout, Text } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { View } from "react-native";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import {
  formatCentsForUiDisplay,
  getChange,
  getSubtotalAfterDiscount,
} from "../../helpers/calc";
import { globalStyles } from "../../styles/global";

// TODO: prevent going back to tip view when transaction is completed
function OrderSummaryStep(props) {
  const { next } = props;
  const { tenderedAmount, tip, methodOfPayment } =
    useContext(TransactionContext);

  const { selectedDiscount, discount, discountType } =
    useContext(DiscountContext);

  const cartState = useTrackedState();
  const { total } = cartState;

  const totalWithoutTip = selectedDiscount
    ? getSubtotalAfterDiscount(discount, total, discountType)
    : total;
  const change = getChange(tenderedAmount, totalWithoutTip, tip);

  return (
    <Layout level="1" style={globalStyles.container}>
      <View>
        {tenderedAmount > 0 && <Text>Tendered: $ {tenderedAmount}</Text>}
        <Text>Subtotal: $ {formatCentsForUiDisplay(totalWithoutTip)}</Text>
        {methodOfPayment === "credit" && (
          <Text>Tip: $ {formatCentsForUiDisplay(tip)}</Text>
        )}
        {change > 0 && <Text> Please return to customer: $ {change}</Text>}
        {/* {change < 0 && <Text>Please return to customer: $ {change}</Text> } */}
      </View>
      <View>
        {/* <Text>Logged Transaction</Text> */}
        {/* <Text>Order Total: {formatNumber(total)+tip}</Text> */}
        {/* <Text>{deviceId}</Text>         */}
        {/* <Text>{JSON.stringify(orderServiceInput)}</Text> */}
        {/* <Text>{JSON.stringify({ cartItems })}</Text> */}
        {/* {console.log(JSON.parse(JSON.stringify({ cartItems })))} */}
        {/* { const itemz = JSON.parse(JSON.stringify({ cartItems })) } */}
        {/* <Text>Method of payment: {methodOfPayment}</Text> */}
        {/* <Text>Tendered amount: {tenderedAmount}</Text> */}
        {/* <Text>Tip amount: {tip}</Text> */}
        {/* <Text>Change: {change}</Text> */}
      </View>
      <View>
        {/* {mutationLoading && <Text>Loading...</Text>}
        {mutationError && <Text>Error :( Order not pushed </Text>}
        <Text>{completedMutation}</Text> */}
        {/* <Text>Order Total: {formatNumber(total)}</Text>
        <Text>CartItems: {JSON.stringify({ cartItems })}</Text>
        <Text>Method of payment: {methodOfPayment}</Text>
        <Text>Tendered amount: {tenderedAmount}</Text>
        <Text>Tip amount: {tip}</Text>
        <Text>Change: {tenderedAmount - formatForCashCalculator(total)}</Text> */}
        {/* <Text>{JSON.stringify(currentOrder)}</Text> */}
        {/* <Text>Device Id: {deviceId}</Text> */}
        <View>
          <Button title="Next" disabled={false} onPress={next}>
            OK
          </Button>
        </View>
      </View>
    </Layout>
  );
}

OrderSummaryStep.propTypes = {
  next: PropTypes.func.isRequired,
};

export default OrderSummaryStep;
