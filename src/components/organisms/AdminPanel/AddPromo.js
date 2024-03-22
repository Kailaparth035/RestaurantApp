/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */
import { useTheme, Spinner, Button, Input } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
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
  addPromoBalance,
  addRfidAssetWithPromoBalance,
} from "../../../fragments/resolvers";
import { useAuth } from "../../../contexts/AuthContext";
import { WriteLog } from "../../../../src/CommonLogFile";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

function PromoCalculator() {
  const theme = useTheme();
  const [promoTotal, setPromoTotal] = React.useState(0);
  const [showPromoTotal, setShowPromoTotal] = React.useState(0.0);
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
      setShowPromoTotal("$" + JSON.stringify(temp));
    }
  };

  const arrayButtonTenders = [
    { name: "$10", value: "1000" },
    { name: "$20", value: "2000" },
    { name: "$50", value: "5000" },
    { name: "$100", value: "10000" },
  ];

  const buttonGroupTenders = ({ item, index }) => {
    return (
      <Block
        key={index}
        style={{
          marginLeft: index >= 1 ? NormalisedSizes(40) : 0,
          justifyContent: "space-between",
          flex: 1,
        }}
        height={NormalisedSizes(80)}
      >
        <ButtonExtended
          status="tertiary"
          size="large"
          variants="keypad"
          onPress={() => {
            setPromoTotal(item.value);
            formatDisplayTotal(item.value);
          }}
        >
          <Label
            buttonLabel="none"
            variants="label"
            variantStyle="uppercaseBold"
          >
            {item.name}
          </Label>
        </ButtonExtended>
      </Block>
    );
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
          <AddPromoToWristband
            closeModal={() => setShowTapWristbandModal(false)}
            onSuccess={() => {
              setShowTapWristbandModal(false);
              setPromoTotal("");
              setShowPromoTotal("");
            }}
            promoTotal={promoTotal}
            formattedCashTotal={() => promoTotal} ///formatDisplayTotal
          />
        </Modal>
      )}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Flex style={styles.validateFlex}>
          <Block style={styles.heading}>
            <Heading variants="h2">Enter A Promo Balance Amount Below.</Heading>
          </Block>
          <Input
            keyboardType="numeric"
            disableFullscreenUI
            // autoFocus
            value={showPromoTotal}
            // secureTextEntry
            // onChange={(value) => setPin(value)}
            onChangeText={(text) => {
              if (text.split(".")[1] !== undefined) {
                if (text.split(".")[1].length < 3) {
                  setShowPromoTotal(
                    text
                      .replace(/[^0-9.]/g, "")
                      .replace(".", "x")
                      .replace(/\./g, "")
                      .replace("x", ".")
                  );
                }
              } else {
                setShowPromoTotal(
                  text
                    .replace(/[^0-9.]/g, "")
                    .replace(".", "x")
                    .replace(/\./g, "")
                    .replace("x", ".")
                );
              }
              if (text.split(".")[1] !== undefined) {
                if (text.split(".")[1].length < 3) {
                  setPromoTotal(
                    (
                      text
                        .replace(/[^0-9.]/g, "")
                        .replace(".", "x")
                        .replace(/\./g, "")
                        .replace("x", ".")
                        .replace("$", "") * 100
                    ).toFixed(2)
                  );
                }
              } else {
                setPromoTotal(
                  (
                    text
                      .replace(/[^0-9.]/g, "")
                      .replace(".", "x")
                      .replace(/\./g, "")
                      .replace("x", ".")
                      .replace("$", "") * 100
                  ).toFixed(2)
                );
              }
            }}
            onSubmitEditing={() => {
              setShowPromoTotal(
                "$" +
                  showPromoTotal
                    .replace(/[^0-9.]/g, "")
                    .replace(".", "x")
                    .replace(/\./g, "")
                    .replace("x", ".")
              );
              setPromoTotal(
                (
                  showPromoTotal
                    .replace(/[^0-9.]/g, "")
                    .replace(".", "x")
                    .replace(/\./g, "")
                    .replace("x", ".")
                    .replace("$", "") * 100
                ).toFixed(2)
              );
              if (promoTotal > 0) {
                setShowTapWristbandModal(true);
              } else {
                Alert.alert("", `Please enter proper amount.`, [
                  {
                    text: "Close",
                    onPress: () => {},
                  },
                ]);
              }
            }}
            placeholder="Amount"
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
        <Block style={styles.keypad}>
          <Flex flexDirection="row">
            <FlatList
              data={arrayButtonTenders}
              renderItem={buttonGroupTenders}
              keyExtractor={(item, index) => index}
              numColumns={arrayButtonTenders.length}
            />
          </Flex>
        </Block>
        <Flex>
          <Button
            title="Confirm"
            status="primary"
            size="giant"
            onPress={() => {
              WriteLog("promoTotal" + promoTotal);
              console.log("promoTotal :::", promoTotal);
              if (promoTotal > 0) {
                setShowTapWristbandModal(true);
              } else {
                Alert.alert("", `Please add a value to amount field.`, [
                  {
                    text: "Close",
                    onPress: () => {},
                  },
                ]);
              }
            }}
          >
            Add Promo Balance to Users Wristband
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

