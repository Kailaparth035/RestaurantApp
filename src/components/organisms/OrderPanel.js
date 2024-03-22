/* eslint-disable react-native/no-raw-text */
import { Layout } from "@ui-kitten/components";
import React from "react";
import { useTrackedState } from "../../contexts/CartContext";
import { globalStyles } from "../../styles/global";
import { Heading } from "../atoms/Text";
import { Box } from "../layouts/Index";
import OrderActions from "./OrderActions";

const OrderPanel = () => {
  const cartState = useTrackedState();

  return (
    <Layout style={globalStyles.Cart} level="2">
      {cartState.itemCount > 0 ? (
        <OrderActions />
      ) : (
        <Box level="2" style={globalStyles.CartEmpty}>
          <Heading variants="h5">
            Your cart is empty. Please select a menu item to start an order
          </Heading>
        </Box>
      )}
    </Layout>
  );
};

export default OrderPanel;
