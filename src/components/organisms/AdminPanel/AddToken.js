import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  DeviceEventEmitter,
  Alert,
} from "react-native";
import { Box } from "../../../components/layouts/BoxContainer";
import AddTokenDropDown from "../AddTokenDropDown/AddTokenDropDown";
import { Heading, Label } from "../../../components/atoms/Text";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { Button, Input, Spinner, useTheme } from "@ui-kitten/components";
import { ButtonExtended } from "../../../components/atoms/Button/Button";
import { Block } from "../../../components/layouts/block";
import { Flex } from "../../../components/layouts/flex";
import Row from "../../../components/particles/Row";
import {
  GET_EVENT_TOKEN_DATA,
  LOOKUP_RFID,
  UPDATE_TOKEN_BALANCE,
} from "../../../fragments/resolvers";
import { useAuth } from "../../../contexts/AuthContext";
import { useApolloClient } from "@apollo/client";
import RoninChipService from "../../../services/RoninChipService";
import { startsWith } from "lodash";
import { WriteLog } from "../../../../src/CommonLogFile";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Q } from "@nozbe/watermelondb";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

export default function AddToken() {
  const database = useDatabase();
  const theme = useTheme();
  const client = useApolloClient();
  const {
    tabletSelections: { event: selectedEvent },
    organizerUser,
  } = useAuth();
  const accessCode = organizerUser?.tablet_access_code;
  const formatTotals = (t) => (t ? `$${(t / 100).toFixed(2)}` : "$0.00");
  const [selectToken, setSelectToken] = useState("");
  const [tokenArray, setTokenArray] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [showWristbandModal, setShowWristbandModal] = useState(false);
  const [password, setPassword] = React.useState("");
  const [showAddToken, setShowAddToken] = useState(false);

  const [
    {
      uid,
      scanning,
      error,
      pingScan,
      updateTokenBalance,
      success,
      confirmAddToken,
      currentCashBalance,
      currentPromoBalance,
      currentTokenBalance,
      tokens_balance,
      currentLinkStatus,
      currentLast4PhoneNumber,
      id,
      rfidCreated,
    },
    setScanState,
  ] = React.useState({
    uid: null,
    scanning: false,
    updateTokenBalance: false,
    confirmAddToken: false,
    error: null,
    pingScan: 0,
    success: null,
    currentCashBalance: 0,
    currentPromoBalance: 0,
    currentTokenBalance: null,
    tokens_balance: [],
    currentLinkStatus: null,
    currentLast4PhoneNumber: null,
    id,
    rfidCreated: false,
  });

  const updateScanState = (newState) => {
    setScanState((prevState) => ({ ...prevState, ...newState }));
  };

  useEffect(() => {
    getEventTokens();
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onRfidScanResult",
      async (event) => {
        const regHex = /[0-9A-Fa-f]{6}/g;
        let newEvent;
        if (startsWith(event, "00")) {
          newEvent = event.slice(2);
        }
        if (regHex.test(newEvent) && newEvent.length >= 8) {
          const result = newEvent;
          await lookupRFID(result);
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
      WriteLog("AddToken scan called error");
      console.log("scan called error");
    }
  };

  useEffect(() => {
    updateScanState({ scanning: true });
    setTimeout(() => {
      if (showWristbandModal) {
        scanRFID();
      }
    }, 900);
  }, [showWristbandModal]);

  const getEventTokens = async () => {
    try {
      let eventId = selectedEvent?.eventId;
      //console.log("@@======eventId======", eventId)
      // let availableTokens = await client.query({
      //   query: GET_EVENT_TOKEN_DATA,
      //   variables: {
      //     event_id: eventId,
      //   },
      // });

      let eventTokens = await database.collections.get("events").query(Q.where("event_id", eventId)).fetch();

      //console.log("@@===availableTokens====", eventTokens[0]._raw.available_tokens);

      // let final_token_array = [];
      // availableTokens?.data.events[0]?.available_tokens?.map((tokenItem) => {
      //   final_token_array.push({
      //     balance: 0,
      //     name: tokenItem,
      //     redeemable_token_id: tokenItem,
      //     redeemable_token_name: tokenItem,
      //   });
      // });

      setTokenArray(JSON.parse(eventTokens[0]._raw.available_tokens));
      //setTokenArray(availableTokens?.data.events[0]?.available_tokens);
    } catch (error) {
      WriteLog("AddToken error" + error);
      console.log("error ::", error);
    }
  };

  const lookupRFID = async (result) => {
    try {
      const {
        data: { rfid_assets_by_pk },
      } = await client.mutate({
        mutation: LOOKUP_RFID,
        variables: { eventId: selectedEvent.eventId, uid: result },
      });

      updateScanState({
        confirmAddToken: true,
        scanning: false,
        uid: rfid_assets_by_pk.uid,
        currentCashBalance: rfid_assets_by_pk?.cash_balance || 0,
        currentPromoBalance: rfid_assets_by_pk?.promo_balance || 0,
        currentTokenBalance: rfid_assets_by_pk?.tokens_balance || {},
        currentLinkStatus: rfid_assets_by_pk?.is_active || null,
        tokens_balance: rfid_assets_by_pk.tokens_balance || {},
        id: rfid_assets_by_pk.id,
        currentLast4PhoneNumber:
          rfid_assets_by_pk?.last_four_phone_numbers || null,
        rfidCreated: !!rfid_assets_by_pk?.id,
      });
    } catch (error) {
      WriteLog("AddToken error" + error);
      console.log("error ::::::", { error });
    }
  };

  const onUpdateTokenBalance = async () => {
    try {
      let exist = false;
      if (Object.keys(tokens_balance).length > 0) {
        Object.keys(tokens_balance).map((t) => {
          const token = tokens_balance[t];
          if (token.redeemable_token_id === selectToken) {
            exist = true;
            tokens_balance[t].balance =
              parseInt(token.balance) + parseInt(quantity);
          }
        });
      }

      let updated_token_balance;
      if (!exist) {
        let newKey = selectToken;
        let new_object = {
          [newKey]: {
            balance: quantity,
            redeemable_token_id: selectToken,
            redeemable_token_name: selectToken,
          },
        };

        updated_token_balance = { ...tokens_balance, ...new_object };
      } else {
        updated_token_balance = tokens_balance;
      }

      await client.mutate({
        mutation: UPDATE_TOKEN_BALANCE,
        variables: {
          event_id: selectedEvent.eventId,
          uid: uid,
          input: { tokens_balance: updated_token_balance },
        },
      });

      try {
        let record = await database.collections
          .get("rfid_assets")
          .query(Q.where("uid", uid))
          .fetch();
        await database.action(async () => {
          await record[0].update((record) => {
            record.tokens_balance = updated_token_balance;
          });
        });
      } catch (error) {
        console.log("error rfid_assets:::", error);
      }

      updateScanState({
        success: true,
        tokens_balance: updated_token_balance,
      });
    } catch (error) {
      WriteLog("AddToken update token error" + error);
      console.log("update token error ::", error);
      updateScanState({ updateTokenBalance: false });
    }
  };

  const tokentotalBalance = (tokens_balance) => {
    if (Object.keys(tokens_balance).length > 0) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Heading variants="h2" style={{ marginTop: 10 }}>
            Token Balance :
          </Heading>
          <View
            style={{
              marginTop: 10,
              marginLeft: 5,
            }}
          >
            {Object.keys(tokens_balance).map((t) => {
              const token = tokens_balance[t];
              if (token.redeemable_token_id === selectToken) {
                return <Heading variants="h2">{token.balance}</Heading>;
              }
            })}
          </View>
        </View>
      );
    }
    return null;
  };


  const TokenBalance = () => {
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
        {!confirmAddToken ? (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              width: "50%",
              height: "70%",
              justifyContent: "center",
              paddingHorizontal: NormalisedSizes(40),
              paddingVertical: "15%",
            }}
          >
            <Block
              flexDirection="column"
              style={{ height: 200, alignItems: "center" }}
            >
              <Heading variants="h2" style={{ marginTop: 20 }}>
                Please Tap Wristband
              </Heading>
            </Block>
            <Row style={styles.marginVertical}>
              <View style={{ flex: 1 }}>
                <ButtonExtended
                  style={styles.button}
                  onPress={() => {
                    {
                      setShowWristbandModal(false);
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
                    Cancel
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
                <Heading variants="h2">New Token Balance</Heading>
                <Heading variants="h1" style={{ marginTop: 15 }}>
                  {selectToken}
                </Heading>
                <Heading variants="h1" style={{ marginTop: 5 }}>
                  {tokentotalBalance(tokens_balance)}
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
                }}
              >
                {updateTokenBalance ? (
                  <>
                    <Heading variants="h3">Updating Wristband</Heading>
                    <Spinner />
                  </>
                ) : (
                  <>
                    <Heading variants="h2" style={{ marginTop: 5 }}>
                      {`Add  ${selectToken}`}
                    </Heading>
                    <Heading variants="h2" style={{ marginTop: 5 }}>
                      Balance : {quantity}
                    </Heading>
                    <Heading variants="h2" style={{ marginTop: 20 }}>
                      to wristband?
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

                    <View
                      style={{
                        height: 100,
                        alignItems: "center",
                      }}
                    >
                      <Heading variants="h3" style={{ marginTop: 5 }}>
                        Token Balance:
                      </Heading>
                      <View
                        style={{
                          flex: 1,
                          height: NormalisedSizes(70),
                          flexDirection: "row",
                          alignSelf: "center",
                        }}
                      >
                        <ScrollView>
                          {Object.keys(tokens_balance).map((t) => {
                            const token = tokens_balance[t];
                            return (
                              <Heading
                                variants="h4"
                                style={{ alignSelf: "center" }}
                              >{` ${token?.redeemable_token_name || t} - ${token.balance
                                }`}</Heading>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  </>
                )}
              </Block>
            )}
            <Row style={{ alignItems: "baseline", marginTop: 10 }}>
              {!success ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    // alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ marginRight: 10, flex: 1 }}>
                    <ButtonExtended
                      status="secondary"
                      size="giant"
                      appearance="filled"
                      onPress={() => {
                        updateScanState({ confirmAddToken: false });
                        setShowWristbandModal(false);
                      }}
                    >
                      <Label variants="label" variantStyle="uppercaseBold">
                        Close
                      </Label>
                    </ButtonExtended>
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <ButtonExtended
                      status="primary"
                      size="giant"
                      appearance="filled"
                      onPress={() => {
                        onUpdateTokenBalance();
                      }}
                    >
                      <Label variants="label" variantStyle="uppercaseBold">
                        Confirm
                      </Label>
                    </ButtonExtended>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    // alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ marginLeft: 25, flex: 1 }}>
                    <ButtonExtended
                      status="primary"
                      size="giant"
                      appearance="filled"
                      onPress={() => {
                        updateScanState({
                          confirm: false,
                          updateTokenBalance: false,
                          success: false,
                        });
                        setShowWristbandModal(false);
                        setQuantity("");
                        setSelectToken("");
                      }}
                    >
                      <Label variants="label" variantStyle="uppercaseBold">
                        Start new Token balance
                      </Label>
                    </ButtonExtended>
                  </View>
                </View>
              )}
            </Row>
          </Box>
        )}
      </Flex>
    );
  };

  const AddTokenComp = () => {
    return (
      <Box level="1" width="100%" style={styles.prompt}>
        <View style={{ width: NormalisedSizes(490) }}>
          <Label
            variantStyle="uppercaseBold"
            style={[
              styles.heading,
              {
                color: theme["color-basic-800"],
                marginTop: -30,
                alignSelf: "center",
              },
            ]}
          >
            Add Token Balance
          </Label>

          <AddTokenDropDown
            tokenData={tokenArray}
            setSelectToken={(tokenType) => {
              WriteLog("AddToken tokenType" + tokenType);
              console.log("tokenType :::", tokenType),
                setSelectToken(tokenArray[tokenType.row]);
            }}
            selectedToken={selectToken}
          />

          <Label
            variantStyle="uppercaseBold"
            style={[
              styles.heading,
              {
                color: theme["color-basic-600"],
                fontSize: NormalisedFonts(20),
                marginTop: 20,
                marginBottom: -10,
                marginVertical: 0,
              },
            ]}
          >
            Enter quantity
          </Label>

          <Input
            placeholder="Enter Quantity"
            size="medium"
            keyboardType="numeric"
            disableFullscreenUI
            textStyle={{
              fontSize: NormalisedFonts(21),
              lineHeight: NormalisedFonts(30),
              fontWeight: "400",
              width: "50%",
              fontFamily: "OpenSans-Regular",
            }}
            style={[
              styles.textInpute,
              { borderColor: theme["color-basic-600"] },
            ]}
            rules={{ required: true }}
            onChangeText={(value) => setQuantity(value)}
            value={quantity}
          />
        </View>

        <ButtonExtended
          onPress={() => {
            setShowWristbandModal(true);
            updateScanState({
              updateTokenBalance: false,
              confirmAddToken: false,
              success: false,
            });
          }}
          size="giant"
          disabled={quantity === "" && selectToken === "" ? true : false}
        >
          <Label buttonLabel="LabelGiantBtn">
            Add Tokens to Users wristband
          </Label>
        </ButtonExtended>
        {showWristbandModal && (
          <Modal
            visible={showWristbandModal}
            transparent
            onBackdropPress={() => setShowWristbandModal(false)}
          >
            <TouchableWithoutFeedback
              onPress={(e) => {
                setShowWristbandModal(false);
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
            <TokenBalance />
          </Modal>
        )}
      </Box>
    );
  };

  if (showAddToken) {
    return <AddTokenComp />;
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
                setShowAddToken(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("AddToken Invalid Pin, Please try again.");
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
                setShowAddToken(true);
              } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                  {
                    text: "Close",
                    onPress: () => {
                      WriteLog("AddToken Invalid Pin, Please try again.");
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

const styles = StyleSheet.create({
  heading: {
    marginVertical: 40,
    fontSize: NormalisedFonts(30),
    lineHeight: NormalisedFonts(30),
  },
  prompt: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  validateFlex: {
    alignItems: "center",
    padding: 10,
    flexDirection: "column",
    marginVertical: 30,
    width: "100%",
    alignSelf: "center",
  },
  textInpute: {
    marginVertical: 20,
    marginBottom: 50,
    borderWidth: 1,
  },
  marginVertical: {
    marginVertical: 10,
  },
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
});
