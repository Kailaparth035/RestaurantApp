/* eslint-disable react-native/no-raw-text */
/* eslint-disable react/prop-types */
import { useNavigation } from "@react-navigation/native";
import { Button, useTheme, Divider } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { CalculatorContext } from "../../../contexts/CalculatorContextProvider";
import { useDispatch, useTrackedState } from "../../../contexts/CartContext";
import { useDispatch as useCustomDispatch } from "../../../contexts/CustomItemsProvider";
import { DiscountContext } from "../../../contexts/DiscountContext";
import { TransactionContext } from "../../../contexts/TransactionContext";
import { useAuth } from "../../../contexts/AuthContext";
import { CheckmarkCircleIcon } from "../../atoms/Icons/Icons";
import { Heading, Paragraph } from "../../atoms/Text";
import { displayForLocale, getDiscountTotal } from "../../../helpers/calc";
import { WriteLog } from "../../../../src/CommonLogFile";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    paddingTop: 10,
    padding: 50,
  },
  marginVertical: {
    marginVertical: 0,

    textAlign: "center",
    width: "100%",
  },
});
const formatTokensBalanceDisplay = (tokens_balance) => {
  if (Object.keys(tokens_balance).length > 0) {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Heading variants="h4" style={{ marginTop: 10 }}>
          Tokens Remaining:
        </Heading>
        <View>
          {Object.keys(tokens_balance).map((t) => {
            const token = tokens_balance[t];
            return (
              <Heading variants="h4">{` ${token?.redeemable_token_name || t
                } - ${token.balance}`}</Heading>
            );
          })}
        </View>
      </View>
    );
  }
  return null;
};

