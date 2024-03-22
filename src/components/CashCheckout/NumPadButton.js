import { Button, Text } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { CalculatorContext } from "../../contexts/CalculatorContextProvider";

const styles = StyleSheet.create({
  button: {
    marginVertical: 5,
  },
});

const NumPadButton = ({ buttonValue }) => {
  const { handleNumButton } = useContext(CalculatorContext);
  return (
    <Button
      status="primary"
      size="large"
      onPress={() => handleNumButton(buttonValue)}
      style={styles.button}
    >
      <Text>${buttonValue}</Text>
    </Button>
  );
};

NumPadButton.propTypes = {
  buttonValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
};

export default NumPadButton;
