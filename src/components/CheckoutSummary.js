import { Layout, Text } from "@ui-kitten/components";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { DispatchCartContext, StateCartContext } from "../contexts/CartContext";
import {
  formatNumber,
  getDiscountTaxAmountForUi,
  getTaxAmount,
  getTotal,
  getWithDiscountTotal,
} from "../helpers/calc";
import { globalStyles } from "../styles/global";
import { Heading } from "./atoms/Text/index";
import DiscountDisplay from "./DiscountDisplay";

export default function CheckoutSummary() {
  const { paymentProcessed, discount, isDiscounted, discountType } =
    useContext(DispatchCartContext);

  const { itemCount, total } = useContext(StateCartContext);

  return (
    <Layout level="1" style={globalStyles.CartSummary}>
      {!paymentProcessed ? (
        <View>
          {/* TODO: Turn into reusable component  */}
          <Text>Total Items: {itemCount}</Text>
          <Heading variants="h5">Subtotal: {formatNumber(total)}</Heading>
          <DiscountDisplay />
          {/* TODO: Turn into reusable component? */}
          {isDiscounted ? (
            <Heading variants="h5">
              Taxes: {getDiscountTaxAmountForUi(discount, total, discountType)}
            </Heading>
          ) : (
            <Heading variants="h5">Taxes: {getTaxAmount(total)}</Heading>
          )}
          {/* TODO: Turn into reusable component? */}
          {isDiscounted ? (
            <Heading variants="h4">
              Total:
              {getWithDiscountTotal(discount, total, discountType)}
            </Heading>
          ) : (
            <Heading variants="h4">Total: {getTotal(total)}</Heading>
          )}
        </View>
      ) : (
        <View style={styles.noItems}>
          <Heading variants="h4">List of cart items to appear here</Heading>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  noItems: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
});