function ReceiptSent({
  headerString,
  buttonString,
  smsReceiptButton,
  reference_id,
  // total,
  // tokens_balance,
  route,

  // tax,
  // subtotal,
  // tip,
  // discount,
  cash_balance,
  promo_balance,
  surchargeAmount: surchargeAmountResponse,
  total_paid: total_paid_response,
  cashBalanceCharged,
  promoBalanceCharged,
  payment_method,
  ...receiptProps
}) {
  const navigation = useNavigation();
  const theme = useTheme();
  const {
    tabletSelections: { menu: selectedMenu },
  } = useAuth();

  const { setReceiptToBeSent, clearTransaction, orderTotals } =
    useContext(TransactionContext);

  const { resetSelectedDiscounts } = useContext(DiscountContext);

  const { setNumber, setPrevClicked } = useContext(CalculatorContext);

  const dispatch = useDispatch();
  const customDispatch = useCustomDispatch();

  const clearCart = () => {
    dispatch({ type: "DELETE_ORDER" });
  };

  const clearCustomItems = () => {
    customDispatch({ type: "DELETE_PRODUCTS" });
  };

  function startNewOrder() {
    clearCart();
    clearCustomItems();
    setReceiptToBeSent(false);
    setNumber(0);
    setPrevClicked("");
    clearTransaction();
    resetSelectedDiscounts();
    navigation.navigate("Menu");
  }

  const handleReceipt = () => {
    navigation.navigate("EnterPhoneNumberStepCredit", { reference_id });
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     startNewOrder()
  //   }, 30000);
  //   return () => clearTimeout(timer);
  // }, []);
  const cartState = useTrackedState();

  const {
    subtotal_after_tokens,
    total_discount,
    subtotal_after_discount,
    total_tax,
    subtotal_with_tax_and_tip,
    surchargeAmount,
    final_total,
    tip,
    total_paid,
    tokens_redeemed,
    tokens_redeemed_price,
    updated_tokens_balance,
    updated_items,
    applied_discounts,
  } = orderTotals;
  WriteLog("ReceiptSent updated_tokens_balance" + updated_tokens_balance);
  console.log(updated_tokens_balance);

  //const subtotal = subtotal_after_tokens;
  const discountTotal = getDiscountTotal({
    discounts: applied_discounts,
    subtotal: subtotal_after_tokens,
  });
  let surcharge_amount = surchargeAmount;
  let totalPaid = total_paid;

  if (payment_method === "rfid" || payment_method === "qr_code") {
    totalPaid = total_paid_response;
    surcharge_amount = surchargeAmountResponse;
  }
  if (payment_method === "rfid" || payment_method === "qr_code") {
    return (
      <View style={styles.container}>
        <CheckmarkCircleIcon
          width={50}
          height={50}
          fill={`${theme["color-success-500"]}`}
        />
        <Heading variants="h2" style={styles.marginVertical}>
          {headerString}
        </Heading>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            width: 800,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "center",
              flex: 1,
              width: 300,
            }}
          ></View>
          <ScrollView>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "center",
                flex: 1,
                width: 300,
              }}
            >
              <TotalRow text="Subtotal:" amount={cartState?.total} />
              {selectedMenu.tax_type === "exclusive" ? (
                <TotalRow text="Tax:" amount={total_tax} />
              ) : null}
              {selectedMenu.is_tips === true ? (
                <TotalRow text="Tip:" amount={tip} />
              ) : null}
              {payment_method !== "cash" ? (
                <TotalRow text="Service Fee:" amount={surcharge_amount} />
              ) : null}
              <Divider />
              {tokens_redeemed_price > 0 ? (
                <TotalRow
                  text="Token Redemption Value:"
                  amount={tokens_redeemed_price}
                />
              ) : null}
              <TotalRow text="Discount:" amount={-1 * discountTotal} />

              <Divider />
              <TotalRow text="Order Total:" amount={totalPaid} />
            </View>
          </ScrollView>
          <ScrollView>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "center",
                flex: 1,
                width: 300,
              }}
            >
              <TotalRow
                text="Credit Charged:"
                amount={totalPaid - cashBalanceCharged - promoBalanceCharged}
              />
              <TotalRow
                text="Promo Balance Charged:"
                amount={promoBalanceCharged}
              />
              <TotalRow
                text="Promo Balance Remaining:"
                amount={promo_balance}
              />
              <TotalRow
                text="Cash Balance Charged:"
                amount={cashBalanceCharged}
              />
              <TotalRow text="Cash Balance Remaining:" amount={cash_balance} />
              <View variants="h3" style={{ marginTop: 10 }}>
                {formatTokensBalanceDisplay(updated_tokens_balance)}
              </View>
            </View>
          </ScrollView>
        </View>
        <View>
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* <Button
              onPress={() => handleReceipt()}
              status="tertiary"
              style={{ marginRight: 5, width: 150 }}
            >
              {smsReceiptButton}
            </Button> */}
            <Button
              onPress={startNewOrder}
              status="primary"
              style={{ marginLeft: 5, width: 150 }}
            >
              {buttonString}
            </Button>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <CheckmarkCircleIcon
          width={50}
          height={50}
          fill={`${theme["color-success-500"]}`}
        />
        <Heading variants="h2" style={styles.marginVertical}>
          {headerString}
        </Heading>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            width: 800,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "center",
              flex: 1,
              width: 300,
            }}
          ></View>
          <ScrollView>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "center",
                flex: 1,
                width: 300,
              }}
            >
              <TotalRow text="Subtotal:" amount={cartState?.total} />
              {selectedMenu.tax_type === "exclusive" ? (
                <TotalRow text="Tax:" amount={total_tax} />
              ) : null}
              {selectedMenu.is_tips === true ? (
                <TotalRow text="Tip:" amount={tip} />
              ) : null}
              <TotalRow text="Discount:" amount={-1 * discountTotal} />
              {payment_method !== "cash" ? (
                <TotalRow text="Service Fee:" amount={surcharge_amount} />
              ) : null}
              <Divider />
              <TotalRow text="Order Total:" amount={total_paid} />
            </View>
          </ScrollView>
        </View>
        <View>
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/*<Button*/}
            {/*  onPress={() => handleReceipt()}*/}
            {/*  status="tertiary"*/}
            {/*  style={{ marginRight: 5, width: 150 }}*/}
            {/*>*/}
            {/*  {smsReceiptButton}*/}
            {/*</Button>*/}
            <Button
              onPress={startNewOrder}
              status="primary"
              style={{ marginLeft: 5, width: 150 }}
            >
              {buttonString}
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

function TotalRow({ text, amount }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 10,
        width: "100%",
      }}
    >
      <Heading variants="h4">{`${text}`}</Heading>
      <Heading variants="h4">{`${displayForLocale(amount)}`}</Heading>
    </View>
  );
}

export default ReceiptSent;
