/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React from "react";
import { useDispatch, useTrackedState } from "../../contexts/CartContext";
import { NormalisedSizes } from "../../hooks/Normalized";
import { ButtonExtended } from "../atoms/Button/Button";
import { Heading, Label } from "../atoms/Text";
import CartItem from "../CartItem";
import { Block, Box, Flex } from "../layouts/Index";

export const OrderDetails = () => {
  const cartState = useTrackedState();
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const clearCart = () => {
    dispatch({ type: "DELETE_ORDER" });
    return navigation.navigate("Menu");
  };
  const theme = useTheme();

  return (
    <Box style={{ marginVertical: NormalisedSizes(32) }}>
      <Flex
        flexDirection="row"
        alignContent="center"
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: NormalisedSizes(32) }}
      >
        <Block>
          <Heading
            variants="h4"
            style={{
              color: theme["color-basic-700"],
            }}
          >
            Order Details
          </Heading>
        </Block>
        <Block>
          <ButtonExtended
            size="large"
            onPress={() => {
              clearCart();
            }}
            style={{
              width: NormalisedSizes(199),
              height: NormalisedSizes(72),
            }}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="uppercaseBold"
            >
              CLEAR CART
            </Label>
          </ButtonExtended>
        </Block>
      </Flex>
      {cartState.cartItems.map((item, index) => (
        <CartItem key={item.id} item={item} />
      ))}
    </Box>
  );
};
