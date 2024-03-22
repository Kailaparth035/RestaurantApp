/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useApolloClient } from "@apollo/client";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useNavigation } from "@react-navigation/native";
import { startsWith } from "lodash";
import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, Alert, Text } from "react-native";
import { Box } from "../../components/layouts/BoxContainer";
import { useTransactionContext } from "../../contexts/TransactionContext";
import { useAuth } from "../../contexts/AuthContext";
import { LOOKUP_RFID, RFID_LOOKUP } from "../../fragments/resolvers";
import { SpinnerAndCancel } from "../PaymentScreens/loading/SpinnerLoading";
// eslint-disable-next-line import/no-cycle
import { rfidErrors } from "./rfidErrors";
import { getRfidLocal } from "./utils";
import { WriteLog } from "../../../src/CommonLogFile";
import {NewSyncSingleRfid} from "../../services/new_sync/newSyncRFID";
const status = {
  undetected: "undetected",
  declined: "declined",
  approved: "approved",
  loading: "loading",
  test: "test",
  register: "register",
};

export async function updateRFIDAsset(asset, database, addSyncLogs = () => { }) {

  const rfid_assets = database.collections.get("rfid_assets");
  const batchActions = [];

  let localRFIDAsset = await getRfidLocal(database, asset.uid)

  const {
    _raw,
    rfid_id,
    attendee_id: localAttendeeId,
    uid: localUID,
    event_id: localEventId,
    is_active: localIsActive,
    last_four_phone_numbers: localLastFour,
    tokens_balance: localTokensBalance,
    cash_balance: localCashBalance,
    promo_balance: localPromoBalance
  } = localRFIDAsset || {};

  const {
    id,
    event_id,
    is_active,
    last_four_phone_numbers = "",
    tokens_balance,
    cash_balance,
    promo_balance,
    attendee_id,
    uid
  } = asset;

  if (localRFIDAsset?.id) {
    batchActions.push(
        localRFIDAsset.prepareUpdate((record) => {
          record.attendee_id = Number(asset.attendee_id) || null
          record.is_active = asset.is_active;
          record.last_four_phone_numbers = asset.last_four_phone_numbers || null;
          record.promo_balance = asset.promo_balance;
        })
    );
  } else {
    batchActions.push(
      rfid_assets.prepareCreate((record) => {
        record._raw.id = asset.uid;
        record.rfid_id = asset.id;
        record.attendee_id = Number(attendee_id) || null;
        record.uid = uid;
        record.event_id = Number(event_id);
        record.is_active = is_active;
        record.last_four_phone_numbers = last_four_phone_numbers || "";
        record.tokens_balance = tokens_balance;
        record.cash_balance = cash_balance;
        record.promo_balance = promo_balance;
        record._raw.attendee_id = Number(asset.attendee_id);
      })
    );
  }

  if (batchActions.length > 0) {
    await database.write( async () => {
      try {
        database.batch(batchActions);
      } catch (error) {
        console.error("Error encountered while batching actions:", error);
      }
    });
  } else {
    // console.log("No batch actions to process.");
  }
  const confirmlocalRFIDAsset = await getRfidLocal(database, asset.uid);

  return true;
}
export function RFIDPrompts({ route }) {
  const [prompt, setPrompt] = useState(status.loading);

  const {
    tabletSelections: {
      event: selectedEvent,
    },
    offlineMode,
    netInfo,
  } = useAuth();
  const { eventId } = selectedEvent;
  const client = useApolloClient();
  const navigation = useNavigation();
  const {
    setMethodOfPayment,
    setUid,
    setTokensBalance,
    tip,
    updateOrderTotals,
    orderTotals,
  } = useTransactionContext();
  const [errorMessage, setErrorMessage] = useState("Error");
  const database = useDatabase();
  const regHex = /[0-9A-Fa-f]{6}/g;

  async function getRfidValidLocalDB(scannedUUID, eventId, netInfo) {
    try {
      if (scannedUUID === "Asset not detected") {
        setErrorMessage(scannedUUID);
        setPrompt(status.undetected);
        return navigation.navigate(
          "TransactionRfidDeclined",
          rfidErrors.notDetected
        );
      }
      // console.log(`validated rfid ${scannedUUID}`);
      await NewSyncSingleRfid(client, eventId, scannedUUID, database);
      const rfid_asset = await getRfidLocal(database, scannedUUID);
      if (!rfid_asset?.id) {
        console.log(`no rfid asset`);
        await validateRFID(scannedUUID, eventId, netInfo);
      } else {
        const { attendee_id, tokens_balance, cash_balance, promo_balance, is_active } = rfid_asset
        const { total_paid } = await updateOrderTotals({ rfid_asset, payment_type: "rfid" });
        console.log({ total_paid });
        if (total_paid <= 0) {
          return navigation.navigate("TransactionRfidComplete", {
            uid: scannedUUID,
          });
        } else if (is_active === true) {
          console.log('go to pin insert');
          setPrompt(status.approved);
          return navigation.navigate("PinInsert", {
            rfid_asset: rfid_asset._raw,
          });
        } else {
          console.log('go to validate rfid');
          await validateRFID(scannedUUID, eventId, netInfo)
        }
      }
    } catch (error) {
      WriteLog("updateRFIDAsset error" + error);
      console.log({ error });
      return navigation.navigate("TransactionRfidDeclined", {
        ...rfidErrors.notDetected,
      });
    }
  }

  const validateRFID = async (scannedUUID, eventId) => {
    WriteLog(
      "updateRFIDAsset [validateRFID] scannedUID,eventId" +
        eventId +
        netInfo +
        offlineMode
    );
    console.log(
      "[validateRFID] scannedUID",
      "eventId",
      eventId,
      netInfo,
      offlineMode
    );
    const { total_paid } = await updateOrderTotals();
    if (!netInfo.isConnected || offlineMode) {
      return navigation.navigate("RegisterRfidAssociation", {
        uid: scannedUUID,
        orderTotal: total_paid,
      });
    } else {
      if (scannedUUID === "Asset not detected") {
        setErrorMessage(scannedUUID);
        setPrompt(status.undetected);
        return navigation.navigate(
          "TransactionRfidDeclined",
          rfidErrors.notDetected
        );
      }
      console.log('validate rfid')
      try {
        const {
          data: { rfid_assets_by_pk },
        } = await client.mutate({
          mutation: LOOKUP_RFID,
          variables: { eventId: selectedEvent.eventId, uid: scannedUUID },
        });
        const { attendee, ...rfidAsset } = rfid_assets_by_pk || {};

        const { attendee_id, tokens_balance, is_active, cash_balance: cashBalance, promo_balance: promoBalance, id } = rfidAsset;
        console.log({ id, rfidAsset })
        console.log(`validateRfid ${attendee_id, tokens_balance, is_active, cashBalance, promoBalance, id}`)
        const { total_paid } = await updateOrderTotals({ rfidAsset })
        if (!id) {
          setPrompt(status.register);
          return navigation.navigate("RegisterRfidAssociation", {
            uid: scannedUUID,
            orderTotal: total_paid,
          });
        }
        console.log(`updateRfid`)
        // await updateRFIDAsset(rfidAsset, database);

        if (total_paid <= 0) {
          return navigation.navigate("TransactionRfidComplete", {
            uid: scannedUUID,
          });
        }
        if (!is_active) {
          setPrompt(status.approved);
          return navigation.navigate("RegisterRfidAssociation", {
            uid: scannedUUID,
            orderTotal: total_paid,
          });
        }
        if (attendee?.is_active) {

          setPrompt(status.approved);
          return navigation.navigate("PinInsert", {
            rfid_asset: rfidAsset,
          });
        }

        if (!attendee?.is_active) {
          setPrompt(status.register);

          return navigation.navigate("TransactionRfidDeclined", {
            errorType: "invalidAttendee",
            errorHeader: "We're sorry, your transaction cannot be completed.",
            errorMessage:
              "Your attendee profile has no active credit/debit cards.  Please update attendee profile.",
          });
        }
      } catch (err) {
        WriteLog("updateRFIDAsset err" + err);
        console.log({ err });
        if (err.message === "Network request failed") {
          setPrompt(status.register);
          return navigation.navigate(
            "TransactionRfidDeclined",
            rfidErrors.default
          );
        }
        if (err.graphQLErrors) {
          WriteLog("updateRFIDAsset RFID LOOKUP RESPONSE" + err.graphQLErrors);
          console.log("[validateRFID] RFID LOOKUP RESPONSE", err.graphQLErrors);
          const newError = err.graphQLErrors[0]?.extensions.internal?.error
            ?.message
            ? err.graphQLErrors[0]?.extensions.internal.error.message
            : err.graphQLErrors[0].message;
          if (rfidErrors[newError]) {
            return navigation.navigate(
              "TransactionRfidDeclined",
              rfidErrors[newError]
            );
          } else {
            return navigation.navigate(
              "TransactionRfidDeclined",
              rfidErrors.default
            );
          }
        } else {
          setPrompt(status.declined);
          return navigation.navigate(
            "TransactionRfidDeclined",
            rfidErrors.default
          );
        }
      }
    }
  };

  const executePayment = async (newEvent) => {
    if (regHex.test(newEvent) && newEvent.length >= 8) {
      const result = newEvent;
      setMethodOfPayment("rfid");
      try {
        await getRfidValidLocalDB(result, eventId);
      } catch (e) {
        WriteLog("updateRFIDAsset onRfidScanResult" + e);
        console.log(`[onRfidScanResult] ${e}`);
        setPrompt(status.declined);
        return navigation.navigate(
          "TransactionRfidDeclined",
          rfidErrors.notDetected
        );
      }
    } else {
      WriteLog("updateRFIDAsset RFID RESULT - SET DECLINE");
      console.log("RFID RESULT - SET DECLINE");
      setPrompt(status.declined);
      return navigation.navigate(
        "TransactionRfidDeclined",
        rfidErrors.notDetected
      );
    }
  };

  useEffect(() => {
    let newEvent;
    // if (route?.params?.is_qr_payment) {
    //   newEvent = route?.params?.data;
    //   executePayment(newEvent);
    // }
    const subscription = DeviceEventEmitter.addListener(
        "onRfidScanResult",
        async (event) => {
          console.log("RFID SCAN RESULT", event);
          if (startsWith(event, "00")) {
            newEvent = event.slice(2);
          }
          executePayment(newEvent);
          regHex.lastIndex = 0;
        }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Box level="1" width="100%" style={styles.prompt}>
      <SpinnerAndCancel />
    </Box>
  );
}

const styles = StyleSheet.create({
  prompt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
});
