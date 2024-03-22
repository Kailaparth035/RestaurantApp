/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable no-warning-comments */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-unused-styles */

import { Button, Divider, Input, useTheme } from "@ui-kitten/components";
import React, { useRef, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Block, Box, Flex } from "../../components/layouts/Index";
import OrderActions from "../../components/organisms/OrderActions";
import { OrderDetails } from "../../components/organisms/OrderDetails";
import { OrderDiscount } from "../../components/organisms/OrderDiscount";
import { OrderSummary } from "../../components/organisms/OrderSummary";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";
import { globalStyles } from "../../styles/global";
import { useAuth } from "../../contexts/AuthContext";
import { SCREEN_WIDTH } from "../../components/TipInputModal";
import { Heading, Label } from "../../components/atoms/Text";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { CartIcon } from "../../components/atoms/Icons/Icons";

export const EditOrderScreen = () => {
  const scrollViewRef = useRef();
  const {
    loadingAuth,
    employeeUser,
    tabletSelections: { menu: selectedMenu },
  } = useAuth();
  const accessCode = employeeUser?.tablet_access_code;
  const [isDiscount, setIsDiscount] = useState(selectedMenu?.is_discount);
  const [isDiscountProtected, setIsDiscountProtected] = useState(
    selectedMenu?.is_discount_protected
  );
  const [showOtpVerifyModal, setShowOtpVerifyModal] = useState(false);

  const OtpVerifyModal = () => {
    const [password, setPassword] = React.useState("");
    const [showAddCash, setShowAddCash] = React.useState("");

    const theme = useTheme();
    const styles = StyleSheet.create({
      heading: {
        marginVertical: 40,
      },
      prompt: {
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 30,
      },
      validateFlex: {
        alignItems: "center",
        padding: 10,
        flexDirection: "column",
        marginVertical: 30,
        width: "100%",
        alignSelf: "center",
      },
    });
    return (
      <Box level="1" width="100%" style={styles.prompt}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Flex style={styles.validateFlex}>
            <Block style={styles.heading}>
              <Heading variants="h2">Please Enter Admin Code.</Heading>
            </Block>
            <Input
              keyboardType="number-pad"
              disableFullscreenUI
              autoFocus
              secureTextEntry
              value={password}
              // onChange={(value) => setPin(value)}
              onChangeText={(text) => {
                setPassword(text);
              }}
              placeholder="PIN"
              onSubmitEditing={() => {
                if (password.toString() === accessCode.toString()) {
                  setShowOtpVerifyModal(false);
                  setIsDiscountProtected(false);
                } else {
                  Alert.alert("", `Invalid Pin, Please try again.`, [
                    {
                      text: "Close",
                      onPress: () =>
                        console.log("Invalid Pin, Please try again."),
                    },
                  ]);
                }
              }}
              maxLength={5}
              size="large"
              textStyle={{
                fontSize: NormalisedFonts(21),
                lineHeight: NormalisedFonts(30),
                fontWeight: "400",
                width: "50%",
                fontFamily: "OpenSans-Regular",
              }}
            />
          </Flex>
          <Flex>
            <Button
              title="Confirm"
              status="primary"
              size="giant"
              onPress={() => {
                if (password.toString() === accessCode.toString()) {
                  setShowOtpVerifyModal(false);
                  setIsDiscountProtected(false);
                } else {
                  Alert.alert("", `Invalid Pin, Please try again.`, [
                    {
                      text: "Close",
                      onPress: () =>
                        console.log("Invalid Pin, Please try again."),
                    },
                  ]);
                }
              }}
            >
              Submit Password
            </Button>
          </Flex>
        </ScrollView>
      </Box>
    );
  };

  if (showOtpVerifyModal) {
    return (
      <View style={{ flex: 1 }}>
        <OtpVerifyModal />
      </View>
    );
  }

  return (
    <Box level="1" style={globalStyles.splitUI}>
      <ScrollView style={globalStyles.splitMain} ref={scrollViewRef}>
        <Block
          width={NormalisedSizes(950)}
          style={{
            marginVertical: NormalisedSizes(40),
            marginRight: NormalisedSizes(40),
            marginLeft: NormalisedSizes(40),
            paddingRight: NormalisedSizes(40),
          }}
        >
          {isDiscount ? (
            isDiscountProtected ? (
              <>
                <Block>
                  <ButtonExtended
                    status="tertiary"
                    size="large"
                    onPress={() => {
                      setShowOtpVerifyModal(true);
                    }}
                    style={{
                      width: NormalisedSizes(300),
                      height: NormalisedSizes(72),
                      alignSelf: "center",
                      marginVertical: NormalisedSizes(20),
                      marginBottom: NormalisedSizes(30),
                    }}
                  >
                    <Label
                      buttonLabel="LabelLargeBtn"
                      variants="label"
                      variantStyle="uppercaseBold"
                    >
                      Unlock discount
                    </Label>
                  </ButtonExtended>
                </Block>
                <Divider width="100%" />
              </>
            ) : (
              <>
                <OrderDiscount />
                <Divider width="100%" />
              </>
            )
          ) : null}

          {/* <DiscountSelect /> */}
          <OrderDetails />
          <OrderSummary />
        </Block>
      </ScrollView>
      <Box level="1">
        <OrderActions />
      </Box>
    </Box>
  );
};
