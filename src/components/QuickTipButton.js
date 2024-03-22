import { Button } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { CalculatorContext } from "../contexts/CalculatorContextProvider";
import { Block } from "./layouts/block";
import { displayForLocale } from "../../src/helpers/calc";

const styles = StyleSheet.create({
  button: {
    //backgroundColor: 'white',
    // borderColor: 'red',
    display: 'flex',
    height: 70,
    marginTop: -10,
    width: 150,
    marginLeft: 10
  },
});
// const formatTotals = t => t ? `$${(t / 100).toFixed(2)}` : '$0.00'
function QuickTipButton({ eventId, buttonImage, buttonValue, subtotal_after_discount, onPress = () => { }, selected }) {
  // const { handleQuickTipButton } = useContext(CalculatorContext);
  return (
    <Block style={styles.button}>
      <Button
        status={selected ? 'selected' : "secondary"}
        size="medium"
        appearance="outline"
        onPress={() => {
          // handleQuickTipButton(buttonValue)
          onPress()
        }}
        style={{ height: 70 }}>
        <View
          style={{ textAlign: 'center', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', borderColor: 'gray', borderWidth: 2, marginLeft: 16 }}>
            <View>
              <Text style={{ textAlign: 'center', fontSize: 25, }}>{buttonValue * 100}%</Text>
              <Text style={{ borderColor: 'red', marginTop: 0, fontSize: 15, textAlign: 'center' }}>{displayForLocale(subtotal_after_discount * buttonValue)}</Text>
            </View>
        </View>
      </Button>
    </Block>
  );
}

QuickTipButton.propTypes = {
    buttonValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
};

export default QuickTipButton;
