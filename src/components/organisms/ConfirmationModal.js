import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, Card, Input, Modal, Spinner } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { BoxShadow } from "react-native-shadow";
import { useDispatch } from "../../contexts/CartContext";
import { useDispatch as useCustomDispatch } from "../../contexts/CustomItemsProvider";
import { DiscountContext } from "../../contexts/DiscountContext";
import { AuthContext, useAuth } from "../../contexts/AuthContext";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import {
  GetBackTitle,
  GetButtonText,
  GetConfirmationMessage,
  GetReturnRoute,
} from "../../helpers/GetRouteStrings";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";
import { ButtonExtended } from "../atoms/Button/Button";
import { CloseIcon } from "../atoms/Icons/Icons";
import { Heading, Paragraph } from "../atoms/Text";
import { Label } from "../atoms/Text/Label";
import Row from "../particles/Row";
import ACModule from "../../../src/services/ACService";
import { Flex } from "../layouts/flex";
import { Block } from "../layouts/block";
import { Box } from "../layouts/BoxContainer";
import { KEY_NAME, SCREEN_NAME, SYNC_STATUS_VERIFY } from "../../helpers/constants";
import { deleteCachedItem, getCachedItem } from "../../helpers/storeData";

const shadowOpt = {
  width: NormalisedSizes(423),
  height: NormalisedSizes(334),
  color: "#000",
  border: NormalisedSizes(24),
  radius: NormalisedSizes(8),
  opacity: 0.13,
  x: NormalisedSizes(1),
  y: NormalisedSizes(8),
};

