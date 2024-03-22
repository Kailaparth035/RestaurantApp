/* eslint-disable react-native/no-raw-text */
/* eslint-disable react/prop-types */
import { useNavigation } from "@react-navigation/native";
import { Button, useTheme } from "@ui-kitten/components";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch } from "../../../contexts/CartContext";
import { useDispatch as useCustomDispatch } from "../../../contexts/CustomItemsProvider";
import { DiscountContext } from "../../../contexts/DiscountContext";
import { TransactionContext } from "../../../contexts/TransactionContext";
import { CloseXCircleIcon } from "../../atoms/Icons/Icons";
import { Heading } from "../../atoms/Text";

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  marginVertical: {
    marginVertical: 20,
  },
});

// TODO: Handle Phone Number sent for RFID registration
//  FIXME: name: Final Prompt/ Final Message
function RfidFailedStep({ headerString, buttonString, subHeaderString }) {
  const navigation = useNavigation();
  const theme = useTheme();

  const { setReceiptToBeSent } = useContext(TransactionContext);

  const {
    setSelectedDiscount,
    setIsDiscounted,
    setDiscountType,
    setPreviousIndex,
  } = useContext(DiscountContext);

  const dispatch = useDispatch();
  const customDispatch = useCustomDispatch();

  const clearCart = () => {
    dispatch({ type: "DELETE_ORDER" });
  };

  const clearCustomItems = () => {
    customDispatch({ type: "DELETE_PRODUCTS" });
  };

  function handlePress() {
    setSelectedDiscount(null);
    setIsDiscounted(null);
    setDiscountType(null);
    setPreviousIndex(null);
    setSelectedDiscount(null);
    clearCart();
    clearCustomItems();
    setReceiptToBeSent(false);
    navigation.navigate("Menu");
  }

  return (
    <View style={styles.box}>
      <CloseXCircleIcon
        width={100}
        height={100}
        fill={`${theme["color-primary-500"]}`}
        style={styles.marginVertical}
      />
      <Heading variants="h2" style={styles.marginVertical}>
        {headerString}
      </Heading>
      <Heading variants="h4">{subHeaderString || "Please flip back to cashier"}</Heading>
      <View>
        <View style={styles.marginVertical}>
          <Button onPress={handlePress} status="secondary">
            {buttonString}
          </Button>
        </View>
      </View>
    </View>
  );
}

export default RfidFailedStep;
