import React, { useContext, useEffect, useMemo, useState } from "react";
import ReceiptSent from "../../components/organisms/TransactionApproved/ReceiptSent";
import { useAuth } from "../../contexts/AuthContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import {
  getSubtotalAfterDiscount,
  displayForLocale,
  tax,
  getDiscountTotal,
} from "../../helpers/calc";
import Video from "react-native-video";
import { Alert, ImageBackground, StyleSheet, View } from "react-native";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Q } from "@nozbe/watermelondb";
import { WriteLog } from "../../../src/CommonLogFile";

const formatTotals = (t) => (t ? `${(t / 100).toFixed(2)}` : "0.00");

export function TransactionCompletedStep(props) {
  const { orderTotals, createOrder, receiptToBeSent } =
    useContext(TransactionContext);
  const {
    tabletSelections: { event: selectedEvent },
    offlineMode
  } = useAuth();
  const database = useDatabase();
  const { subtotal_after_tokens, applied_discounts } = orderTotals;

  const methodOfPayment =
    props.route.name === "TransactionCompletedStepCash" ? "cash" : "card";

  const [videoPlay, setVideoPlay] = useState(true);
  const [cardType, setCardType] = useState(null);

  useEffect(() => {
    if (methodOfPayment === "cash") {
      createOrder({ offlineMode,methodOfPayment });
    } else {
      getOrderData();
    }
    WriteLog("TransactionCompletedStep props.route" + props.route);
    console.log("props.route :::", props.route);
  }, []);

  const getOrderData = async () => {
    const order = await database.collections
      .get("orders")
      .query(Q.where("reference_id", props.route.params.reference_id))
      .fetch();
    setCardType(
      JSON.parse(order[0]?._raw.payments)?.payment_data?.gatewayResponse
        ?.rawResponse?.cardAccount?.cardType
    );
  };

  if (receiptToBeSent) {
    return (
      <ReceiptSent
        headerString="Receipt Sent!"
        buttonString="Start New Order"
      />
    );
  }

  const discountTotal = getDiscountTotal({
    discounts: applied_discounts,
    subtotal: subtotal_after_tokens,
  });

  const ShowReceipt = () => {
    if (cardType === "na") {
      return <View style={{ flex: 1, backgroundColor: "black" }}></View>;
    } else {
      return (
        <ReceiptSent
          headerString="BANZAI!"
          buttonString="Start New Order"
          smsReceiptButton="SMS Receipt"
          payment_method={methodOfPayment}
          discount={discountTotal}
          reference_id={props?.route?.params?.reference_id}
        />
      );
    }
  };
  return (
    <>
      {videoPlay &&
      cardType === "MasterCard" &&
      selectedEvent.eventId === 193 ? (
        <Video
          source={require("../../../assets/video/sonic_at_checkout_animation.mp4")}
          onEnd={() => setVideoPlay(false)}
          resizeMode="cover"
          style={styles.backgroundVideo}
        />
      ) : (
        <>
          <ShowReceipt />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
    width: "100%",
    height: "100%",
  },
});
