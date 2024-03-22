import { useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Subtitle } from "../atoms/Text";

const styles = StyleSheet.create({
  inputDisplay: {
    paddingVertical: 12,
  },
});

const InputDisplay = (prop) => {
  const theme = useTheme();
  // TODO: onQuickTip button click, change state from $ to %
  // TODO: render percentage in dollar amount
  // TODO: change Amount Due upon input
  const { messageValue, numberValue } = prop;
  return (
    <View style={styles.inputDisplay}>
      <Subtitle variants="s1" style={{ color: `${theme["color-basic-600"]}` }}>
        {/* Conditional render with ternary operator. tipCalc/Step 3? render tip  */}
        {messageValue} $ {!numberValue ? "0.00" : numberValue}
      </Subtitle>
    </View>
  );
};

export default InputDisplay;
