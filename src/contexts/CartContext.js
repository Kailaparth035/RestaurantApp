/* eslint-disable no-shadow */
import React, { useReducer } from "react";
import { createContainer } from "react-tracked";
import { cartReducer, sumItems } from "./CartReducer";

// const addItem = (payload) => {
//   dispatch({ type: "ADD_ITEM", payload });
// };

// const removeItem = (payload) => {
//   dispatch({ type: "REMOVE_ITEM", payload });
// };

// const increase = (payload) => {
//   dispatch({ type: "INCREMENT", payload });
// };

// const decrease = (payload) => {
//   dispatch({ type: "DECREMENT", payload });
// };

// const handleCheckout = () => {
//   dispatch({ type: "CHECKOUT" });
// };

// const getCart = () => {
//   dispatch({ type: "GET_CART" });
// };

// const clearCart = () => {
//   dispatch({ type: "DELETE_ORDER", initialCartState });
// };

export const initialCartState = {
  cartItems: [],
  ...sumItems([]),
};

const useValue = () => useReducer(cartReducer, initialCartState);

const {
  Provider,
  useTracked,
  useTrackedState,
  useUpdate: useDispatch,
} = createContainer(useValue);

export function CartProvider({ children, initialCartState = {} }) {
  return (
    <Provider cartReducer={cartReducer} initialCartState={initialCartState}>
      {children}
    </Provider>
  );
}

export { useTracked, useTrackedState, useDispatch };
