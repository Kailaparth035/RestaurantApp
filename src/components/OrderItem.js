/* eslint-disable no-unused-vars */
/* eslint-disable no-warning-comments */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */

import withObservables from "@nozbe/with-observables";
import { Layout, Text } from "@ui-kitten/components";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { getTotal } from "../helpers/calc";

function OrderItem({ order, setActive, active }) {
  // TODO: Nice to have order listed with newest at the top

  const handleDelete = useCallback(async () => {
    await order.delete();
  }, [order]);

  const handleOrderItemSelection = useCallback(async () => {
    // console.log("handleOrderItemSelection fired", order.id);
    await setActive(order.id);
    // console.log("active set to +", active);
  }, [active, order.id, setActive]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleOrderItemSelection}
    >
      <Layout style={styles.content}>
        <Text numberOfLines={1} category="h6">
          Order#:{order.order_id}
        </Text>

        <Text numberOfLines={2} category="s1">
          {getTotal(order.subtotal)}
        </Text>

        <Text category="s1">{order.transaction_time.toString()}</Text>
      </Layout>

      {/* REMOVE FOR QA */}
      {/* <TouchableOpacity onPress={handleDelete}>
        <View><Text>Delete Test</Text></View>
      </TouchableOpacity> */}
    </TouchableOpacity>
  );
}

const enhance = withObservables(["order"], ({ order }) => ({
  order,
}));

export default enhance(OrderItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 20,
  },
});
