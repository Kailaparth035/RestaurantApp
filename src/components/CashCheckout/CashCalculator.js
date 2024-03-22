/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import debounce from "lodash/debounce";
import { CalculatorContext } from "../../contexts/CalculatorContextProvider";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import { getTotal, getWithDiscountTotal } from "../../helpers/calc";
import { NormalisedSizes } from "../../hooks/Normalized";
import { ButtonExtended } from "../atoms/Button/Button";
import { Label } from "../atoms/Text";
import { Block, Box, Flex } from "../layouts/Index";
import { Keypad } from "../organisms/NumericKeypad/NumericKeypad";
import { WriteLog } from "../../../src/CommonLogFile";

function CashCalculator() {
  const theme = useTheme();
  const styles = StyleSheet.create({
    calcWrapper: {
      marginLeft: NormalisedSizes(63),
    },
    keypad: {
      alignItems: "flex-start",
    },
    numpad: {
      display: "flex",
      justifyContent: "center",

      width: "75%",
    },
    quickButtons: {
      justifyContent: "space-between",
    },
    tendiesButton: {
      height: "100%",
    },
    tipBlock: {
      alignItems: "center",
      borderColor: `${theme["background-basic-color-6"]}`,
      borderRadius: 4,
      borderWidth: 1,
      width: "100%",
    },
  });

  const { number, setPrevClicked, prevClicked } = useContext(CalculatorContext);

  const cartState = useTrackedState();
  const { total } = cartState;

  const { tenderedAmount, setTenderedAmount, orderTotals } =
    useContext(TransactionContext);

  useEffect(() => {
    setTenderedAmount(0);
  }, []);

  const handleTendies = ({ value }) => {
    setPrevClicked("tendies");
    setTenderedAmount(value);
  };

  const handleNumPad = (amount) => {
    WriteLog("handle num pad");
    console.log("handle num pad");
    if (amount.includes(".")) {
      setTenderedAmount(Number(amount) * 100);
    } else {
      setTenderedAmount(Number(amount));
    }
  };
  const arrayButtonTendies = [
    { name: "$1", value: 100 },
    { name: "$5", value: 500 },
    { name: "$10", value: 1000 },
    { name: "$20", value: 2000 },
  ];

  const buttonGroupTendis = ({ item, index }) => (
    <Block
      key={index}
      style={{ marginLeft: index >= 1 ? NormalisedSizes(10) : 0 }}
      height={NormalisedSizes(80)}
    >
      <ButtonExtended
        status="primary"
        size="large"
        variants="keypad"
        onPress={() => handleTendies(item)}
      >
        <Label buttonLabel="none" variants="label" variantStyle="uppercaseBold">
          {item.name}
        </Label>
      </ButtonExtended>
    </Block>
  );

  return (
    <Box style={styles.calcWrapper}>
      <Box>
        <Flex flexDirection="column">
          <Block style={styles.keypad}>
            <Keypad
              variants="default"
              justifyContent="flex-start"
              // onPressKey={handleNumPad}
              onAmountUpdated={handleNumPad}
            />
          </Block>

          <Block style={(styles.keypad, { marginTop: NormalisedSizes(96) })}>
            <Flex flexDirection="row">
              <FlatList
                data={arrayButtonTendies}
                renderItem={buttonGroupTendis}
                keyExtractor={(item, index) => index}
                numColumns={arrayButtonTendies.length}
              />
            </Flex>
          </Block>
        </Flex>
      </Box>
    </Box>
  );
}

export default CashCalculator;
