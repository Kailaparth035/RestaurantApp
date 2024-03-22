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
import React, { useContext,  useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Heading, Label } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { Flex } from "../../components/layouts/flex";
import { TransactionContext } from "../../contexts/TransactionContext";
import { useAuth } from "../../contexts/AuthContext";
import { NormalisedSizes } from "../../hooks/Normalized";
import { useDatabase } from "@nozbe/watermelondb/hooks";

export function EnterPhoneNumberStep({ headerString, route, ...props }) {
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigation = useNavigation();
  const client = useApolloClient();
  const { setCustomerPhoneNumber, setReceiptToBeSent, updateOrderWithPhoneNumber } =
    useContext(TransactionContext);
  const {
    tabletSelections: {
      event: selectedEvent
    }
  } = useAuth();
  const database = useDatabase();
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const phoneInput = useRef();

  const headerTitle = () => {
    if (headerString) {
      return headerString;
    }
    return "Receive your receipt by SMS / Text Message";
  };

  const handleSubmit = () => {
    const checkValid = phoneInput.current?.isValidNumber(value);
    if (!checkValid) {
      Alert.alert("", `Please enter a valid phone number.`, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }
    const reference_id = route?.params?.reference_id;

    if (reference_id) {
      updateOrderWithPhoneNumber({
        ref_id: reference_id,
        phone_number: formattedValue,
      });
    }

    // navigation.pop();
    switch (route?.name) {
      case "EnterPhoneNumberStepCash":
        navigation.navigate("TransactionCompletedStepCash");
        break;
      case "EnterPhoneNumberStepCredit":
        navigation.navigate("TransactionCompletedStepCredit", {
          reference_id,
        });
        break;
      default:
        navigation.pop();
        break;
    }
  };

  return (
    <Box style={styles.outterBox}>
      <Block style={styles.headingBlock}>
        <Heading variants="h3">{headerTitle()}</Heading>
      </Block>
      <Block style={styles.inputBlock}>
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          textInputProps={{
            keyboardType: "phone-pad",
            disableFullscreenUI: true,
          }}
          secureTextEntry
          defaultCode="US"
          layout="first"
          disableFullscreenUI
          onChangeText={(text) => {
            const cleanNumber = text.replace(/\D/g, "");
            setValue(cleanNumber);
          }}
          onChangeFormattedText={(text) => {
            const cleanNumber = text.replace(/\D/g, "");
            setFormattedValue(cleanNumber);
          }}
          autoFocus
        />
      </Block>

      <Flex style={styles.buttonFlex}>
        <Block style={styles.cancelBlock}>
          <ButtonExtended
            status="secondary"
            size="mammoth"
            appearance="filled"
            onPress={() => navigation.pop()}
          >
            <Label variants="label" variantStyle="uppercaseBold">
              cancel
            </Label>
          </ButtonExtended>
        </Block>

        <Block style={styles.okBlock}>
          <ButtonExtended
            status="primary"
            size="mammoth"
            onPress={handleSubmit}
          >
            <Label variants="label" variantStyle="uppercaseBold">
              send
            </Label>
          </ButtonExtended>
        </Block>
      </Flex>
    </Box>
  );
}

const styles = StyleSheet.create({
  buttonFlex: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: NormalisedSizes(230),
    width: "100%",
  },
  cancelBlock: {
    flexDirection: "column-reverse",
    width: NormalisedSizes(294),
  },
  headingBlock: {
    alignSelf: "center",
    marginBottom: NormalisedSizes(25),
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: NormalisedSizes(50),
  },
  inputBlock: {
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: NormalisedSizes(50),
  },
  okBlock: {
    flexDirection: "column-reverse",
    width: NormalisedSizes(294),
  },
  outterBox: {
    height: "100%",
    paddingHorizontal: NormalisedSizes(40),
    paddingVertical: NormalisedSizes(30),
    width: "100%",
  },
});
