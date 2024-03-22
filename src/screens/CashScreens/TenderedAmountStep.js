/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable react-native/no-raw-text */
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Heading, Label, Subtitle } from "../../components/atoms/Text";
import CashCalculator from "../../components/CashCheckout/CashCalculator";
import ItemSummaryLine from "../../components/CashCheckout/ItemSummaryLine";
import { Block, Box, Flex } from "../../components/layouts/Index";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import {
  displayCurrencyToCentsInteger,
  displayForLocale,
  formatCentsForUiDisplay,
  getChange,
  getDiscountValue,
  getSubtotalAfterDiscount,
  getTotal,
  getWithDiscountTotal,
} from "../../helpers/calc";
import { NormalisedSizes } from "../../hooks/Normalized";
import { WriteLog } from "../../CommonLogFile";

const createStyles = (theme) =>
  StyleSheet.create({
    change: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: NormalisedSizes(25),
      width: NormalisedSizes(370),
    },
    completeButtonBlock: {
      marginTop: NormalisedSizes(6),
    },
    discountTax: {
      marginVertical: NormalisedSizes(32),
    },
    expressCashButtonBlock: {
      marginBottom: NormalisedSizes(25),
    },
    leftBox: {
      backgroundColor: `${theme["background-basic-color-2"]}`,
      paddingHorizontal: NormalisedSizes(38),
      paddingTop: NormalisedSizes(53),
      width: NormalisedSizes(405),
    },
    orderSummaryLineItem: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      width: NormalisedSizes(370),
    },
    orderSumnaryBox: {
      marginLeft: NormalisedSizes(50),
      width: NormalisedSizes(370),
    },
    orderSumnaryHeadingBlock: {
      marginBottom: NormalisedSizes(40),
    },
    outterFlex: {
      flexDirection: "row",
      height: NormalisedSizes(660),
      width: "100%",
    },
    rightBox: {
      marginTop: NormalisedSizes(32),
      width: "auto",
    },
    seperator: {
      backgroundColor: `${theme["border-basic-color-6"]}`,
      height: 1,
      marginBottom: NormalisedSizes(16),
    },
    tendered: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: NormalisedSizes(16),
      width: NormalisedSizes(370),
    },
    total: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: NormalisedSizes(32),
      width: NormalisedSizes(370),
    },
  });

const formatTotals = (t) => (t ? `$${(t / 100).toFixed(2)}` : "$0.00");
export function TenderedAmountStep({ route }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const {
    tenderedAmount,
    setTotalCharge,
    setTip,
    orderTotals,
    updateOrderTotals,
  } = useContext(TransactionContext);
  // const { selectedDiscount, discount, discountType } = useContext(DiscountContext);

  const cartState = useTrackedState();
  const total = cartState?.total;
  const cartItems = cartState.cartItems;
  setTip(0);

  useEffect(() => {
    updateOrderTotals();
  }, []);

  const [isDisabled, setIsDisabled] = useState(true);
  const navigation = useNavigation();

  const {
    subtotal_after_tokens,
    total_discount,
    total_tax,
    subtotal_with_tax_and_tip,
  } = orderTotals;
  const change = tenderedAmount - subtotal_with_tax_and_tip;

  useEffect(() => {
    setTotalCharge(subtotal_with_tax_and_tip);
  }, [setTotalCharge]);


  useEffect(() => {
    WriteLog("TenderedAmountStep CHANGE" + change);
    // console.log("CHANGE", change);
    if (change >= 0) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [change, tenderedAmount, total]);
  WriteLog(
    "TenderedAmountStep tendered amount" + route + subtotal_with_tax_and_tip
  );
  // console.log("tendered amount", route, subtotal_with_tax_and_tip);
  return (
    <Flex style={styles.outterFlex}>
      <Box style={styles.leftBox}>
        <Block style={styles.orderSumnaryHeadingBlock}>
          <Heading variants="h4">Item Summary</Heading>
        </Block>
        <Box>
          <ScrollView
            style={{ height: Dimensions.get("window").height / 1.7 }}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item, index) => (
              <ItemSummaryLine key={index} item={item} />
            ))}
          </ScrollView>
        </Box>
      </Box>

      <Box style={styles.rightBox}>
        <Flex flexDirection="row" justifyContent="space-between">
          <CashCalculator />
          <Box style={styles.orderSumnaryBox}>
            <Block style={styles.expressCashButtonBlock}>
              <ButtonExtended
                status="tertiary"
                size="large"
                title="cash out"
                onPress={() =>
                  navigation.navigate("TransactionCompletedStepCash")
                }
              >
                <Label variants="label" variantStyle="uppercaseBold">
                  cash out
                </Label>
              </ButtonExtended>
            </Block>
            <Block>
              <Block style={styles.orderSumnaryHeadingBlock}>
                <Heading variants="h4">Order Summary</Heading>
              </Block>
              <Block style={styles.orderSummaryLineItem}>
                <Subtitle variants="s1" variantStyle="semiBold">
                  Subtotal
                </Subtitle>
                <Subtitle variants="s1" variantStyle="semiBold">
                  {displayForLocale(subtotal_after_tokens)}
                </Subtitle>
              </Block>
            </Block>
            <Block style={styles.discountTax}>
              <Block style={styles.orderSummaryLineItem}>
                <Block style={{ marginBottom: 10 }}>
                  <Subtitle variants="s2">Discount</Subtitle>
                </Block>
                <Block>
                  <Subtitle variants="s2">
                    {`${total_discount > 0 ? "-" : ""}${displayForLocale(
                      total_discount
                    )}`}
                  </Subtitle>
                </Block>
              </Block>
              <Block style={styles.orderSummaryLineItem}>
                <Block>
                  <Subtitle variants="s2">Tax</Subtitle>
                </Block>
                <Block>
                  <Subtitle variants="s2">
                    {displayForLocale(total_tax)}
                  </Subtitle>
                </Block>
              </Block>
            </Block>
            <Block style={styles.total}>
              <Block>
                <Subtitle variants="s1" variantStyle="semiBold">
                  Total
                </Subtitle>
              </Block>
              <Block>
                <Subtitle variants="s1" variantStyle="semiBold">
                  {displayForLocale(subtotal_with_tax_and_tip)}
                </Subtitle>
              </Block>
            </Block>
            <Block style={styles.tendered}>
              <Block>
                <Subtitle variants="s2" variantStyle="semiBold">
                  Tendered
                </Subtitle>
              </Block>
              <Block>
                <Subtitle variants="s2" variantStyle="semiBold">
                  {displayForLocale(tenderedAmount)}
                </Subtitle>
              </Block>
            </Block>
            <Block style={styles.seperator} />
            <Block style={styles.change}>
              <Block>
                <Subtitle variants="s1" variantStyle="semiBold">
                  Change
                </Subtitle>
              </Block>
              <Block>
                <Subtitle variants="s1" variantStyle="semiBold">
                  {displayForLocale(change < 0 ? 0 : change)}
                </Subtitle>
              </Block>
            </Block>
            <Block style={styles.completeButtonBlock}>
              <ButtonExtended
                status="primary"
                size="mammoth"
                title="complete"
                disabled={isDisabled}
                onPress={() => navigation.navigate("ApprovedStepCash")}
              >
                <Label variants="label" variantStyle="uppercaseBold">
                  complete
                </Label>
              </ButtonExtended>
            </Block>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}
