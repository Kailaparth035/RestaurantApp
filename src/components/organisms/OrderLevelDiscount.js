/* eslint-disable import/prefer-default-export */
import { Divider, Layout, Text } from "@ui-kitten/components";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { DispatchCartContext } from "../../contexts/CartContext";
import {
  formatNumber,
  getDiscountTaxAmountForUi,
  getTaxAmount,
  getTotal,
  getWithDiscountTotal,
} from "../../helpers/calc";
import { globalStyles } from "../../styles/global";
import DiscountDisplay from "../DiscountDisplay";
import DiscountSelect from "../DiscountSelect";
import { OrderDiscount } from "./OrderDiscount";

// TODO: RESET DISCOUNT TO INITIAL STATE AFTER ORDER COMPLETED

export const OrderLevelDiscount = () => {
  const {
    cartItems,
    itemCount,
    total,
    discount,
    isDiscounted,
    setIsDiscounted,
    discountType,
    previousIndex,
    selectedDiscount,
    setSelectedDiscount,
  } = useContext(DispatchCartContext);
  const scrollViewRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = useState("");

  useEffect(() => {
    setIsDiscounted(false);
    setSelectedDiscount(null);
  }, [setIsDiscounted, setSelectedDiscount]);

  useEffect(() => {
    // keep ui updated with current discount
    if (previousIndex) {
      setIsDiscounted(true);
    }
    if (!selectedDiscount) {
      setIsDiscounted(false);
    }
  }, [previousIndex, selectedDiscount, setIsDiscounted]);

  return (
    <Layout level="1">
      <ScrollView style={globalStyles.CartItems} ref={scrollViewRef}>
        <View>
          <Text category="h4">Order Discount</Text>
          {/* TODO: for phase II? 
          <View style={{ flexDirection: "row" }}>
            <Button>Amount</Button>
            <Button appearance="outline">Code</Button>
            <Button>Percent</Button>
            <Input
              placeholder="Place your Text"
              value={value}
              onChangeText={(nextValue) => setValue(nextValue)}
            />
            <Button>Apply</Button>
            <Button appearance="outline">Remove</Button>
          </View> */}
          <DiscountSelect />
        </View>

        <Layout level="1" style={globalStyles.splitUI}>
          <View style={{ paddingHorizontal: 20 }}>
            <OrderDiscount />
            <Divider />
            <Divider />
          </View>

          <View style={globalStyles.CartTotal}>
            {cartItems.length > 0 ? (
              <View>
                <Text>Total Items: {itemCount}</Text>
                <Text category="h5">Subtotal: {formatNumber(total)}</Text>
                <DiscountDisplay />
                {/* TODO: Turn into reusable component? */}
                {isDiscounted ? (
                  <Text category="h5">
                    Taxes:{" "}
                    {getDiscountTaxAmountForUi(discount, total, discountType)}
                  </Text>
                ) : (
                  <Text category="h5">Taxes: {getTaxAmount(total)}</Text>
                )}
                {/* TODO: Turn into reusable component? */}
                {isDiscounted ? (
                  <Text category="h4">
                    Total:
                    {getWithDiscountTotal(discount, total, discountType)}
                  </Text>
                ) : (
                  <Text category="h4">Total: {getTotal(total)}</Text>
                )}
              </View>
            ) : (
              <View>
                <Text>You Have Removed All Your Items.</Text>
              </View>
            )}
          </View>
        </Layout>
      </ScrollView>
    </Layout>
  );
};
