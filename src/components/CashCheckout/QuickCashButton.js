// import { TouchableOpacity, Text } from "react-native"
import { Button, Text } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { CalculatorContext } from "../../contexts/CalculatorContextProvider";

const QuickCashButton = ({ buttonValue }) => {
  const { handleQuickCashButton } = useContext(CalculatorContext);
  return (
    <Button onPress={handleQuickCashButton(buttonValue)}>
      <Text>${buttonValue}</Text>
    </Button>
  );
};

QuickCashButton.propTypes = {
  buttonValue: PropTypes.string.isRequired,
};

export default QuickCashButton;
