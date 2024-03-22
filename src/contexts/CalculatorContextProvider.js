/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable react/prop-types */

import React, { useContext, useState } from "react";
import {
  formatForCashCalculator,
  getSubtotalAfterDiscount,
} from "../helpers/calc";
import { useTrackedState } from "./CartContext";
import { DiscountContext } from "./DiscountContext";

export const CalculatorContext = React.createContext();

const CalculatorContextProvider = ({ children }) => {
  const { discountType, discount, isDiscounted } = useContext(DiscountContext);

  const cartState = useTrackedState();
  const { total } = cartState;

  const [number, setNumber] = useState("0.00");
  const [prevClicked, setPrevClicked] = useState("");

  // TODO: handle quick cash button adding if prev click was a convenience button

  // TODO: fix bug when using the dot numButton after a conveninence button

  const handleDisplayValue = (num) => {
    // TODO: store prevClicked button as state. if prev button clicked was convenience button then handleClearValue
    if (!number.includes(".") || num !== ".") {
      if (prevClicked === "convenience") {
        handleClearValue(num);
      } else {
        setNumber(`${(number + num).replace(/^0+/, "")}`);
      }
    }
  };

  // TODO: fix quickcash button to add
  const handleNumButton = (num) => {
    // NUM will always be integer
    // console.log("NUM BUTTON", num);
    // handleDisplayValue(num);
    setPrevClicked("numButton");
    if (prevClicked === "numButton") {
      // const oldNum = console.log({ num });
      // console.log({ number });
      // console.log({ oldNum });
      setNumber((parseFloat(number) + parseFloat(num.toFixed(2))).toFixed(2));
    } else {
      setNumber(num.toFixed(2));
    }
  };

  const handleBackButton = () => {
    if (number !== "") {
      const deletedNumber = number.slice(0, number.length - 1);
      setNumber(deletedNumber);
    }
  };

  const handleQuickCashButton = (buttonValue) => {
    // TODO: if prevClicked was a convenience button than add buttonValue.

    setPrevClicked("convenience");
    setNumber(buttonValue);
  };

  const handleClearValue = (num) => {
    setNumber(`${num}`);
  };

  const handleQuickTipButton = (buttonValue) => {
    // convert tip percent into dollar value. stringified for input display

    if (isDiscounted) {
      const discountedTotal = getSubtotalAfterDiscount(
        discount,
        total,
        discountType
      );
      // console.log("quick tip discount total", discountedTotal);
      const tipInDollars = (
        (parseInt(buttonValue) / 100) *
        formatForCashCalculator(discountedTotal)
      )
        .toFixed(2)
        .toString();
      setNumber(tipInDollars);
    } else {
      const tipInDollars = (
        (parseInt(buttonValue) / 100) *
        formatForCashCalculator(total)
      )
        .toFixed(2)
        .toString();
      setNumber(tipInDollars);
    }
    setPrevClicked("convenience");
  };

  return (
    <CalculatorContext.Provider
      value={{
        number,
        setNumber,
        handleDisplayValue,
        handleQuickCashButton,
        handleBackButton,
        handleQuickTipButton,
        handleNumButton,
        setPrevClicked,
        prevClicked,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

// CalculatorContextProvider.propTypes = {
//   children: PropTypes.node,
// }

export default CalculatorContextProvider;
