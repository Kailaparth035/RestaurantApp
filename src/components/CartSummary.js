import { useNavigation } from "@react-navigation/native";
import { Button, Divider, Icon, Text } from "@ui-kitten/components";
import React, { useContext, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { useTrackedState } from "../contexts/CartContext";
import { DiscountContext } from "../contexts/DiscountContext";
import {
  formatNumber,
  getDiscountTaxAmountForUi,
  getTaxAmount,
  getTotal,
  getWithDiscountTotal,
} from "../helpers/calc";
import { globalStyles } from "../styles/global";
import CartItem from "./CartItem";
import DiscountDisplay from "./DiscountDisplay";

export default function CartSummary() {
  // const {
  //   setPaymentProcessed,
  // } = useContext(DispatchCartContext);

  const {
    discount,
    isDiscounted,
    discountType,
    setIsDiscounted,
    setDiscountType,
    setPreviousIndex,
    setSelectedDiscount,
  } = useContext(DiscountContext);

  const cartState = useTrackedState();

  const cartItems = cartState?.cartItems;
  const itemCount = cartItems?.itemCount;
  const total = cartItems?.total;

  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const EditOrderIcon = (props) => (
    <Icon {...props} name="shopping-cart-outline" />
  );

  // useEffect(() => {
  //   setPaymentProcessed(false);
  // }, [setPaymentProcessed]);

  useEffect(() => {
    setSelectedDiscount(null);
    setIsDiscounted(null);
    setDiscountType(null);
    setPreviousIndex(null);
    setSelectedDiscount(null);
  }, [setDiscountType, setIsDiscounted, setPreviousIndex, setSelectedDiscount]);

  const handleEditOrder = () => {
    navigation.navigate("EditOrder");
  };

  const handleCheckout = () => {
    navigation.navigate("Checkout");
  };

  return (
    <View style={globalStyles.CartSummary}>
      <View>
        <Button
          onPress={handleEditOrder}
          size="large"
          accessoryLeft={EditOrderIcon}
        >
          Edit Order
        </Button>
      </View>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }}
      >
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </ScrollView>
      <View style={globalStyles.CartTotal}>
        {cartItems.length > 0 && (
          <View>
            <Divider />
            <Text>Total Items: {itemCount}</Text>
            <Divider />
            <Text category="h5">Subtotal: {formatNumber(total)}</Text>
            <Divider />
            {/* TODO FIX FOR DOLLAR AMOUNT INSTEAD */}
            <DiscountDisplay />
            <Divider />
            {isDiscounted ? (
              <Text category="h5">
                Taxes:{" "}
                {getDiscountTaxAmountForUi(discount, total, discountType)}
              </Text>
            ) : (
              <Text category="h5">Taxes: {getTaxAmount(total)}</Text>
            )}
            <Divider />
            <Button size="large" onPress={handleCheckout}>
              {isDiscounted ? (
                <Text>
                  Pay {getWithDiscountTotal(discount, total, discountType)}
                </Text>
              ) : (
                <Text>Pay {getTotal(total)}</Text>
              )}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
