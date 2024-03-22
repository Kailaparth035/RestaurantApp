import { useTheme, Button } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";
import { FlatList, View } from "react-native";
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce';
import { NormalisedSizes } from "../../../hooks/Normalized";
import { ButtonExtended } from "../../atoms/Button/Button";
import { Label } from "../../atoms/Text/index";
import StyledKeypad from "./NumericKeypad.styles";

const defaultArrayInputs = {
  default: [
    { name: "1", value: 1 },
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: ".", value: "dot" },
    { name: "0", value: 0 },
    
    { name: "↩", value: "del" },
  ],
  phoneType: [
    { name: "1", value: 1 },
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "", value: "" },
    { name: "0", value: 0 },
    { name: "↩", value: "del" },
  ],
  tipInput: [
    { name: "1", value: 1 },
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "↩", value: "del" },
    { name: "0", value: 0 },
    { name: "OK", value: "done" },
  ],
};
export function Keypad({
  variants,
  variantStyle,
  justifyContent,
  onPressKey,
  formikProps,
  width,
  buttonWidth,
  onAmountUpdated = () => {},
  ...props
}) {
  
  const theme = useTheme();
  const [enteredAmount, setEnteredAmount] = React.useState("");

  const onKeyPress = ({value, name}) => {
    if (onPressKey) {
      onPressKey({value, name});
    } else {
      switch (value) {
        case "del":
          setEnteredAmount(prevAmount => prevAmount.slice(0,-1));
          break;
        case "dot":
          setEnteredAmount(prevAmount => {
            if (!prevAmount.includes(".")) {
              return prevAmount + ".";
            } else {
              return prevAmount
            }
          });
          break;
        case "":
          break;
        default:
          setEnteredAmount(prevAmount => prevAmount + value.toString())
          break;
      }
    }
  }

  const updateAmount = throttle(onAmountUpdated, 500)

  React.useEffect(() => {
    if (onAmountUpdated) {
      updateAmount(enteredAmount)
    }
  }, [enteredAmount])

  function SingleKey({ item, index }) {
    if (item.value < 0) {
      return <View/>
    }
    if (item.value === 'done') {
      return (
      <Button
        title="OK"
        status="primary"
        size="mammoth"
        onPress={() =>
          onKeyPress(item)
        }
        style={{
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          width: NormalisedSizes(buttonWidth ? buttonWidth : 100),
            marginLeft: index % 3 !== 0 ? NormalisedSizes(11) : 0,
            marginTop: index >= 3 ? NormalisedSizes(11) : 0,
        }}
      >
        OK
      </Button>
      )
    }

    return <ButtonExtended
        key={item.value}
        status="keypad"
        size="mammoth"
        variants="keypad"      
        appearance="outline"
        style={{
          color: theme["color-basic-500"],
          width: NormalisedSizes(buttonWidth ? buttonWidth : 100),
          marginLeft: index % 3 !== 0 ? NormalisedSizes(11) : 0,
          marginTop: index >= 3 ? NormalisedSizes(11) : 0,
        }}
        onPress={() =>
          onKeyPress(item)
        }
      >
        <Label
          buttonLabel="LabelGiantBtn"
          variants="label"
          variantStyle="uppercaseBold"
          style={{
            color: "white"
          }}
        >
          {item.name}
        </Label>
      </ButtonExtended>
  }

  return (
    <StyledKeypad
      variants={variants ? variants : "default"}
      variantStyle={variantStyle ? variantStyle : "default"}
      onPressKey={onKeyPress}
      formikProps={null}
      width={width ? width : 343}
      {...props}
    >
      <FlatList
        data={defaultArrayInputs[variants]}
        numColumns={3}
        renderItem={SingleKey}
        keyExtractor={(item, index) => index}
      />
    </StyledKeypad>
  );
}

Keypad.propTypes = {
  variants: PropTypes.oneOf(["phoneType", "default"]),
  variantStyle: PropTypes.oneOf(["default"]),
  justifyContent: PropTypes.string,
};