export function ConfirmationModal({
  actionType,
  visible,
  setVisible,
  fromOverflow,
  orderTotal,
  voidTransaction,
  refundOrderLoading,
  customTip,
  handleNumPad,
}) {
  const navigation = useNavigation();
  const database = useDatabase();
  const route = useRoute();
  const { setIsDiscounted, setSelectedDiscount, setPreviousIndex } =
    useContext(DiscountContext);

  const [loadingValue, setLoadingValue] = useState(false);
  const [openPinModal, setOpenPinModal] = useState(false);
  const [password, setPassword] = React.useState("");

  const {
    syncLocationsMenusMenuItems,
    employeeUser,
    organizerUser,
    menuDisplayRefresh,
    setMenuDisplayRefresh,
    tabletSelections: { event: selectedEvent },
  } = useContext(AuthContext);
  const event_passcode = selectedEvent?.event_passcode;
  const dispatch = useDispatch();
  const customDispatch = useCustomDispatch();

  // useEffect(() => {
  //   if (!loadingAuth) {
  //     setVisible(false);
  //   }
  // }, [loadingAuth]);

  const clearCart = () => {
    dispatch({ type: "DELETE_ORDER" });
  };

  const clearCustomItems = () => {
    customDispatch({ type: "DELETE_PRODUCTS" });
  };
  const { clearOrganizerUser, signOutEmployee } = useAuth();

  const resetMenuItem = async () => {
    const menuItems = await database.collections
      .get("menuItems")
      .query(Q.where("is_favorite", true))
      .fetch();
    await database.write(async () => {
      menuItems.map(async (mapItem) => {
        await mapItem.update((item) => {
          item.is_favorite = false;
          return item;
        });
      });
    });
  };


  const refreshLocationMenu = async () => {
    setLoadingValue(true);
    await deleteCachedItem(KEY_NAME.LOCATIONS_SYNC);
    await deleteCachedItem(KEY_NAME.MENUS_SYNC);
    await deleteCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
    await deleteCachedItem(KEY_NAME.DISCOUNTS_SYNC);

    await syncLocationsMenusMenuItems(selectedEvent?.eventId, false, true); //2nd boolean argument for Attendees and RFID Sync, 3rd boolean argument for Discount Sync
    let syncStatus = false;

    const fetchData = async () => {
      const locations = await getCachedItem(KEY_NAME.LOCATIONS_SYNC);
      const menus = await getCachedItem(KEY_NAME.MENUS_SYNC);
      const menuItems = await getCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
      const discounts = await getCachedItem(KEY_NAME.DISCOUNTS_SYNC);
      if (locations?.item !== null && menus?.item !== null && menuItems?.item !== null && discounts?.item !== null) {
        syncStatus = false;
      } else {
        syncStatus = true;
      }
    };

    const intervalId = setInterval(() => {
      if (syncStatus) {
        fetchData();
      } else {
        setVisible(false);
        setLoadingValue(false)
        setMenuDisplayRefresh(menuDisplayRefresh + 1)
        clearInterval(intervalId);
      }
    }, SYNC_STATUS_VERIFY);
  };


  const handleBackNavigation = async () => {
    if (route) {
      if (route.name === "Menu" && actionType === "referesh") {
        refreshLocationMenu();
      } else if (route.name === "Menu" && actionType === "reLaunchApp") {
        clearOrganizerUser();
        setTimeout(() => {
          ACModule.reLaunchApp();
        }, 500);
        navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
      } else if (route.name === "OrderHistory" || route.name === "AdminPanel") {
        if (actionType === "voidAction") {
          voidTransaction();
        }
      } else if (
        route.name === "TipStepRfid" ||
        route.name === "TipStepQRCode" ||
        route.name === "TipStepCredit"
      ) {
        handleNumPad();
      } else {
        if (!route || GetBackTitle(route) === "Back") {
          navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
          setVisible(false);
        }
        if (
          route.name === "UserLogin" ||
          route.name === "OrganizerConfig" ||
          fromOverflow
        ) {
          if (actionType === "reLaunchApp") {
            clearOrganizerUser();
            setTimeout(() => {
              ACModule.reLaunchApp();
            }, 500);
            setVisible(false);
            navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
          } else {
            console.log("@@====selectedEvent?.is_org_logout_protected=======", selectedEvent?.is_org_logout_protected)
            if (selectedEvent?.is_org_logout_protected) {
              setOpenPinModal(true);
            } else {
              clearOrganizerUser();
              navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
            }
          }
        }

        if (route.name === "PosConfig") {
          if (actionType === "reLaunchApp") {
            clearOrganizerUser();
            setTimeout(() => {
              ACModule.reLaunchApp();
            }, 500);
            navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
          } else {
            console.log("@@====selectedEvent?.is_clerk_logout_protected=======", selectedEvent?.is_clerk_logout_protected)
            if (selectedEvent?.is_clerk_logout_protected) {
              setPassword("");
              setOpenPinModal(true);
            } else {
              signOutEmployee();
              setVisible(false);
              navigation.navigate(SCREEN_NAME.USER_LOGIN);
            }
          }
        }
        if (route.name === "EditOrder") {
          setVisible(false);
          setIsDiscounted(false);
          setSelectedDiscount(null);
          setPreviousIndex(null);
        }
        if (route.name === "Menu") {
          setVisible(false);
          resetMenuItem();
          clearCart();
          clearCustomItems();
          await deleteCachedItem(KEY_NAME.SELECTED_LOCATION);
          await deleteCachedItem(KEY_NAME.SELECTED_MENU);
          navigation.navigate(SCREEN_NAME.POS_CONFIG);
        }
      }
    }
  };

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => setVisible(false)}
    >
      <>
        {!openPinModal ? (
          <View style={styles.container}>
            <BoxShadow setting={shadowOpt}>
              <Card
                disabled
                style={[
                  styles.cardStyle,
                  {
                    width: openPinModal
                      ? NormalisedSizes(700)
                      : NormalisedSizes(423),
                    height: openPinModal
                      ? NormalisedSizes(500)
                      : NormalisedSizes(334),
                  },
                ]}
              >
                <Row style={styles.headerRow}>
                  <Button
                    appearance="ghost"
                    status="basic"
                    size="medium"
                    accessoryLeft={CloseIcon}
                    onPress={() => setVisible(false)}
                    style={{
                      position: "absolute",
                      left: "-7.5%",
                    }}
                  />
                  <Heading variants="h4">Confirmation</Heading>
                </Row>
                <Row style={{ marginVertical: NormalisedSizes(56) }}>
                  <Paragraph
                    variants="p1"
                    variantStyle="bold"
                    style={{
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    {GetConfirmationMessage(
                      route,
                      actionType,
                      orderTotal,
                      customTip
                    )}
                  </Paragraph>
                </Row>
                <Row
                  style={{
                    justifyContent: "center",
                    height: NormalisedSizes(72),
                  }}
                >
                  <ButtonExtended
                    size="medium"
                    status="secondary"
                    style={styles.confirmationButtonBlock}
                    onPress={() => setVisible(false)}
                  >
                    <Label
                      buttonLabel="LabelLargeBtn"
                      variants="label"
                      variantStyle="uppercaseBold"
                    >
                      {route.name === "TipStepRfid" ||
                        route.name === "TipStepQRCode" ||
                        route.name === "TipStepCredit"
                        ? "NO"
                        : "CANCEL"}
                    </Label>
                  </ButtonExtended>
                  {route.name === "OrderHistory" &&
                    actionType === "voidAction" ? (
                    refundOrderLoading ? (
                      <ButtonExtended
                        status="basic"
                        size="medium"
                        style={styles.confirmationButtonBlock}
                      >
                        <Label
                          buttonLabel="LabelGiantBtn"
                          variants="label"
                          variantStyle="uppercaseBold"
                        >
                          <Spinner />
                        </Label>
                      </ButtonExtended>
                    ) : (
                      <ButtonExtended
                        size="medium"
                        status="primary"
                        style={styles.confirmationButtonBlock}
                        onPress={handleBackNavigation}
                      >
                        <Label
                          buttonLabel="LabelLargeBtn"
                          variants="label"
                          variantStyle="uppercaseBold"
                        >
                          {GetButtonText(route, actionType)}
                        </Label>
                      </ButtonExtended>
                    )
                  ) : loadingValue ? (
                    <ButtonExtended
                      status="basic"
                      size="medium"
                      style={styles.confirmationButtonBlock}
                    >
                      <Label
                        buttonLabel="LabelGiantBtn"
                        variants="label"
                        variantStyle="uppercaseBold"
                      >
                        <Spinner />
                      </Label>
                    </ButtonExtended>
                  ) : (
                    <ButtonExtended
                      size="medium"
                      status={
                        route.name === "TipStepRfid" ||
                          route.name === "TipStepQRCode" ||
                          route.name === "TipStepCredit"
                          ? "tertiary"
                          : "primary"
                      }
                      style={styles.confirmationButtonBlock}
                      onPress={handleBackNavigation}
                    >
                      <Label
                        buttonLabel="LabelLargeBtn"
                        variants="label"
                        variantStyle="uppercaseBold"
                      >
                        {GetButtonText(route, actionType)}
                      </Label>
                    </ButtonExtended>
                  )}
                </Row>
              </Card>
            </BoxShadow>
          </View>
        ) : (
          <Block width="100%" height="100%">
            <Box level="1" style={styles.prompt} width="100%">
              <ScrollView
                style={styles.scrollViewStyle}
                showsVerticalScrollIndicator={false}
              >
                <Flex style={styles.validateFlex}>
                  <Block style={styles.heading}>
                    <Heading variants="h2">
                      Please enter your 5-digit PIN.
                    </Heading>
                  </Block>
                  <Input
                    keyboardType="number-pad"
                    disableFullscreenUI
                    autoFocus
                    secureTextEntry
                    value={password}
                    //onChange={(value) => setPin(value)}
                    onChangeText={(text) => {
                      setPassword(text);
                    }}
                    placeholder="PIN"
                    onSubmitEditing={() => {
                      console.log("@@=======employeeUser.tablet_access_code=========", employeeUser)
                      if (route.name === "PosConfig") {
                        if (
                          password.toString() == organizerUser.tablet_access_code
                        ) {
                          signOutEmployee();
                          setVisible(false);
                          setOpenPinModal(false);
                          setPassword("");
                          navigation.navigate(SCREEN_NAME.USER_LOGIN);
                        } else {
                          Alert.alert("", `Invalid Pin, Please try again.`, [
                            {
                              text: "Close",
                              onPress: () => {
                                setPassword("");
                              },
                            },
                          ]);
                        }
                      } else {
                        console.log("@@=======organizerUser.tablet_access_code=========", organizerUser)
                        if (
                          password.toString() ==
                          organizerUser.tablet_access_code
                        ) {
                          clearOrganizerUser();
                          setOpenPinModal(false);
                          setPassword("");
                          navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
                        } else {
                          Alert.alert("", `Invalid Pin, Please try again.`, [
                            {
                              text: "Close",
                              onPress: () => {
                                setPassword("");
                              },
                            },
                          ]);
                        }
                      }
                    }}
                    maxLength={5}
                    size="large"
                    textStyle={styles.inputeStyle}
                  />
                </Flex>
                <Flex
                  flexDirection="column"
                  alignItems="center"
                  style={styles.buttonFlex}
                >
                  <Block width="80%" style={styles.buttonBlock}>
                    <ButtonExtended
                      onPress={() => {
                        if (route.name === "PosConfig") {
                          if (
                            password.toString() ==
                            employeeUser.tablet_access_code
                          ) {
                            signOutEmployee();
                            setVisible(false);
                            setOpenPinModal(false);
                            navigation.navigate(SCREEN_NAME.USER_LOGIN);
                          } else {
                            Alert.alert("", `Invalid Pin, Please try again.`, [
                              {
                                text: "Close",
                                onPress: () => {
                                  setVisible(false);
                                  setOpenPinModal(false);
                                  setPassword("");
                                },
                              },
                            ]);
                          }
                        } else {
                          if (
                            password.toString() ==
                            organizerUser.tablet_access_code
                          ) {
                            clearOrganizerUser();
                            setOpenPinModal(false);
                            navigation.replace(SCREEN_NAME.COMPANY_LOGIN);
                          } else {
                            Alert.alert("", `Invalid Pin, Please try again.`, [
                              {
                                text: "Close",
                                onPress: () => {
                                  setVisible(false);
                                  setOpenPinModal(false);
                                  setPassword("");
                                },
                              },
                            ]);
                          }
                        }
                      }}
                      size="giant"
                      disabled={false}
                    >
                      <Label buttonLabel="LabelGiantBtn">Confirm</Label>
                    </ButtonExtended>
                  </Block>
                  <Block width="80%" style={styles.buttonBlock}>
                    <ButtonExtended
                      status="tertiary"
                      onPress={() => {
                        setVisible(false);
                        setOpenPinModal(false);
                        setPassword("");
                        setPassword("");
                      }}
                      size="giant"
                    >
                      <Label buttonLabel="LabelGiantBtn">Cancel</Label>
                    </ButtonExtended>
                  </Block>
                </Flex>
              </ScrollView>
            </Box>
          </Block>
        )}
      </>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    marginVertical: 40,
  },
  validateFlex: {
    alignItems: "center",
    padding: 10,
    flexDirection: "column",
    marginVertical: 30,
    width: "50%",
    alignSelf: "center",
  },
  prompt: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 30,
    width: "100%",
    marginTop: NormalisedSizes(70),
  },
  scrollViewStyle: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: NormalisedSizes(600),
  },
  inputeStyle: {
    fontSize: NormalisedFonts(21),
    lineHeight: NormalisedFonts(30),
    fontWeight: "400",
    width: "50%",
    fontFamily: "OpenSans-Regular",
  },
  buttonFlex: {
    alignItems: "center",
    flexDirection: "column",
    width: "60%",
    alignSelf: "center",
  },
  buttonBlock: {
    marginTop: NormalisedSizes(16),
    marginBottom: NormalisedSizes(32),
  },
  cardStyle: {
    borderRadius: NormalisedSizes(8),
    borderWidth: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationButtonBlock: { width: NormalisedSizes(184), marginHorizontal: 5 },
});
