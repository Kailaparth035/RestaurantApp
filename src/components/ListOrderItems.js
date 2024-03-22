/* eslint-disable import/no-useless-path-segments */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-boolean-value */

import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { Layout } from "@ui-kitten/components";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import OrderItem from "../components/OrderItem";

function ListOrderItems({ orders, active, setActive }) {
  return (
    <Layout level="1">
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        renderItem={({ item: order }) => (
          <OrderItem order={order} active={active} setActive={setActive} />
        )}
        ItemSeparatorComponent={() => <View style={styles.orderSeparator} />}
        contentContainerStyle={styles.orderListContainer}
        showsVerticalScrollIndicator={true}
        style={styles.orderList}
      />
    </Layout>
  );
}

const enhance = withObservables(["orders"], ({ database }) => ({
  orders: database.collections.get("orders").query().observe(),
}));

export default withDatabase(enhance(ListOrderItems));

const styles = StyleSheet.create({
  orderList: {
    width: "100%",
  },

  orderListContainer: {
    paddingBottom: 120,
    paddingVertical: 20,
    width: "100%",
  },

  orderSeparator: {
    height: 10,
    width: 1,
  },
});