function AddPromoToWristband({
  closeModal,
  onSuccess,
  promoTotal,
  formattedCashTotal,
}) {
  const theme = useTheme();

  const client = useApolloClient();
  const {
    employeeUser,
    tabletSelections: { event: selectedEvent, location: selectedLocation },
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
    rfidCreated: false,
  });

  const updateScanState = (newState) => {
    setScanState((prevState) => ({ ...prevState, ...newState }));
  };

  const lookupRFID = async (rfidUID) => {
    try {
      const {
        data: { rfid_assets_by_pk },
      } = await client.mutate({
        mutation: LOOKUP_RFID,
        variables: { eventId: selectedEvent.eventId, uid: rfidUID },
      });

      updateScanState({
        confirmAddCash: true,
        scanning: false,
        currentCashBalance: rfid_assets_by_pk?.cash_balance || 0,
        currentPromoBalance: rfid_assets_by_pk?.promo_balance || 0,
        rfidCreated: !!rfid_assets_by_pk?.id,
      });
    } catch (error) {
      WriteLog("AddPromo" + error);
      console.log({ error });
      updateScanState({
        error: "Unable to add cash to wristband at this time",
      });
    }
  };

  const updateBalance = async () => {
    updateScanState({ updatingAssets: true });

    const formattedPromoBalance = Number.isNaN(Number(currentPromoBalance))
      ? 0
      : Number(currentPromoBalance);
    const formattedCashTotal = Number.isNaN(Number(promoTotal))
      ? 0
      : Number(promoTotal);

    const variables = {
      uid,
      eventId: selectedEvent.eventId,
      locationId: selectedLocation.location_id,
      promoBalance:
        Number(promoTotal) < 1 ? 0 : formattedPromoBalance + formattedCashTotal,
      addedPromo: Number(promoTotal) < 1 ? 0 : formattedCashTotal,
      updatedBy: Number(employeeUser.user_id),
    };

    try {
      if (!rfidCreated) {
        const {
          data: { insert_rfid_assets_one },
        } = await client.mutate({
          mutation: addRfidAssetWithPromoBalance,
          variables,
        });

        if (insert_rfid_assets_one) {
          updateScanState({
            updatingAssets: false,
            success: true,
            currentPromoBalance: insert_rfid_assets_one.promo_balance,
          });
        }
      } else {
        const {
          data: {
            update_rfid_assets: { returning },
          },
        } = await client.mutate({
          mutation: addPromoBalance,
          variables,
        });

        if (returning[0]) {
          updateScanState({
            updatingAssets: false,
            success: true,
            currentPromoBalance: returning[0].promo_balance,
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
      WriteLog("AddPromo update balance error" + error);
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
        WriteLog("AddPromo RFID SCAN RESULT" + event);
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
          lookupRFID(result);
        } else {
          WriteLog("RFID RESULT - SET DECLINE");
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
      WriteLog("scan called error");
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
  WriteLog("AddPromo" + { success: success, error: error });
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
              <Heading variants="h2">New Promo Balance</Heading>
              <Heading variants="h1" style={{ marginTop: 15 }}>
                {`${formatTotals(currentPromoBalance)}`}
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
                height: 250,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {updatingAssets ? (
                <>
                  <Heading variants="h2">Updating Wristband</Heading>
                  <Spinner />
                </>
              ) : (
                <>
                  <Heading variants="h2" style={{ marginTop: 5 }}>
                    Add
                  </Heading>
                  <Heading variants="h1" style={{ marginTop: 10 }}>
                    {`${formatTotals(promoTotal)}`}
                  </Heading>
                  <Heading variants="h2" style={{ marginTop: 10 }}>
                    to wristband?
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 20 }}>
                    {`Current Cash Balance: ${formatTotals(
                      currentCashBalance
                    )}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 5 }}>
                    {`Current Promo Balance: ${formatTotals(
                      currentPromoBalance
                    )}`}
                  </Heading>
                  <Heading variants="h3" style={{ marginTop: 5 }}>
                    {`UID #: ${uid}`}
                  </Heading>
                </>
              )}
            </Block>
          )}
          <Row style={styles.marginVertical}>
            {!success && (
              <View style={styles.sameWidth}>
                <ButtonExtended
                  status="secondary"
                  size="giant"
                  appearance="filled"
                  onPress={() => {
                    updateScanState({ confirmAddCash: false });
                  }}
                >
                  <Label variants="label" variantStyle="uppercaseBold">
                    cancel
                  </Label>
                </ButtonExtended>
              </View>
            )}
            <View style={styles.sameWidth}>
              <ButtonExtended
                style={styles.button}
                onPress={() => {
                  if (error) {
                    updateScanState({
                      updatingAssets: false,
                      success: false,
                      confirmAddCash: false,
                      error: "",
                    });
                  } else {
                    success ? onSuccess() : updateBalance();
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
                  {error ? "Go Back" : success ? "Start New Order " : "Confirm"}
                </Label>
              </ButtonExtended>
            </View>
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
            paddingVertical: "20%",
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
                {`Succesfully added $${promoTotal} to Wristband`}
              </Heading>
            </Block>
          )}
          {!success && (
            <Block flexDirection="column" style={{ height: 150 }}>
              <Heading variants="h2">
                {updatingAssets
                  ? "Adding money to user's wristband"
                  : "Please Tap Wristband"}
              </Heading>
              {updatingAssets && <Spinner />}
            </Block>
          )}
          <Row style={styles.marginVertical}>
            <View style={styles.sameWidth}>
              <ButtonExtended
                style={styles.button}
                onPress={() => {
                  success ? onSuccess() : closeModal();
                }}
                status="primary"
                size="giant"
              >
                <Label
                  buttonLabel="none"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  {success ? "Start New Transaction" : "Cancel"}
                </Label>
              </ButtonExtended>
            </View>
          </Row>
        </Box>
      )}
    </Flex>
  );
}

function AddPromoContainerWithPassword(props) {
  const { organizerUser } = useAuth();
  const accessCode = organizerUser?.tablet_access_code;
  const [password, setPassword] = React.useState("");
  const [showAddPromo, setShowAddPromo] = React.useState("");

  const navigation = useNavigation();

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

  if (showAddPromo) {
    return <PromoCalculator />;
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
                console.log("props:::", props);
                setShowAddPromo(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("AddPromo Invalid Pin, Please try again.");
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
                setShowAddPromo(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("AddPromo Invalid Pin, Please try again.");
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

export default AddPromoContainerWithPassword;
