/* eslint-disable no-case-declarations */
/* eslint-disable no-shadow */
import React, { useReducer } from "react";
import { createContainer } from "react-tracked";
import { WriteLog } from "../../src/CommonLogFile";
// import { cartReducer, sumItems } from "./CartReducer";

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_PRODUCT":
      WriteLog("CustomeItemProvider DISPATCHED", {
        action: action,
        state: state,
      });
      console.log("DISPATCHED", action, state);
      state.customItems.push({
        id: randomIntFromInterval(99999, 999999),
        unique_id: `#${randomIntFromInterval(99999, 999999)}`,
        name: action.payload.productName,
        short_name: action.payload.productName,
        description: action.payload.description,
        price: action.payload.price,
        tags: action.payload.tags,
        categoryId: action.payload.categoryId,
        receiptName: action.payload.receiptName,
        productType: action.payload.productType,
        tax: action.payload.tax,
        tax_percentage: action.payload.tax_percentage,
        is_variable_price: action.payload.is_variable_price,        
      });
      return {
        ...state,
        customItems: [...state.customItems],
      };
    case "DELETE_PRODUCTS":
      return {
        customItems: [],
      };
    default:
      return state;
  }
};

export const initialState = {
  customItems: [],
};

const useValue = () => useReducer(reducer, initialState);

const {
  Provider,
  useTracked,
  useTrackedState,
  useUpdate: useDispatch,
} = createContainer(useValue);

export function CustomItemsProvider({ children, initialState = {} }) {
  return (
    <Provider reducer={reducer} initialState={initialState}>
      {children}
    </Provider>
  );
}

export { useTracked, useTrackedState, useDispatch };
