import { Text } from "@ui-kitten/components";
import React, { useContext } from "react";
import { View } from "react-native";
import { useTrackedState } from "../contexts/CartContext";
import { DiscountContext } from "../contexts/DiscountContext";
import { displayForLocale, getDiscountValue } from "../helpers/calc";

const DiscountDisplay = () => {
  const { discount, isDiscounted, discountType } = useContext(DiscountContext);

  const cartState = useTrackedState();

  const total = cartState?.total;

  return (
    <View>
      {isDiscounted && (
        <View>
          {discountType === "percentage" ? (
            <Text category="h5">
              Discount: -{displayForLocale(getDiscountValue(discount, total))}
            </Text>
          ) : (
            <Text category="h5">Discount: - {displayForLocale(discount)}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default DiscountDisplay;
