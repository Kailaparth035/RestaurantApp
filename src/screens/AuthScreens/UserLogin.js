/* eslint-disable no-else-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Icon, Input, Spinner, useTheme } from "@ui-kitten/components";
import { Formik } from "formik";
import { APPCENTER_BUILD_ID } from "@env";
import React, { useState, useEffect, useContext } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { version } from "../../../package.json";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Link } from "../../components/atoms/Link/Link";
import { Caption, Heading, Label } from "../../components/atoms/Text/index";
import { Block, Box, Flex } from "../../components/layouts/Index";
import { ErrorModal } from "../../components/organisms/ErrorModal";
import { AuthContext, useAuth } from "../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";
import { ConfirmationModal } from "../../../src/components/organisms/ConfirmationModal";
import SyncronizeEventModal from "../../../src/components/SyncronizeEventModal";
import { useIsFocused } from "@react-navigation/native";
import { deleteCachedItem, getCachedItem } from "../../helpers/storeData";
import { KEY_NAME, SYNC_STATUS_VERIFY } from "../../helpers/constants";

export function UserLogin({ navigation, route }) {

  const eventName = [
    {
      name: "Location",
      isSync: false,
    },
    {
      name: "Menu",
      isSync: false,
    },
    {
      name: "Items",
      isSync: false,
    },
    {
      name: "Attendees",
      isSync: false,
    },
    {
      name: "Cashless Assets",
      isSync: false,
    },
  ];

  const theme = useTheme();
  const isFocuse = useIsFocused();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSyncProcess, setLoadingSyncProcess] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [isSynchronized, setIsSynchronized] = useState(true);
  const [eventList, setEventList] = useState(eventName);
  
  const syncProcessVerify = async (syncIndex) => {
    const locations = await getCachedItem(KEY_NAME.LOCATIONS_SYNC);
    const menus = await getCachedItem(KEY_NAME.MENUS_SYNC);
    const menuItems = await getCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
    const attendees = await getCachedItem(KEY_NAME.ATTENDEES_SYNC);
    const rfid = await getCachedItem(KEY_NAME.RFID_SYNC);
    switch (syncIndex) {
      case 0:
        return locations.item;
      case 1:
        return menus.item;
      case 2:
        return menuItems.item;
      case 3:
        return attendees.item;
      case 4:
        return rfid.item;
    }
  }

  useEffect(() => {
    setEventList(eventName);
  }, [isFocuse]);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const {
    syncUsersEventsAndDiscount,
    syncLocationsMenusMenuItems,
    tabletSelections: { event: selectedEvent },
  } = useContext(AuthContext);

  const renderIconSecurity = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const renderIconUser = (props) => <Icon {...props} name="person-outline" />;

  const { loginEmployee, setEmployeeUser, syncService, employeeUser } =
    useAuth();
  const database = useDatabase();

  async function handleLogin({ username, password }) {
    setIsLoading(true);
    try {
      const { statusCode, errorMessage } = await loginEmployee({
        username,
        password,
      });
      if (errorMessage) {
        setError(errorMessage);
        setIsLoading(false);
        setVisible(true);
      } else {
        // setIsLoading(false);
        setError("");
        setVisible(false);
        navigateToMenuscreen();
      }
    } catch (error) {
      setError(error.toString());
    }
  }

  const navigateToMenuscreen = async () => {
    const locationResponse = await database.collections
      .get("locations")
      .query(
        Q.where("event_id", Q.eq(selectedEvent.eventId)),
        Q.sortBy("name", Q.asc)
      )
      .fetch();
    let menuData = await database.collections.get("menus").query(Q.sortBy("name", Q.asc)).fetch();

    if (locationResponse.length > 0 && menuData.length > 0) {
      setIsLoading(false);
      navigation.navigate("PosConfig");
    } else {
      setIsLoading(true);
      setTimeout(() => {
        navigateToMenuscreen();
      }, 3000);
    }
  };

  // useEffect(() => {
  //   if (employeeUser.user_id) {
  //     setIsLoading(false);
  //     setError("");
  //     setVisible(false);
  //     // navigateToMenuscreen();
  //   }
  // }, [employeeUser.user_id]);

  const handleBackPress = () => {
    setOpenConfirmationModal(true);
  };

  const refershClerkUsers = async () => {
    setLoadingUsers(true)

    await deleteCachedItem(KEY_NAME.USERS_SYNC);
    await syncUsersEventsAndDiscount(true, false, false); //User, Events, Discounts sync

    let userSyncStatus = false;

    const fetchData = async () => {
      const users = await getCachedItem(KEY_NAME.EVENTS_SYNC);
      if (users?.item !== null) {
        userSyncStatus = false;
      } else {
        userSyncStatus = true;
      }
    };

    const intervalId = setInterval(() => {
      if (userSyncStatus) {
        fetchData();
      } else {
        setLoadingUsers(false)
        clearInterval(intervalId);
      }
    }, SYNC_STATUS_VERIFY);

  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setOpenConfirmationModal(true);
        return true;
      }
    );
  }, []);

  useEffect(() => {
    if (route?.params?.isSynchronized) {
      setIsSynchronized(true);
      let currentIndex = 0;
      const interval = setInterval(async () => {
        if (eventList.length > currentIndex) {
          let syncingStatus = await syncProcessVerify(currentIndex);
          if (syncingStatus === 'true' && (eventList.length - 1) > currentIndex) {
            setEventList((prevEventList) => {
              const updatedList = [...prevEventList];
              updatedList[currentIndex].isSync = true;
              currentIndex++;
              return updatedList;
            });
            //console.log("@@=======currentIndex=======", currentIndex)
          }
        
          const locations = await getCachedItem(KEY_NAME.LOCATIONS_SYNC);
          const menus = await getCachedItem(KEY_NAME.MENUS_SYNC);
          const menuItems = await getCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
          const attendees = await getCachedItem(KEY_NAME.ATTENDEES_SYNC);
          const rfid = await getCachedItem(KEY_NAME.RFID_SYNC);
          //console.log("@@=======attendees=======", attendees?.item)
          //console.log("@@=======rfid=======", rfid?.item)
          if (locations?.item !== null && menus?.item !== null && menuItems?.item !== null && attendees?.item !== null && rfid?.item !== null) {
            setIsSynchronized(false);
            clearInterval(interval);
          }
        }
      }, SYNC_STATUS_VERIFY);
      return () => clearInterval(interval);
    } else {
      setIsSynchronized(false);
    }
  }, [route?.params?.isSynchronized, loadingSyncProcess]);

  return (
    <ScrollView>
      <Box width="100%" height={NormalisedSizes(1028)}>
        <ConfirmationModal
          actionType={""}
          visible={openConfirmationModal}
          setVisible={() => setOpenConfirmationModal(false)}
        />
        {isSynchronized && (
          <View style={styles.synchronizedView}>
            <Text
              style={{
                fontSize: NormalisedSizes(40),
                marginBottom: NormalisedSizes(20),
              }}
            >
              Synchronizing Event
            </Text>
            <FlatList
              data={eventList}
              renderItem={({ item }) => {
                return (
                  <SyncronizeEventModal
                    isSynchronized={item.isSync}
                    eventName={item.name}
                  />
                );
              }}
            />
            <Block
              style={{
                marginBottom: NormalisedSizes(60),
              }}>
              {loadingSyncProcess ? (
                <ButtonExtended status="basic" size="giant">
                  <Label
                    buttonLabel="LabelGiantBtn"
                    variants="label"
                    variantStyle="uppercaseBold"
                  >
                    <Spinner />
                  </Label>
                </ButtonExtended>
              ) : (
                <ButtonExtended status="primary" onPress={async () => {
                  setLoadingSyncProcess(true)
                  setEventList(eventName);
                  await deleteCachedItem(KEY_NAME.LOCATIONS_SYNC);
                  await deleteCachedItem(KEY_NAME.MENUS_SYNC);
                  await deleteCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
                  await deleteCachedItem(KEY_NAME.DISCOUNTS_SYNC);
                  await deleteCachedItem(KEY_NAME.ATTENDEES_SYNC);
                  await deleteCachedItem(KEY_NAME.RFID_SYNC);
                  await syncLocationsMenusMenuItems(selectedEvent?.eventId, true, true);
                }} size="giant">
                  <Label buttonLabel="LabelGiantBtn">Restart Syncing</Label>
                </ButtonExtended>
              )}
            </Block>
          </View>
        )}
        {!isSynchronized && (
          <Box
            width={NormalisedSizes(496)}
            style={{
              marginRight: "auto",
              marginLeft: "auto",
            }}
          >
            <Block
              style={{
                marginRight: "auto",
                marginLeft: "auto",
                marginBottom: NormalisedSizes(32),
                marginTop: NormalisedSizes(48),
              }}
            >
              <Icon
                style={{
                  width: NormalisedSizes(100),
                  height: NormalisedSizes(100),
                }}
                name="person-outline"
                fill={theme["color-basic-400"]}
              />
            </Block>
            <Block
              style={{
                marginBottom: NormalisedSizes(32),
              }}
            >
              <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={(values, actions) => {
                  setIsLoading(true);
                  handleLogin({
                    username: values.username,
                    password: values.password,
                  });
                  actions.setSubmitting(false);
                }}
              >
                {(formikProps) => (
                  <Box>
                    <Block
                      style={{
                        marginBottom: NormalisedSizes(32),
                      }}
                    >
                      <Block style={{ marginBottom: NormalisedSizes(18) }}>
                        <Label
                          variantStyle="uppercaseBold"
                          style={{
                            fontSize: NormalisedFonts(21),
                            lineHeight: NormalisedFonts(22),
                            color: theme["color-basic-600"],
                          }}
                        >
                          Clerk username
                        </Label>
                      </Block>

                      <Block>
                        <Input
                          onChangeText={formikProps.handleChange("username")}
                          placeholder="Username"
                          size="large"
                          disableFullscreenUI
                          onBlur={formikProps.handleBlur("username")}
                          accessoryRight={renderIconUser}
                          textStyle={{
                            fontSize: NormalisedFonts(21),
                            lineHeight: NormalisedFonts(30),
                            fontWeight: "400",
                            fontFamily: "OpenSans-Regular",
                          }}
                        />
                        {formikProps.touched.username &&
                          formikProps.errors.username ? (
                          <Heading style={{ color: "red" }} variants="h6">
                            {formikProps.touched.username &&
                              formikProps.errors.username}
                          </Heading>
                        ) : null}
                      </Block>
                    </Block>

                    <Block
                      style={{
                        marginBottom: NormalisedSizes(32),
                      }}
                    >
                      <Block style={{ marginBottom: NormalisedSizes(18) }}>
                        <Label
                          variantStyle="uppercaseBold"
                          style={{
                            fontSize: NormalisedFonts(21),
                            lineHeight: NormalisedFonts(22),
                            color: theme["color-basic-600"],
                          }}
                        >
                          password
                        </Label>
                      </Block>

                      <Block>
                        <Input
                          onChangeText={formikProps.handleChange("password")}
                          placeholder="********"
                          size="large"
                          disableFullscreenUI
                          autoCapitalize="none"
                          onBlur={formikProps.handleBlur("password")}
                          accessoryRight={renderIconSecurity}
                          secureTextEntry={secureTextEntry}
                          textStyle={{
                            fontSize: NormalisedFonts(21),
                            lineHeight: NormalisedFonts(30),
                            fontWeight: "400",
                            fontFamily: "OpenSans-Regular",
                          }}
                        />
                        {formikProps.touched.password &&
                          formikProps.errors.password ? (
                          <Heading style={{ color: "red" }} variants="h6">
                            {formikProps.touched.password &&
                              formikProps.errors.password}
                          </Heading>
                        ) : null}
                      </Block>
                    </Block>

                    <Block
                      style={{
                        marginBottom: NormalisedSizes(32),
                      }}
                    >
                      {isLoading ? (
                        <ButtonExtended status="basic" size="giant">
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
                          onPress={formikProps.handleSubmit}
                          status="primary"
                          size="giant"
                        >
                          <Label
                            buttonLabel="LabelGiantBtn"
                            variants="label"
                            variantStyle="uppercaseBold"
                          >
                            sign in
                          </Label>
                        </ButtonExtended>
                      )}
                    </Block>

                    <Block
                      style={{
                        marginBottom: NormalisedSizes(32),
                      }}
                    >
                      {loadingUsers ? (
                        <ButtonExtended status="basic" size="giant">
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
                          onPress={() => {
                            refershClerkUsers()
                          }}
                          status="tertiary"
                          size="giant"
                        >
                          <Label
                            buttonLabel="LabelGiantBtn"
                            variants="label"
                            variantStyle="uppercaseBold"
                          >
                            Refresh Clerks
                          </Label>
                        </ButtonExtended>
                      )}
                    </Block>
                  </Box>
                )}
              </Formik>
            </Block>
            <Box>
              <Flex cells={1} alignItems="center">
                <Block
                  style={{
                    marginBottom: NormalisedSizes(32),
                  }}
                >
                  <Flex flexDirection="row" alignItems="center" cells={2}>
                    <Block style={{ marginRight: NormalisedSizes(9) }}>
                      <Label buttonLabel="LabelLargeBtn" variantStyle="regular">
                        Having issues?
                      </Label>
                    </Block>
                    <Block>
                      <Link url="https://www.roninpos.com/contact">
                        Contact Us
                      </Link>
                    </Block>
                  </Flex>
                </Block>

                <Block>
                  <Caption
                    style={{
                      fontSize: NormalisedFonts(18),
                      fontWeight: "600",
                      color: theme["color-basic-300"],
                    }}
                    variants="c2"
                  >
                    {`RoninPOS v${version} - build ${APPCENTER_BUILD_ID}`}
                  </Caption>
                </Block>
              </Flex>
            </Box>
          </Box>
        )}
        <ErrorModal
          setVisible={setVisible}
          visible={visible}
          message={error}
          route={route}
        />
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  synchronizedView: {
    alignItems: "center",
    justifyContent: "center",
    height: NormalisedSizes(600),
    width: Dimensions.get("window").width,
    paddingTop: NormalisedSizes(70),
  },
});
