import { Button, Icon } from "@ui-kitten/components";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { CalculatorContext } from "../../contexts/CalculatorContextProvider";

const BackspaceIcon = (props) => <Icon {...props} name="backspace" />;
const BackButton = () => {
  const { handleBackButton } = useContext(CalculatorContext);
  return (
    <Button
      accessoryLeft={BackspaceIcon}
      onPress={() => handleBackButton()}
      style={styles.button}
    />
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    // borderColor: "#3f4d5b",
    // borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    margin: 10,
  },
});
