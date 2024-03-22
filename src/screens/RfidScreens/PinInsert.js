import { useNavigation } from "@react-navigation/native";
import { useApolloClient } from "@apollo/client";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Q } from "@nozbe/watermelondb";
import { Button, Input, Spinner } from "@ui-kitten/components";
import React, { useContext, useState, useEffect } from "react";
import { Alert, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Heading } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { Flex } from "../../components/layouts/flex";
import { TransactionContext } from "../../contexts/TransactionContext";
import { useAuth } from "../../contexts/AuthContext";
import { NormalisedFonts } from "../../hooks/Normalized";
import { SEND_RFID_ASSOCIATION_LINK } from "../../fragments/resolvers";
import { updateRFIDAsset } from "./RFIDPrompts";
import { getRfidLocal } from "./utils";
import { WriteLog } from "../../../src/CommonLogFile";

export function InsertPin({ route }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateOrderTotals, methodOfPayment } = useContext(TransactionContext);
  const { tabletSelections: {
    menu: selectedMenu,
    event: selectedEvent,
  }, syncService } = useAuth();
  const client = useApolloClient();
  const database = useDatabase();
  const navigation = useNavigation();
  const navState = navigation.getState();

  const { AssociationInput, rfid_asset, total_paid } =
    navState.routes[navState.index]?.params || {};

  const netInfo = useNetInfo();

  const handleConfirm = async () => {
    if (pin == undefined || pin == "" || pin?.length < 4) {
      Alert.alert("", `Please enter 4 digit pin.`, [
        {
          text: "Close",
          onPress: () => {
            WriteLog("Pininsert Bad rfid_last_four_phone_numbers request");
            console.log("Bad rfid_last_four_phone_numbers request");
          },
        },
      ]);
      return;
    }

    if (AssociationInput && !loading) {
      setLoading(true);
      // console.log({ AssociationInput });
      const attendees = await database.collections
        .get("attendees")
        .query(Q.where("phone_number", AssociationInput.phoneNumber));
      const attendee = attendees.find((x) => x.personnal_pin == pin);
      if (attendees?.length > 0 && !attendee?.id) {
        Alert.alert(
          "",
          `No attendee locally with that phone number, please try again.`,
          [
            {
              text: "Close",
              onPress: () => {
                WriteLog("Pininsert Bad rfid_last_four_phone_numbers request");
                console.log("Bad rfid_last_four_phone_numbers request");
              },
            },
          ]
        );
        setLoading(false);
      } else if (attendee?.id && attendee?.is_active) {
        if (attendee.personnal_pin == pin) {
          const attendeeId = attendee?.id;
          let promoBalance = 0;
          const promoBalanceApplied = attendee?.promo_balance_rfid_applied;
          WriteLog(
            "Pininsert attendee?.promo_balance_rfid_applied" +
            attendee?.promo_balance_rfid_applied +
            attendee?._raw?.promo_balance_rfid_applied
          );
          console.log(
            "attendee?.promo_balance_rfid_applied",
            attendee?.promo_balance_rfid_applied,
            attendee?._raw?.promo_balance_rfid_applied
          );
          if (attendee?.promo_balance > 0 && !promoBalanceApplied) {
            promoBalance = attendee.promo_balance;
          }
          const rfidAsset = await getRfidLocal(
            database,
            AssociationInput?.uid || rfid_asset?.uid
          );
          WriteLog(
            "Pininsert pin insert" +
            {
              rfidAsset: rfidAsset,
              attendee: attendee,
              promoBalance: promoBalance,
            }
          );
          // console.log("pin insert", { rfidAsset, attendee, promoBalance });
          const updateCurrentRfidInput = {
            ...(rfidAsset._raw || {}),
            uid: AssociationInput?.uid || rfid_asset?.uid,
            attendee_id: Number(attendeeId),
            last_four_phone_numbers: attendee.personnal_pin,
            is_active: attendee.is_active,
            promo_balance: promoBalance,
            event_id: selectedEvent,
          };
          WriteLog(
            "Pininsert updateCurrentRfidInput" +
            {
              updateCurrentRfidInput: updateCurrentRfidInput,
            }
          );
          // console.log({ updateCurrentRfidInput });
          await updateRFIDAsset(updateCurrentRfidInput, database);
          updateOrderTotals({
            rfid_asset: updateCurrentRfidInput,
            payment_type: "rfid",
          });
          const updatedRfid = await getRfidLocal(
            database,
            AssociationInput?.uid || rfid_asset?.uid
          );
          WriteLog("Pininsert rfid asset updated" + updatedRfid);
          console.log("rfid asset updated", updatedRfid);
          // addSyncLogs({updatedRfid: updatedRfid?._raw})
          const batchUpdate = [];
          batchUpdate.push(
            attendee.prepareUpdate((record) => {
              record.promo_balance_rfid_applied = promoBalance > 0;
              record.is_pushed = false;
              record.status = "pending";
              record.unsynced_rfid_uid =
                AssociationInput?.uid || rfid_asset?.uid;
            })
          );
          await database.write(async () => {
            try {
              database.batch(batchUpdate);
            } catch (error) {
              WriteLog("Pininsert error" + error);
              console.log({ error });
            }
          });
          // syncService.syncAssociations();#TODO Sync Associations
          return navigation.navigate("TransactionRfidComplete", {
            uid: AssociationInput?.uid || rfid_asset?.uid,
            rfid_asset: rfid_asset,
          });
        }
        WriteLog("Pininsert invalid pin 2");
        console.log("invalid pin 2");
        Alert.alert("", `Invalid Pin, please try again.`, [
          {
            text: "Close",
            onPress: () => {
              console.log("Bad rfid_last_four_phone_numbers request"),
                WriteLog("Pininsert Bad rfid_last_four_phone_numbers request");
            },
          },
        ]);
        setLoading(false);
      } else {
        try {
          const {
            data: {
              associate_rfid: { message },
            },
          } = await client.mutate({
            mutation: SEND_RFID_ASSOCIATION_LINK,
            variables: {
              AssociationInput: {
                ...AssociationInput,
                personnal_pin: pin?.toString(),
              },
            },
          });
          WriteLog("Pininsert message" + message);
          console.log({ message });
          if (message?.rfid_asset?.id) {
            await updateRFIDAsset(
              {
                ...message.rfid_asset,
                uid: AssociationInput.uid || rfid_asset.uid,
              },
              database
            );
          }
          if (message?.last_four_phone_numbers == pin) {
            return navigation.navigate("TransactionRfidComplete", {
              uid: AssociationInput?.uid || rfid_asset?.uid,
              rfid_asset: rfid_asset,
            });
          }
          WriteLog("Pininsert invalid pin 3");
          console.log("invalid pin 3");
          Alert.alert("", `Invalid Pin, please try again.`, [
            {
              text: "Close",
              onPress: () => {
                console.log("Bad rfid_last_four_phone_numbers request"),
                  WriteLog(
                    "Pininsert Bad rfid_last_four_phone_numbers request"
                  );
              },
            },
          ]);
          setLoading(false);
        } catch (error) {
          WriteLog("Pininsert error" + error);
          console.log({ error });
          setLoading(false);
          if (error.message) {
            if (
              error.message ===
              "There pin number associated with this phone number is incorrect. Please try again."
            ) {
              WriteLog("Pininsert invalid pin 4");
              console.log("invalid pin 4");
              Alert.alert("", `Invalid Pin, please try again.`, [
                {
                  text: "Close",
                  onPress: () => {
                    console.log("Bad rfid_last_four_phone_numbers request"),
                      WriteLog(
                        "Pininsert Bad rfid_last_four_phone_numbers request"
                      );
                  },
                },
              ]);
              setLoading(false);
            } else if (
              error.message ===
              "There is no attendee profile associated with this number.  Please try entering phone number again."
            ) {
              Alert.alert(
                "",
                `A Cashless Profile was not found.`,
                [
                  {
                    text: "Retry",
                    onPress: () => {
                      navigation.navigate("RegisterRfidAssociation", { uid: AssociationInput.uid, orderTotal: total_paid });
                    }
                  },
                  {
                    text: "Pay with Credit",
                    onPress: () => {
                      navigation.navigate("CreditStart", { fromPaymentMethod: methodOfPayment });
                    },
                  },
                ]);
              setLoading(false);
            }
          } else {
            return navigation.navigate("TransactionRfidDeclined", {
              errorType: "invalidAttendee",
              errorHeader: "We're sorry, your transaction cannot be completed.",
              errorMessage:
                "You attendee profile is incomplete or has not been created.",
            });
          }
        }
      }
    } else {
      if (pin !== rfid_asset.last_four_phone_numbers) {
        Alert.alert("", `Invalid Pin, please try again.`, [
          {
            text: "Close",
            onPress: () => {
              console.log("Bad rfid_last_four_phone_numbers request"),
                WriteLog("Pininsert Bad rfid_last_four_phone_numbers request");
            },
          },
        ]);
        setLoading(false);
        return null;
      }
      return navigation.navigate("TransactionRfidComplete", {
        uid: AssociationInput?.uid || rfid_asset?.uid,
        rfid_asset: rfid_asset,
      });
    }
  };

  const handleClose = async () => {
    if (methodOfPayment == "qr_code") {
      selectedMenu?.is_tips
        ? navigation.navigate("TipStepQRCode")
        : navigation.navigate("QRCodeReaderReady");
    } else {
      selectedMenu?.is_tips
        ? navigation.navigate("TipStepRfid")
        : navigation.navigate("ReaderReady");
    }
  };

  return (
    <Box level="1" width="100%" style={styles.prompt}>
      <Flex style={styles.validateFlex}>
        <Block style={styles.heading}>
          <Heading variants="h2">Please enter your 4-digit PIN.</Heading>
        </Block>
        <Input
          keyboardType="number-pad"
          disableFullscreenUI
          autoFocus
          secureTextEntry
          maxLength={4}
          // onChange={(value) => setPin(value)}
          onChangeText={(text) => setPin(text)}
          placeholder="PIN"
          size="large"
          textStyle={{
            fontSize: NormalisedFonts(21),
            lineHeight: NormalisedFonts(30),
            fontWeight: "400",
            fontFamily: "OpenSans-Regular",
          }}
          onSubmitEditing={() => {
            handleConfirm();
          }}
        />
      </Flex>

      <Flex style={styles.buttonFlex}>
        <Button
          title="Cancel"
          status="secondary"
          size="giant"
          appearance="outline"
          onPress={handleClose}
        >
          CANCEL
        </Button>
        <Button
          title="Confirm"
          status="primary"
          size="giant"
          onPress={handleConfirm}
          disabled={loading}
        >
          CONFIRM
        </Button>
      </Flex>
      {loading && (
        <Flex
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Heading variants="h2" variantStyle="default">
            Please wait...
          </Heading>
          <Spinner />
        </Flex>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  buttonFlex: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
    textAlign: "center",
  },
  heading: {
    marginVertical: 20,
  },
  prompt: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  validateFlex: {
    alignItems: "center",
    flex: 3,
    flexDirection: "column",
    width: "45%",
  },
});
