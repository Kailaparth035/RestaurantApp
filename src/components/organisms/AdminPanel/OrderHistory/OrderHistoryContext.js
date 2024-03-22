/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/require-default-props */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
import { Q } from "@nozbe/watermelondb";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import PropTypes from "prop-types";
import React, { createContext, useState } from "react";

export const OrderHistoryContext = createContext();

const OrderHistoryProvider = ({
  orders,
  locations,
  eventIds,
  events,
  users,
  organizationId,
  children,
  ...props
}) => {
  const [ordersList, setOrdersList] = useState(orders);
  const [eventsList, setEventsList] = useState(events);
  const [locationsList, setLocationsList] = useState(locations);
  const [usersList, setUsersList] = useState(users);
  const [focusOrder, setFocusOrder] = useState(false);
  const [order, setOrder] = useState(null);

  return (
    <OrderHistoryContext.Provider
      value={{
        locations,
        events,
        users,
        ordersList,
        setOrdersList,
        focusOrder,
        setFocusOrder,
        order,
        setOrder,
        eventsList,
        locationsList,
        usersList,
      }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
};

OrderHistoryProvider.propTypes = {
  order: PropTypes.oneOfType([
    PropTypes.any,
    PropTypes.shape({
      status: PropTypes.oneOf([
        "void",
        "approved",
        "declined",
        "cancelled",
        "paid",
      ]),
      attendee_id: PropTypes.oneOfType([PropTypes.any, PropTypes.number]),
      items: PropTypes.any,
      transaction_time: PropTypes.string,
      order_id: PropTypes.number,
      location_id: PropTypes.number,
      id: PropTypes.string,
      device_id: PropTypes.number,
      event_id: PropTypes.number,
      user_id: PropTypes.number,
      payment_method: PropTypes.oneOf(["cash", "credit"]),
      tip: PropTypes.number,
      reference_id: PropTypes.oneOfType([PropTypes.any, PropTypes.number]),
      tax: PropTypes.oneOfType([PropTypes.any, PropTypes.number]),
      subtotal: PropTypes.number,
    }),
  ]),
  orders: PropTypes.arrayOf(PropTypes.object),
  focusOrder: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

const enhance = withObservables(
  ["locations", "events", "orders", "users"],
  ({ database, organizationId, eventIds }) => {
  return {
    events: database.collections
      .get("events")
      .query()
      .observe(),

    locations: database.collections
      .get("locations")
      .query()
      .observe(),

    orders: database.collections
      .get("orders")
      .query(
        Q.sortBy("created_at", Q.desc)
      )
      .observe(),

    users: database.collections
      .get("users")
      .query()
      .observe(),
  }}
);

export default withDatabase(enhance(OrderHistoryProvider));
