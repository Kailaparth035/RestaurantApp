/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */
import { useTheme, Spinner, Button, Input } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  DeviceEventEmitter,
  Modal,
  View,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useApolloClient } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { startsWith } from "lodash";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { ButtonExtended } from "../../atoms/Button/Button";
import { Label, Heading } from "../../atoms/Text";
import { CheckmarkCircleIcon } from "../../atoms/Icons/Icons";
import Row from "../../particles/Row";
import { Block, Box, Flex } from "../../layouts/Index";
import RoninChipService from "../../../services/RoninChipService";
import {
  LOOKUP_RFID,
  addCashBalance,
  addRfidAssetWithCashBalance,
} from "../../../fragments/resolvers";
import { useAuth } from "../../../contexts/AuthContext";
import { WriteLog } from "../../../../src/CommonLogFile";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

function CashCalculator() {
  const theme = useTheme();
  const [cashTotal, setCashTotal] = React.useState(0);
  const [showCashTotal, setShowCashTotal] = React.useState(0.0);
  const [showWristbandModal, setShowTapWristbandModal] = React.useState(false);

  const styles = StyleSheet.create({
    keypad: {
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
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

  const formatDisplayTotal = (total) => {
    if (total) {
      let temp = JSON.parse(total) / 100;
      setShowCashTotal("$" + JSON.stringify(temp));
    }
  };

  return (
    <Box level="1" width="100%" style={styles.prompt}>
      {showWristbandModal && (
        <Modal
          visible={showWristbandModal}
          transparent
          onBackdropPress={() => setShowTapWristbandModal(false)}
        >
          <TouchableWithoutFeedback
            onPress={(e) => {
              setShowTapWristbandModal(false);
            }}
          >
            <Box
              style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "rgba(0,0,0,.3)",
              }}
            />
          </TouchableWithoutFeedback>
          <RFIDLookup
            closeModal={() => setShowTapWristbandModal(false)}
            onSuccess={() => {
              setShowTapWristbandModal(false);
              setCashTotal("0");
            }}
            cashTotal={cashTotal}
            formattedCashTotal={() => cashTotal} ///formatDisplayTotal
          />
        </Modal>
      )}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Flex style={styles.validateFlex}>
          <Block style={styles.heading}>
            <Heading variants="h2">
              Would you like to look up an RFID Asset?
            </Heading>
          </Block>
        </Flex>
        <Block style={styles.keypad}>
          <Flex flexDirection="row"></Flex>
        </Block>
        <Flex>
          <Button
            title="Confirm"
            status="primary"
            size="giant"
            onPress={() => {
              setShowTapWristbandModal(true);
            }}
          >
            YES!
          </Button>
        </Flex>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  marginVertical: {
    marginVertical: 10,
  },
  prompt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  sameWidth: {
    flex: 1,
  },
});

function RFIDLookup({ closeModal, onSuccess, cashTotal, formattedCashTotal }) {
  const navigation = useNavigation();
  const theme = useTheme();
  const [rfidValue, setRfidValue] = useState("");
  const [enterManuallyRFID, setEnterManuallyRFID] = useState(false);

  const client = useApolloClient();
  const {
    employeeUser,
    tabletSelections: { event: selectedEvent },
  } = useAuth();
  const [
    {
      uid,
      scanning,
      error,
      pingScan,
      updatingAssets,
      success,
      confirmAddCash,
      currentCashBalance,
      currentPromoBalance,
      currentTokenBalance,
      currentLinkStatus,
      currentLast4PhoneNumber,
      // firstName,
      // lastName,
      // lastFourDigits,
      // cardType,
      rfidCreated,
    },
    setScanState,
  ] = React.useState({
    uid: null,
    scanning: false,
    updatingAssets: false,
    confirmAddCash: false,
    error: null,
    pingScan: 0,
    success: null,
    currentCashBalance: 0,
    currentPromoBalance: 0,
    currentTokenBalance: null,
    currentLinkStatus: null,
    currentLast4PhoneNumber: null,
    // firstName: null,
    // lastName: null,
    // lastFourDigits: null,
    // cardType: null,
    rfidCreated: false,
  });

  const updateScanState = (newState) => {
    setScanState((prevState) => ({ ...prevState, ...newState }));
  };
  const formatTokensBalanceDisplay = (currentTokenBalance) => {
    if (Object.keys(currentTokenBalance).length > 0) {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Heading variants="h3" style={{ marginTop: 10 }}>
            Tokens Remaining:
          </Heading>
          <View>
            {Object.keys(currentTokenBalance).map((t) => {
              const token = currentTokenBalance[t];
              return (
                <Heading variants="h3">{` ${
                  token?.redeemable_token_name || t
                } - ${token.balance}`}</Heading>
              );
            })}
          </View>
        </View>
      );
    }
    return null;
  };
  const lookupRFID = async (rfidUID) => {
    updateScanState({
      uid: rfidUID,
      scanning: false,
    });
    try {
      const {
        data: { rfid_assets_by_pk },
      } = await client.mutate({
        mutation: LOOKUP_RFID,
        variables: { eventId: selectedEvent.eventId, uid: rfidUID },
      });
      WriteLog("RfidLookup " + rfid_assets_by_pk);
      console.log({ rfid_assets_by_pk });
      if (rfid_assets_by_pk !== null) {
        setEnterManuallyRFID(false);
        updateScanState({
          confirmAddCash: true,
          scanning: false,
          currentCashBalance: rfid_assets_by_pk?.cash_balance || 0,
          currentPromoBalance: rfid_assets_by_pk?.promo_balance || 0,
          currentTokenBalance: rfid_assets_by_pk?.tokens_balance || 0,
          currentLinkStatus: rfid_assets_by_pk?.is_active || null,
          currentLast4PhoneNumber:
            rfid_assets_by_pk?.last_four_phone_numbers || null,
          // firstName: rfid_assets_by_pk?.attendee.first_name || null,
          // lastName: rfid_assets_by_pk?.attendee?.last_name || null,
          // lastFourDigits: rfid_assets_by_pk?.last_four_digits || null,
          // cardType: rfid_assets_by_pk?.card_type || null,
          rfidCreated: !!rfid_assets_by_pk?.id,
        });
      } else {
        console.log({rfidUID})
        alert("Wristband not found on Ronin Servers, UID= " + String(rfidUID));
      }
    } catch (error) {
      WriteLog("RfidLookup " + error);
      console.log({ error });
      updateScanState({
        error: "Unable to add cash to wristband at this time",
      });
    }
  };
  const linkStatus = currentLinkStatus ? "Yes" : "No";
  const maskedPin = currentLast4PhoneNumber
    ? `**${currentLast4PhoneNumber.slice(-2)}`
    : "No PIN Set";
  const updateBalance = async () => {
    updateScanState({ updatingAssets: true });

    const formattedCashBalance = Number.isNaN(Number(currentCashBalance))
      ? 0
      : Number(currentCashBalance);
    const formattedCashTotal = Number.isNaN(Number(cashTotal))
      ? 0
      : Number(cashTotal);

    const variables = {
      uid,
      eventId: selectedEvent.eventId,
      cashBalance:
        Number(cashTotal) < 1 ? 0 : formattedCashBalance + formattedCashTotal,
      updatedBy: Number(employeeUser.user_id),
    };

    try {
      if (!rfidCreated) {
        const {
          data: { insert_rfid_assets_one },
        } = await client.mutate({
          mutation: addRfidAssetWithCashBalance,
          variables,
        });

        if (insert_rfid_assets_one) {
          updateScanState({
            updatingAssets: false,
            success: true,
            currentCashBalance: insert_rfid_assets_one.cash_balance,
          });
        }
      } else {
        const {
          data: {
            update_rfid_assets: { returning },
          },
        } = await client.mutate({
          mutation: addCashBalance,
          variables,
        });

        if (returning[0]) {
          updateScanState({
            updatingAssets: false,
            success: true,
            currentCashBalance: returning[0].cash_balance,
          });
        } else {
          updateScanState({
            error: "Unable to add cash to wristband at this time",
            updatingAssets: false,
          });
        }
      }
      // onSuccess()
    } catch (error) {
      WriteLog("RfidLookup update balance error " + error);
      console.log("update balance error", JSON.stringify(error));
      if (
        (error.graphQLErrors[0]?.message || "").includes("not found in type")
      ) {
        updateScanState({
          error: "Only users with role of Clerk can add cash balance",
          updatingAssets: false,
        });
      } else {
        updateScanState({
          error: "Unable to add cash to wristband at this time",
          updatingAssets: false,
        });
      }
    }
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onRfidScanResult",
      async (event) => {
        WriteLog("RfidLookup RFID SCAN RESULT" + event);
        console.log("RFID SCAN RESULT", event);
        const regHex = /[0-9A-Fa-f]{6}/g;

        let newEvent;

        if (startsWith(event, "00")) {
          newEvent = event.slice(2);
        }
        if (regHex.test(newEvent) && newEvent.length >= 8) {
          const result = newEvent;

          updateScanState({
            uid: result,
            scanning: false,
          });
          await lookupRFID(result);
        } else {
          WriteLog("RfidLookup RFID RESULT - SET DECLINE");
          console.log("RFID RESULT - SET DECLINE");
          // setPrompt(status.declined);
        }
        regHex.lastIndex = 0; // be sure to reset the index after using .text()
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const scanRFID = async () => {
    try {
      await RoninChipService.callScanRfid();
      setTimeout(() => {
        setScanState((prevState) => ({
          ...prevState,
          // pingScan: prevState.pingScan + 1,
        }));
      }, 900);
    } catch (error) {
      WriteLog("RfidLookup scan called error");
      console.log("scan called error");
    }
  };

  useEffect(() => {
    updateScanState({ scanning: true });
    setTimeout(() => {
      scanRFID();
    }, 900);
  }, []);
  const formatTotals = (t) => (t ? `$${(t / 100).toFixed(2)}` : "$0.00");
  WriteLog("RfidLookup" + { success: success, error: error });
  console.log({ success, error });

  return (
    <Flex
      style={{
        backgroundColor: "rgba(0,0,0,.3)",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {confirmAddCash ? (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            width: "50%",
            height: "85%",
            justifyContent: "center",

            paddingHorizontal: NormalisedSizes(40),
            paddingVertical: "15%",
          }}
        >
          {success ? (
            <Block
              flexDirection="column"
              style={{ height: 200, alignItems: "center" }}
            >
              <Heading variants="h2">New Balance</Heading>
              <Heading variants="h1" style={{ marginTop: 15 }}>
                {`$${currentCashBalance / 100}`}
              </Heading>
            </Block>
          ) : error ? (
            <Block
              flexDirection="column"
              style={{ height: 200, alignItems: "center" }}
            >
              <Heading variants="h2" style={{ textAlign: "center" }}>
                {error}
              </Heading>
            </Block>
          ) : (
            <Block
              flexDirection="column"
              style={{
                height: 360,
                alignItems: "center",
                // justifyContent: "flex-start",
              }}
            >
              {updatingAssets ? (
                <>
                  <Heading variants="h3">Updating Wristband</Heading>
                  <Spinner />
                </>
              ) : (
                <>
                  <Heading variants="h2" style={{ marginTop: 5 }}>
                    {`UID #: ${uid}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 20 }}>
                    {`Card Linked: ${linkStatus}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 5 }}>
                    {`PIN #: ${maskedPin}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 5 }}>
                    {`Current Cash Balance: ${formatTotals(
                      currentCashBalance
                    )}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 5 }}>
                    {`Current Promo Balance: ${formatTotals(
                      currentPromoBalance
                    )}`}
                  </Heading>

                  <View variants="h3" style={{ marginTop: 5 }}>
                    {formatTokensBalanceDisplay(currentTokenBalance)}
                  </View>
                </>
              )}
            </Block>
          )}
          <Row style={{ alignItems: "baseline", marginTop: 10 }}>
            {!success && (
              <View style={styles.sameWidth}>
                <ButtonExtended
                  status="secondary"
                  size="giant"
                  appearance="filled"
                  onPress={() => {
                    updateScanState({ confirmAddCash: false });
                    success ? onSuccess() : closeModal();
                  }}
                >
                  <Label variants="label" variantStyle="uppercaseBold">
                    Close
                  </Label>
                </ButtonExtended>
              </View>
            )}
          </Row>
        </Box>
      ) : (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            width: "50%",
            height: "50%",
            justifyContent: "center",
            paddingHorizontal: NormalisedSizes(40),
            paddingTop: enterManuallyRFID ? "16%" : "20%",
            paddingBottom: "20%",
          }}
        >
          {success && (
            <Block flexDirection="column">
              <CheckmarkCircleIcon
                width={100}
                height={100}
                fill={`${theme["color-success-500"]}`}
              />
              <Heading variants="h2">
                {`Succesfully added $${cashTotal} to Wristband`}
              </Heading>
            </Block>
          )}
          {!success && (
            <Block flexDirection="column" style={{ height: 150 }}>
              <Heading variants="h2">
                {updatingAssets
                  ? "Adding money to user's wristband"
                  : enterManuallyRFID
                  ? "Enter Manually RFID"
                  : "Please Tap Wristband"}
              </Heading>
              {updatingAssets && <Spinner />}
            </Block>
          )}
          {enterManuallyRFID && (
            <Input
              textTransform="uppercase"
              keyboardType="default"
              disableFullscreenUI
              autoFocus
              // secureTextEntry
              value={rfidValue}
              // onChange={(value) => setPin(value)}
              onChangeText={(text) => {
                setRfidValue(text);
              }}
              placeholder="RFID"
              onSubmitEditing={() => {
                if (rfidValue !== "") {
                  lookupRFID(rfidValue);
                } else {
                  alert("Please Enter Wristband RFID");
                }
              }}
              maxLength={20}
              size="large"
              textStyle={{
                fontSize: NormalisedFonts(21),
                lineHeight: NormalisedFonts(30),
                fontWeight: "400",
                // width: "50%",
                fontFamily: "OpenSans-Regular",
              }}
              style={{ bottom: 80, width: "95%" }}
            />
          )}

          <ButtonExtended
            style={[
              styles.button,
              { marginBottom: 10, marginHorizontal: 10, width: "95%" },
            ]}
            onPress={() => {
              if (enterManuallyRFID) {
                if (rfidValue !== "") {
                  lookupRFID(rfidValue);
                } else {
                  alert("Please Enter Wristband RFID");
                }
              } else {
                setEnterManuallyRFID(true);
              }
            }}
            status="primary"
            size="giant"
          >
            <Label
              buttonLabel="none"
              variants="label"
              variantStyle="uppercaseBold"
            >
              {!enterManuallyRFID ? "Enter Manually" : "Submit"}
            </Label>
          </ButtonExtended>

          <Row style={[styles.marginVertical, { width: "100%" }]}>
            <View style={styles.sameWidth}>
              <ButtonExtended
                style={styles.button}
                onPress={() => {
                  closeModal();
                }}
                status={"secondary"}
                size="giant"
              >
                <Label
                  buttonLabel="none"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  Cancel
                </Label>
              </ButtonExtended>
            </View>
          </Row>
        </Box>
      )}
    </Flex>
  );
}

function RFIDLookupWithPassword() {
  const { organizerUser } = useAuth();
  const accessCode = organizerUser?.tablet_access_code;
  const [password, setPassword] = React.useState("");
  const [showAddCash, setShowAddCash] = React.useState("");

  const theme = useTheme();
  const styles = StyleSheet.create({
    calcWrapper: {
      height: "100%",
      paddingLeft: 30,
      paddingRight: 30,
      width: SCREEN_WIDTH - 100,
      // borderWidth: 2
    },
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

  if (showAddCash) {
    return <CashCalculator />;
  }

  return (
    <Box level="1" width="100%" style={styles.prompt}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Flex style={styles.validateFlex}>
          <Block style={styles.heading}>
            <Heading variants="h2">Please Enter Organizer Access Code.</Heading>
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
                setShowAddCash(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("RfidLookup Invalid Pin, Please try again.");
                      console.log("Invalid Pin, Please try again.");
                    },
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
                setShowAddCash(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("RfidLookup Invalid Pin, Please try again.");
                      console.log("Invalid Pin, Please try again.");
                    },
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
}

export default RFIDLookupWithPassword;
