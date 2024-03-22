/* eslint-disable react/require-default-props */
import { Text } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";
import { View } from "react-native";
import { formatNumber } from "../helpers/calc";
import { globalStyles } from "../styles/global";

const CheckoutItem = ({ item }) => (
  <View style={globalStyles.CheckoutItem}>
    <View>
      <Text category="s1">{item.quantity}</Text>
    </View>
    <View style={globalStyles.CartItem_Name}>
      <Text category="h6">{item.name}</Text>
    </View>
    <View style={globalStyles.CartItem_Price}>
      <Text category="h6">{formatNumber(item.price)}</Text>
    </View>
  </View>
);

CheckoutItem.propTypes = {
  item: {
    price: PropTypes.number,
    quantity: PropTypes.number,
    name: PropTypes.string,
  },
};

export default CheckoutItem;
