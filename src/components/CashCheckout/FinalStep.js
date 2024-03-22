import React, { useContext } from "react";
import { Text, View } from "react-native";
import { useTrackedState } from "../../contexts/CartContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import { formatForCashCalculator, formatNumber } from "../../helpers/calc";

function FinalStep() {
  const { tenderedAmount, tip, methodOfPayment } =
    useContext(TransactionContext);
  const cartState = useTrackedState();
  const { total, cartItems } = cartState;

  const currentOrder = {
    id: null,
    items: { cartItems },
    subtotal: null,
    tax: null,
    tip: null,
    status: null,
    device_id: null,
    user_id: null,
    created_at: null,
    transaction_at: null,
    reference_id: null,
    attendee_id: null,
    transaction_time: null,
    event_id: null,
    location_id: null,
    payment_method: null,
  };

  return (
    <View>
      <Text>Order#: {Math.floor(100000 + Math.random() * 900000)};</Text>
      <Text>Order Total: {formatNumber(total)}</Text>
      <Text>CartItems: {JSON.stringify({ cartItems })}</Text>
      <Text>Method of payment: {methodOfPayment}</Text>
      <Text>Tendered amount: {tenderedAmount}</Text>
      <Text>Tip amount: {tip}</Text>
      <Text>Change: {tenderedAmount - formatForCashCalculator(total)}</Text>
      <Text>{JSON.stringify(currentOrder)}</Text>
    </View>
  );
}

export default FinalStep;
