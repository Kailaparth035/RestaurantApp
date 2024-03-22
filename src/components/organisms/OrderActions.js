/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-raw-text */
import { useNavigation } from "@react-navigation/native";
import { View, TouchableOpacity } from "react-native";
import { Layout } from "@ui-kitten/components";
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  TransactionContext,
  useTransactionContext,
} from "../../contexts/TransactionContext";
import { getTotal, getWithDiscountTotal } from "../../helpers/calc";
import { NormalisedSizes } from "../../hooks/Normalized";
import { ButtonExtended } from "../atoms/Button/Button";
import { CartIcon } from "../atoms/Icons/Icons";
import { Heading, Label, Subtitle } from "../atoms/Text/index";
import { Block, Flex } from "../layouts/Index";
import { displayForLocale } from "../../helpers/calc";
import { useDispatch as useCustomDispatch } from "../../contexts/CustomItemsProvider";
import { CalculatorContext } from "../../contexts/CalculatorContextProvider";

function OrderActions() {
  const { discount, isDiscounted, discountType, resetSelectedDiscounts } =
    useContext(DiscountContext);
  const {
    paymentTypeState,
    setPaymentTypeState,
    tabletSelections: { location: selectedLocation, menu: selectedMenu },
  } = useAuth();

  const { setReceiptToBeSent, clearTransaction } =
    useContext(TransactionContext);
  const { setNumber, setPrevClicked } = useContext(CalculatorContext);

  const cartState = useTrackedState();
  const total = cartState?.total;
  const surchargeValue = selectedLocation?.digital_surcharge_percentage;

  const navigation = useNavigation();
  const [tipPercentageItems, setTipPercentageItems] = useState([]);

  const displayTotal = () => {
    if (isDiscounted) {
      return getWithDiscountTotal(discount, cartState?.total, discountType);
    }
    return getTotal(total);
  };
  const { orderTotals, updateOrderTotals } = useTransactionContext();
  const { subtotal_with_tax_and_tip } = orderTotals;

  const buttonheight =
    [
      selectedMenu?.is_cash,
      selectedMenu?.is_credit,
      selectedMenu?.is_rfid,
      selectedMenu?.is_qr,
    ].filter(Boolean).length === 4
      ? 85
      : [
          selectedMenu?.is_cash,
          selectedMenu?.is_credit,
          selectedMenu?.is_rfid,
          selectedMenu?.is_qr,
        ].filter(Boolean).length === 3
      ? 111
      : [
          selectedMenu?.is_cash,
          selectedMenu?.is_credit,
          selectedMenu?.is_rfid,
          selectedMenu?.is_qr,
        ].filter(Boolean).length === 2
      ? 180
      : 380;

  useEffect(() => {
    if (cartState.total > 0) {
// console.log("update cart state");
      updateOrderTotals();
    }
  }, [cartState.total, paymentTypeState]);

  useEffect(() => {
    let tips_array = [
      selectedMenu?.tip_percentage_1,
      selectedMenu?.tip_percentage_2,
      selectedMenu?.tip_percentage_3,
    ];
    setTipPercentageItems(tips_array.sort((x, y) => x - y));
  }, []);

  const dispatch = useDispatch();
  const customDispatch = useCustomDispatch();
  const clearCart = () => {
    dispatch({ type: "DELETE_ORDER" });
  };

  const clearCustomItems = () => {
    customDispatch({ type: "DELETE_PRODUCTS" });
  };

  const startNewOrder = () => {
    clearCart();
    clearCustomItems();
    setReceiptToBeSent(false);
    setNumber(0);
    setPrevClicked("");
    clearTransaction();
    resetSelectedDiscounts();

  };

  return (
    <Layout
      level="2"
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingVertical: NormalisedSizes(20),
      }}
    >
      <Block style={{ paddingHorizontal: NormalisedSizes(20) }}>
        <Block>
          {selectedMenu?.is_cash ? (
            <Block style={{ marginBottom: NormalisedSizes(15) }}>
              <ButtonExtended
                size="mammoth"
                onPress={() => {
                  setPaymentTypeState("cash"), updateOrderTotals();
                  navigation.navigate("TenderedAmountStepCash");
                }}
                style={{
                  height: NormalisedSizes(buttonheight),
                }}
              >
                <Label
                  buttonLabel="LabelGiantBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  CASH
                </Label>
              </ButtonExtended>
            </Block>
          ) : (
            <Block />
          )}
          {selectedMenu?.is_credit ? (
            <Block style={{ marginBottom: NormalisedSizes(15) }}>
              <ButtonExtended
                size="mammoth"
                onPress={() => {
                  setPaymentTypeState("credit"), updateOrderTotals();
                  selectedMenu?.is_tips
                    ? navigation.navigate("TipStepCredit", {
                        tip_percentage: tipPercentageItems,
                      })
                    : navigation.navigate("CreditStart");
                }}
                style={{
                  height: NormalisedSizes(buttonheight),
                }}
              >
                <Label
                  buttonLabel="LabelGiantBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  CREDIT
                </Label>
              </ButtonExtended>
            </Block>
          ) : (
            <Block />
          )}
          {selectedMenu?.is_rfid ? (
            <Block>
              <ButtonExtended
                size="mammoth"
                onPress={() => {
                  setPaymentTypeState("rfid"), updateOrderTotals();
                    selectedMenu?.is_tips
                      ? navigation.navigate("TipStepRfid", {
                          tip_percentage: tipPercentageItems,
                        })
                      : navigation.navigate("ReaderReady");
                }}
                style={{
                  height: NormalisedSizes(buttonheight),
                }}
              >
                <Label
                  buttonLabel="LabelGiantBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  RFID
                </Label>
              </ButtonExtended>
            </Block>
          ) : (
            <Block />
          )}
          {selectedMenu?.is_qr ? (
            <Block
              style={{
                marginTop: NormalisedSizes(15),
                marginBottom: NormalisedSizes(10),
              }}
            >
              <ButtonExtended
                size="mammoth"
                onPress={() => {
                  setPaymentTypeState("qr_code"), updateOrderTotals();
                    selectedMenu?.is_tips
                      ? navigation.navigate("TipStepQRCode", {
                          tip_percentage: tipPercentageItems,
                        })
                      : navigation.navigate("QRCodeReaderReady");
                }}
                style={{
                  height: NormalisedSizes(buttonheight),
                }}
              >
                <Label
                  buttonLabel="LabelGiantBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  QR Code
                </Label>
              </ButtonExtended>
            </Block>
          ) : (
            <Block />
          )}
        </Block>

        <TouchableOpacity
          style={{
            width: NormalisedSizes(199),
            height: NormalisedSizes(72),
            marginVertical: NormalisedSizes(10),
            borderWidth: 1,
            borderRadius: 5,
            padding: NormalisedSizes(7),
            flexDirection: "row",
            justifyContent: "space-between",
          }}
          onPress={() => navigation.navigate("EditOrder")}
        >
          <View
            style={{
              justifyContent: "space-between",
            }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                flex: 1,
              }}
            >
              <Heading variants="h5">Subtotal</Heading>
            </View>
          </View>
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Heading variants="h6">{displayForLocale(total)}</Heading>
            <View
              style={{
                alignItems: "flex-end",
              }}
            >
              <Subtitle variants="s3">{cartState?.itemCount} items</Subtitle>
            </View>
          </View>
        </TouchableOpacity>
        <Block>
          <ButtonExtended
            status="tertiary"
            size="large"
            accessoryLeft={CartIcon}
            onPress={() => {
              startNewOrder();
            }}
            style={{
              width: NormalisedSizes(199),
              height: NormalisedSizes(72),
            }}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="uppercaseBold"
            >
              Clear Cart
            </Label>
          </ButtonExtended>
        </Block>
      </Block>
    </Layout>
  );
}

export default OrderActions;
