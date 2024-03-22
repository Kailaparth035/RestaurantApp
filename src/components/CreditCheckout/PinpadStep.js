/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from "react";
import { View } from "react-native";
import CalculatorContextProvider from "../../contexts/CalculatorContextProvider";
import TipCalculator from "../TipCalculator";

function PinpadStep({ navigation }) {
  // TODO: security of checking pin
  // TODO: Pinpad context for virtual keyboard
  // TODO: jump this step if card !insert
  // Repurpose Tip Calc for pinpad
  return (
    <View>
      <CalculatorContextProvider>
        <TipCalculator />
      </CalculatorContextProvider>
    </View>
  );
}

export default PinpadStep;
