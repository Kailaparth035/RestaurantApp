/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useNavigation } from "@react-navigation/native";
import { Button, Spinner } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import moment from "moment";
import { BackHandler } from "react-native";
import { Heading } from "../../components/atoms/Text/index";
import { Box } from "../../components/layouts/Index";
import ReceiptSent from "../../components/organisms/TransactionApproved/ReceiptSent";
import RfidFailedStep from "../../components/organisms/TransactionApproved/ReceiptSentFailed";
import { orderRfidSchema } from "../../components/types/orderRfid.type";
import { useAuth } from "../../contexts/AuthContext";
import { useTrackedState, useDispatch } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import { useDispatch as useCustomDispatch } from "../../contexts/CustomItemsProvider";
import { APPCENTER_BUILD_ID } from "@env";
import Video from "react-native-video";
import { StyleSheet } from "react-native";
import { WriteLog } from "../../../src/CommonLogFile";

export function TransactionCompletedRfid(props) {
  const cartState = useTrackedState();
  const navigation = useNavigation();
  const navState = navigation.getState();
  const { uid, rfid_asset } = navState.routes[navState.index]?.params || {};

  const [videoPlay, setVideoPlay] = useState(true);
  const [cardType, setCardType] = useState(null);
  const randomReferenceId = nanoid(16);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const {
    offlineMode,
    syncService,
    employeeUser,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
    deviceId
  } = useAuth();

  const { discount, discountType } = useContext(DiscountContext);
  const surchargeValue = selectedLocation?.digital_surcharge_percentage;
  const surchargeLabel = selectedEvent?.digital_surcharge_label;

  const {
    tip = 0,
    methodOfPayment,
    customerPhoneNumber,
    digitalSurchargeAmount,
    tokens_balance,
    setTokensBalance,
    orderTotals,
  } = useContext(TransactionContext);

  const {
    subtotal_after_tokens,
    total_discount,
    subtotal_after_discount,
    total_tax,
    subtotal_with_tax_and_tip,
    surchargeAmount,
    final_total,
    total,
    total_paid,
    tokens_redeemed,
    updated_tokens_balance,
    cash_balance,
    promo_balance,
    cashBalanceCharged,
    promoBalanceCharged,
    updated_items,
    applied_discounts,
  } = orderTotals;

  const database = useDatabase();
  const [errorStatus, setErrorStatus] = useState();
  const [status, setStatus] = useState(false);
  const [finalOrder, setFinalOrder] = useState(null);
  const dispatch = useDispatch();
  const customDispatch = useCustomDispatch();
  // WriteLog("transactioncompleted");
  // console.log("transaction completed");
  const completeOrder = async () => {
    const dateTime = moment(
      new Date().toUTCString(),
      "DD MMM YYYY HH:mm:ss"
    ).format("YYYY-MM-DDTHH:mm:ss");

    const transaction_time = dateTime;
    const transaction_at = dateTime;
    // WriteLog("transactioncompleted uid" + uid);
    // console.log({ uid });
    const orderServiceInputRfid = {
      status: "processed",
      items: updated_items,
      reference_id: randomReferenceId,
      subtotal: cartState?.total,
      tax: total_tax,
      tip,
      transaction_at,
      transaction_time,
      user_id: parseInt(employeeUser.user_id, 10),
      location_id: selectedLocation?.location_id,
      event_id: selectedLocation?.event_id,
      uid,
      device_id: parseInt(APPCENTER_BUILD_ID), // due to data type mismatch storing into device_id
      device_app_id: deviceId ? deviceId : "null", // due to data type mismatch storing into device_app_id
      digital_surcharge_percentage:
        selectedLocation?.digital_surcharge_percentage,
      digital_surcharge: surchargeAmount,
      tokens_redeemed,
      vendor_id: Number(selectedLocation.vendor_id) || null,
      menu_id: Number(selectedMenu.id),
    };

    if (applied_discounts?.length > 0) {
      orderServiceInputRfid.discount = applied_discounts;
    }
    // WriteLog("transactioncompleted Trasanction completeed mounted");
    // console.log("Trasanction completeed mounted");
    try {
      const validateSchema = orderRfidSchema.validate(orderServiceInputRfid);
      if (validateSchema.error) {
        // WriteLog(
        //   "transactioncompleted validate rfid error" + validateSchema.error
        // );
        // console.log(
        //   "validate rfid error",
        //   JSON.stringify(validateSchema.error)
        // );
        throw new Error("validateSchema.error", validateSchema.error);
      }
      // WriteLog("transactioncompleted validateSchema" + validateSchema);
      // console.log("validateSchema", validateSchema);
      // return orderServiceInputRfid;
    } catch (error) {
      // eslint-disable-next-line no-console
      WriteLog("transactioncompleted error" + error);
      console.error("ERROR RFID", error);
    }

    const extraPayloadData = {
      digital_surcharge_percentage: surchargeValue,
      digital_surcharge_label: surchargeLabel,
    };
    WriteLog("transactioncompleted Push transaction");
    console.log("Push transaction ");
    try {
      const updatedOrder = await syncService.newOrderPush(
        orderServiceInputRfid,
        extraPayloadData,
        "rfid",
        offlineMode
        // addSyncLogs
      );

      const clearCart = () => {
        dispatch({ type: "DELETE_ORDER" });
      };

      const clearCustomItems = () => {
        customDispatch({ type: "DELETE_PRODUCTS" });
      };
      setTokensBalance({});
      setFinalOrder({ ...updatedOrder, subtotal_after_tokens });
    } catch (error) {
      WriteLog("transactioncompleted error" + error);
      console.log({ error });
      let formattedErrorMessage = "TRANSACTION_DENIED";

      if (error?.message) {
        formattedErrorMessage =
          typeof error.message === "string"
            ? error.message
            : JSON.parse(error.message).error;
      }
      WriteLog("transactioncompleted TRANSACTION_DEN" + error);
      console.log(
        `[TRANSACTION_DENIED]`,
        error ===
          "Could not find an attendee linked to this rfid asset or invalid rfid asset.",
        error.message,
        formattedErrorMessage
      );
      if (error === "No Card On File") {
        return navigation.navigate("TransactionRfidDeclined", {
          errorType: "invalidAttendee",
          errorHeader: "We're sorry, your transaction cannot be completed.",
          errorMessage:
            "Your attendee profile has no active credit/debit cards.  Please update attendee profile.",
        });
      }
      setFinalOrder();
      setErrorStatus(formattedErrorMessage);
    }

    setStatus(true);
  };
  useEffect(() => {
    getAttendeeData();
    WriteLog("transactioncompleted transactino completed");
    console.log("transactino completed");
    setTimeout(() => {
      completeOrder();
    }, 100);
  }, [navigation]);
  WriteLog("transactioncompleted errorStatus" + errorStatus);
  WriteLog("transactioncompleted status" + status);
  console.log("setErrorStatus", errorStatus);
  console.log("setStatus", status);

  const getAttendeeData = async () => {
    const attendees = await database.collections
      .get("attendees")
      .query()
      .fetch();

    const attendee = attendees.find((x) => x._raw.id == rfid_asset.attendee_id);

    if (JSON.parse(attendee._raw.card_on_files)[0].length !== 0) {
      let transaction_card_type = JSON.parse(attendee._raw.card_on_files)[0]
        .card_type;
      setCardType(transaction_card_type);
    }
  };

  if (errorStatus) {
    WriteLog("transactioncompleted [TRANSACTION_DENIED] WE ARE IN it");
    console.log(`[TRANSACTION_DENIED] WE ARE IN it`);
    return (
      <RfidFailedStep
        headerString="We're sorry, your transaction is declined."
        subHeaderString={errorStatus}
        buttonString="Return to Menu"
      />
    );
  }

  if (status === true) {
    const message = finalOrder?.data?.order_service_rfid?.message;
    const {
      tokens_balance,
      cash_balance,
      promo_balance,
      total,
      cashBalanceCharged = 0,
      promoBalanceCharged = 0,
      total_paid = 0,
      digital_surcharge,
      tax,
      tip,
      total_discount,
    } = message;

    return (
      <>
        {videoPlay && cardType === "M" && selectedEvent.eventId === 193 ? (
          <Video
            source={require("../../../assets/video/sonic_at_checkout_animation.mp4")}
            onEnd={() => setVideoPlay(false)}
            resizeMode="cover"
            style={styles.backgroundVideo}
          />
        ) : (
          <ReceiptSent
            headerString="BANZAI!"
            tokens_balance={tokens_balance}
            surchargeAmount={digital_surcharge}
            cash_balance={cash_balance}
            promo_balance={promo_balance}
            cashBalanceCharged={cashBalanceCharged}
            promoBalanceCharged={promoBalanceCharged}
            total_paid={total_paid + cashBalanceCharged + promoBalanceCharged}
            buttonString="Start New Order"
            smsReceiptButton="SMS Receipt"
            payment_method={"rfid"}
            reference_id={randomReferenceId}
          />
        )}
      </>
    );
  }
  return (
    <Box
      level="1"
      width="100%"
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingTop: 20,
      }}
    >
      <Heading variants="h2">Please wait...</Heading>
      <Spinner />
      <Button onPress={() => navigation.navigate("Menu")}>Cancel</Button>
    </Box>
  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
    width: "100%",
    height: "100%",
  },
});
