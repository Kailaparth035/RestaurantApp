/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-await */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable no-sequences */
/* eslint-disable react/prop-types */
/* eslint-disable line-comment-position */
/* eslint-disable no-console */
/* eslint-disable no-warning-comments */
/* eslint-disable no-use-before-define */
/* eslint-disable react-native/no-inline-styles */

import { useApolloClient } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Heading, Label } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { Flex } from "../../components/layouts/flex";
import { TransactionContext } from "../../contexts/TransactionContext";
import { useAuth } from "../../contexts/AuthContext.js";

import { NormalisedSizes } from "../../hooks/Normalized";
import ACModule from "../../services/ACService";
import { updateRFIDAsset } from "./RFIDPrompts";
import { displayForLocale } from "../../helpers/calc";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function PhoneNumberAssociation({ headerString, route }) {
  const [visible, setVisible] = useState(false);
  const [stateSubmit, setStateSumbit] = useState();
  const [errorMessage, setErrorMessage] = useState(null);
  const navigation = useNavigation();
  const client = useApolloClient();

  const { setCustomerPhoneNumber, setReceiptToBeSent, methodOfPayment } =
    useContext(TransactionContext);

  console.log("@@====methodOfPayment=======",)
  const navState = navigation.getState();
  const { uid, orderTotal } = navState.routes[navState.index]?.params || {};

  const {
    tabletSelections: { event: selectedEvent, menu: selectedMenu },
  } = useAuth();


  const database = useDatabase();
  const headerTitle = () => {
    if (headerString) {
      return headerString;
    }
    return "Receive your receipt by SMS / Text Message";
  };

  const handleCancel = () => {
    if (methodOfPayment == "qr_code") {
      return selectedMenu?.is_tips
        ? navigation.navigate("TipStepQRCode")
        : navigation.navigate("QRCodeReaderReady");
    } else {
      return selectedMenu?.is_tips
        ? navigation.navigate("TipStepRfid")
        : navigation.navigate("ReaderReady");
    }
  };

  const handleSubmit = () => {
    if (!stateSubmit) {
      const checkValid = phoneInput.current?.isValidNumber(value);
      if (!checkValid) {
        Alert.alert("", `Please enter a valid phone number.`, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        return;
      }
      setCustomerPhoneNumber(formattedValue);
      const AssociationInput = {
        phoneNumber: `+${formattedValue}`,
        eventId: selectedEvent.eventId,
        uid,
      };
      return navigation.navigate("PinInsert", {
        AssociationInput,
        total_paid: orderTotal,
      });
      // client
      //   .mutate({
      //     mutation: SEND_RFID_ASSOCIATION_LINK,
      //     variables: {
      //       AssociationInput,
      //     },
      //   })
      //   .then(async (response) => {
      //     console.log('associate phone response', JSON.stringify(response.data),response.data.associate_rfid?.message?.last_four_phone_numbers)
      //     if (response?.data?.associate_rfid?.message?.last_four_phone_numbers) {
      //       if (response.data.associate_rfid?.message?.rfid_asset?.id) {
      //         await updateRFIDAsset(response.data.associate_rfid.message.rfid_asset, database)
      //       }
      //       setRfid_last_four_phone_numbers(
      //         response.data.associate_rfid.message.last_four_phone_numbers
      //       );
      //       setStateSumbit(true);
      //       return navigation.navigate("PinInsert", {AssociationInput});
      //     }
      //       throw Error('no last_four_returned')

      //   })
      //   .catch((err) => {
      //     console.log("ERROR CAUGHT ", err.toString());

      //     console.log("setVisible", visible);
      //     console.error(err);
      //     setErrorMessage(err.toString());
      //     setVisible(true);

      //     console.log("Transaction Rfid Declined", err);
      //     setStateSumbit(false);
      //     return navigation.navigate("TransactionRfidDeclined", {
      //       errorType: "invalidAttendee",
      //       errorHeader: "We're sorry, your transaction cannot be completed.",
      //       errorMessage:
      //         "You attendee profile is incomplete or has not been created.",
      //     });
      //   });
    }
  };

  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const phoneInput = useRef();

  return (
    <Box style={styles.outterBox}>
      <ScrollView>
        <Block style={styles.headingBlock}>
          {/* TODO: make this a dynamic message based on route */}
          <View
            style={{
              marginTop: 10,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: SCREEN_WIDTH > 960 ? 0.5 : 0.75 }} />
            <View style={{ flex: 1.3, alignItems: "center" }}>
              <Heading variants={"h1"}>
                Order Total: {displayForLocale(orderTotal)}{" "}
              </Heading>
            </View>
            <View style={{ flex: SCREEN_WIDTH > 960 ? 0.45 : 0.8 }}>
              <ButtonExtended
                status="tertiary"
                onPress={() =>
                  navigation.navigate("CreditStart", { fromPaymentMethod: methodOfPayment })
                }
                style={{
                  width: NormalisedSizes(230),
                }}
              >
                <Label variants="label" variantStyle="uppercaseBold">
                  Charge a card
                </Label>
              </ButtonExtended>
            </View>
          </View>
          <View
            style={{
              marginTop: NormalisedSizes(40),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heading variants={"h3"}>
              {headerTitle()}
            </Heading>
          </View>
        </Block>
        <Block style={styles.inputBlock}>
          <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            textInputProps={{
              keyboardType: "phone-pad",
              disableFullscreenUI: true,
              onSubmitEditing: handleSubmit,
            }}
            secureTextEntry
            defaultCode="US"
            layout="first"
            disableFullscreenUI
            onChangeText={(text) => {
              const cleanNumber = text.replace(/\D/g, "");
              setValue(cleanNumber);
            }}
            containerStyle={{
              height: 90,
              borderRadius: 10
            }}
            textInputStyle={{
              color: "black",
              fontSize: 33,
            }}
            onChangeFormattedText={(text) => {
              const cleanNumber = text.replace(/\D/g, "");
              setFormattedValue(cleanNumber);
            }}
            // withDarkTheme
            // withShadow
            autoFocus
          />
        </Block>

        <Flex style={styles.buttonFlex}>
          <Block style={styles.cancelBlock}>
            <ButtonExtended
              status="secondary"
              appearance="filled"
              onPress={handleCancel}
            >
              <Label variants="label" variantStyle="uppercaseBold">
                cancel
              </Label>
            </ButtonExtended>
          </Block>

          <Block style={styles.okBlock}>
            <ButtonExtended
              status="primary"
              onPress={handleSubmit}
              style={{ width: NormalisedSizes(230) }}
            >
              <Label variants="label" variantStyle="uppercaseBold">
                send
              </Label>
            </ButtonExtended>
          </Block>
        </Flex>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  buttonFlex: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SCREEN_WIDTH > 960 ? NormalisedSizes(200) : NormalisedSizes(30),
    // width: "100%",
  },
  cancelBlock: {
    flexDirection: "column-reverse",
    width: NormalisedSizes(230),
  },
  headingBlock: {
    alignSelf: "center",
    marginBottom: NormalisedSizes(25),
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: NormalisedSizes(10),
  },
  inputBlock: {
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: SCREEN_WIDTH > 960 ? NormalisedSizes(30) : NormalisedSizes(10),
  },
  okBlock: {
    flexDirection: "row",
  },
  outterBox: {
    height: "100%",
    paddingHorizontal: NormalisedSizes(40),
    width: "100%",
  },
});
