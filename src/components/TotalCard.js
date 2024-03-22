import { Text } from "@ui-kitten/components";
import React, { useContext } from "react";
import { View } from "react-native";
import { useTrackedState } from "../contexts/CartContext";
import { DiscountContext } from "../contexts/DiscountContext";
import { getTotal, getWithDiscountTotal } from "../helpers/calc";

export default function TotalCard() {
  const cartState = useTrackedState();
  const { total } = cartState;
  const { discount, isDiscounted, discountType } = useContext(DiscountContext);

  return (
    <View>
      {isDiscounted ? (
        <Text category="h3">
          Order Total:
          {getWithDiscountTotal(discount, total, discountType)}
        </Text>
      ) : (
        <Text category="h3">Order Total: {getTotal(total)}</Text>
      )}
    </View>
  );
}
