/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
import { useNavigation } from "@react-navigation/native";
import { Button, useTheme, Input } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Keypad } from "./organisms/NumericKeypad/NumericKeypad";
import { CalculatorContext } from "../contexts/CalculatorContextProvider";
import { useTrackedState } from "../contexts/CartContext";
import { DiscountContext } from "../contexts/DiscountContext";
import { useTransactionContext } from "../contexts/TransactionContext";
import { useAuth } from "../contexts/AuthContext";
import RoninChipModule from "../services/RoninChipService";
import { Heading, Subtitle } from "./atoms/Text";
import InputDisplay from "./CashCheckout/InputDisplay";

import QuickTipButton from "./QuickTipButton";
import { Block } from "./layouts/block";
import TipInputModal from "./TipInputModal";
import { displayForLocale } from "../../src/helpers/calc";
import Images from "../Images";

function TipCalculator({ next, tipPercentage }) {
  const theme = useTheme();

  useEffect(() => {
    RoninChipModule.wakeUpCardReader();
  }, []);

  const styles = StyleSheet.create({
    bigView: {
      display: "flex",
      alignItems: "stretch",
      // borderColor: "cyan",
      // borderWidth: 5,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 25,
      paddingHorizontal: 25,
      paddingBottom: 20,
    },
    buttonCol: {
      display: "flex",
      flexDirection: "row",
      // marginRight: 10,
      marginTop: 30,
      // width: 75,
    },
    buttonOk: {
      flexDirection: "column",
      flex: 1,
      justifyContent: "flex-end",
    },
    buttons: {
      flexDirection: "row",
    },
    discountTax: {
      marginVertical: 21,
    },
    marginBottom: {
      marginBottom: 10,
    },
    pannel1: {
      flex: 1,
    },
    pannel1_1: {
      flex: 2,
    },
    pannel1_2: {
      flexDirection: "column",
      flex: 1,
      justifyContent: "flex-end",
    },
    pannel2: {
      alignItems: "center",
      display: "flex",
      flex: 1,
      flexDirection: "column",
      marginHorizontal: 15,
    },
    pannel3: {
      flex: 1,
    },
    textAlignCenter: {
      alignContent: "center",
    },
    textAlignLeft: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      width: 240,
    },
    tipBox: {
      borderColor: `${theme["background-basic-color-6"]}`,
      borderRadius: 4,
      borderWidth: 1,
      marginVertical: 21,
      width: "100%",
    },
    total: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 21,
      width: 240,
    },
  });
  const [tipPercentageItems, setTipPercentageItems] = useState(tipPercentage||[]);
  const { setTip, updateOrderTotals, orderTotals } = useTransactionContext();
  const {
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
  } = useAuth();

  const surchargeLabel = selectedEvent?.digital_surcharge_label;
  const surchargeValue = selectedLocation?.digital_surcharge_percentage;

  const cartState = useTrackedState();

  const tipVariable = 0;
  const totalDisplayed = "0";
  const [totalDisplayedWithTip, setTotalDisplayedWithTip] = useState("0");
  const [showCustomTip, setShowCustomTip] = React.useState(false);
  const [customTip, setCustomTip] = React.useState('0.00');
  const [tipPercentage1, setTipPercentage1] = useState(tipPercentageItems[0]||'');
  const [tipPercentage2, setTipPercentage2] = useState(tipPercentageItems[1]||'');
  const [tipPercentage3, setTipPercentage3] = useState(tipPercentageItems[2]||'');

  useEffect(() => {

    let tips_array = [
      selectedMenu?.tip_percentage_1,
      selectedMenu?.tip_percentage_2,
      selectedMenu?.tip_percentage_3,
    ];
    setTipPercentageItems(tips_array.sort((x, y) => x - y));

    setTip(0);
  }, []);

  const {
    subtotal_after_tokens,
    total_discount,
    subtotal_after_discount,
    total_tax,
    subtotal_with_tax_and_tip,
    surchargeAmount,
    final_total,
    total,
    tokens_redeemed,
    updated_tokens_balance,
    cash_balance,
    promo_balance,
    cashBalanceCharged,
    promoBalanceCharged,
    tip,
  } = orderTotals;

  const formatTotals = (t) => (t ? `$${(t / 100).toFixed(2)}` : "$0.00");
  const [buttonSelected, setButtonSelected] = useState(null);

  return (
    <View style={styles.bigView}>
      <View style={styles.pannel2}>
        <Heading variants="h1">Add a Tip</Heading>
        <Heading
          variants="h3"
          variantStyle="bold"
          style={{ margin: 20, alignContent: "center" }}
        >
          {"Subtotal: " + displayForLocale(subtotal_after_tokens)}
        </Heading>

        <View style={[styles.buttonCol, { marginTop: 20 }]}>
          <QuickTipButton
            eventId={selectedEvent?.eventId}
            buttonImage={Images.tortoise_15}
            buttonValue={tipPercentage1 / 100}
            subtotal_after_discount={subtotal_after_tokens}
            selected={buttonSelected === tipPercentage1}
            onPress={() => {
              setTip(
                Math.round(subtotal_after_tokens * (tipPercentage1 / 100))
              );
              setButtonSelected(tipPercentage1);
              setCustomTip(undefined);
              setTimeout(() => {
                next();
              }, 500);
            }}
          />
          <QuickTipButton
            eventId={selectedEvent?.eventId}
            buttonImage={Images.fish_18}
            buttonValue={tipPercentage2 / 100}
            subtotal_after_discount={subtotal_after_tokens}
            selected={buttonSelected === tipPercentage2}
            onPress={() => {
              setTip(
                Math.round(subtotal_after_tokens * (tipPercentage2 / 100))
              );
              setButtonSelected(tipPercentage2);
              setCustomTip(undefined);
              setTimeout(() => {
                next();
              }, 500);
            }}
          />
          <QuickTipButton
            eventId={selectedEvent?.eventId}
            buttonImage={Images.octopus_20}
            buttonValue={tipPercentage3 / 100}
            subtotal_after_discount={subtotal_after_tokens}
            selected={buttonSelected === tipPercentage3}
            onPress={() => {
              setTip(
                Math.round(subtotal_after_tokens * (tipPercentage3 / 100))
              );
              setButtonSelected(tipPercentage3);
              setCustomTip(undefined);
              setTimeout(() => {
                next();
              }, 500);
            }}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <Block style={{ width: 230, marginLeft: 10, marginTop: 10 }}>
            <Button
              size="large"
              appearance="outline"
              status={buttonSelected === "customtip" ? "selected" : "secondary"}
              onPress={() => {
                setShowCustomTip(true);
              }}
            >
              <View
                style={{
                  textAlign: "center",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  borderColor: "gray",
                  borderWidth: 2,
                  marginLeft: 16,
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 20 }}>
                  {customTip > 0
                    ? displayForLocale(customTip)
                    : "Custom Tip Amount"}
                </Text>
              </View>
            </Button>
            {showCustomTip && (
              <TipInputModal
                showCustomTip={showCustomTip}
                customTip={customTip}
                subtotal_after_tokens={subtotal_after_tokens}
                closeModal={() => setShowCustomTip(false)}
                setCustomTip={(c) => {                 
                  setShowCustomTip(false);
                  setCustomTip(c * 100);
                  setTip(c * 100);
                  if (c > 0 ) {setButtonSelected("customtip");
                  setTimeout(() => {
                    next();
                  }, 500); }
                }}
              />
            )}
          </Block>
          <Block style={{ width: 230, marginLeft: 10, marginTop: 10 }}>
            <Button
              status={buttonSelected === "cleartip" ? "selected" : "secondary"}
              size="large"
              appearance="outline"
              onPress={() => {
                setCustomTip('0.00');
                setTip(0);
                setButtonSelected("cleartip");
                setTimeout(() => {
                  next();
                }, 500);
              }}
            >
              <View
                style={{
                  textAlign: "center",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  borderColor: "gray",
                  borderWidth: 2,
                  marginLeft: 16,
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 20 }}>
                  No Tip
                </Text>
              </View>
            </Button>
          </Block>
        </View>
      </View>
    </View>
  );
}

export default TipCalculator;
