/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { APPCENTER_BUILD_ID } from "@env";
import { Icon, Input, Spinner, useTheme } from "@ui-kitten/components";
import { Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import * as yup from "yup";
import nextFrame from "next-frame";
import { version } from "../../../package.json";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Link } from "../../components/atoms/Link/Link";
import RoninLogo from "../../components/atoms/Logo/LogoRonin";
import LogoRoninReversed from "../../components/atoms/Logo/LogoRoninReversed";
import { Caption, Heading, Label } from "../../components/atoms/Text/index";
import { Block, Box, Flex } from "../../components/layouts/Index";
import { ErrorModal } from "../../components/organisms/ErrorModal";
import { ThemeContext } from "../../components/particles/ThemeContextProvider";
import {AuthContext, useAuth} from "../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { getCachedItem } from "../../helpers/storeData";
import { KEY_NAME, SCREEN_NAME, SYNC_STATUS_VERIFY } from "../../helpers/constants";
import ACService from "../../services/ACService";
import {Q} from "@nozbe/watermelondb";
import {WriteLog} from "../../CommonLogFile";

const validationSchema = yup.object().shape({
  username: yup.string().label("username"),
  password: yup.string().label("Password"),
});

export function LoginScreen({ navigation, route, ...props }) {
  useEffect(() => {
    setInterval(() => { }, 5000);
  }, []);
  const database = useDatabase();
  const { loginOrganizer, organizerUser } = useAuth();
  const { deviceId, firmwareVersion } = useContext(AuthContext);
  const { themeName } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [numberOfPendingOrders, setNumberOfPendingOrders] = useState(0);
  const [numberOfDeferredOrders, setNumberOfDeferredOrders] = useState(0);

  useEffect(() => {
    getOrderDetails();
    const intervalId = setInterval(() => {
      getOrderDetails();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    fetchOfflineTxs();
    const intervalId = setInterval(() => {
      fetchOfflineTxs();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchOfflineTxs = async () => {
    try {
      const txs = await ACService.showPendingOfflineTransactions();
      setNumberOfDeferredOrders(txs.size || 0);
    } catch (error) {
      console.error("Error fetching offline transactions:", error);
    }
  };

  const getOrderDetails = async () => {
    try {
      const pendingOrdersCount = await database
          .get("orders")
          .query(Q.where("is_pushed", false))
          .fetchCount();
      setNumberOfPendingOrders(pendingOrdersCount);
    } catch (err) {
      WriteLog("PendingSync err  " + err);
      console.log(err);
    }
  };
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (propsIcon) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...propsIcon} name={secureTextEntry ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const navigateToEventSelection = async () => {
    const users = await getCachedItem(KEY_NAME.USERS_SYNC);
    const events = await getCachedItem(KEY_NAME.EVENTS_SYNC);
    const discounts = await getCachedItem(KEY_NAME.DISCOUNTS_SYNC);
    if (users !== null && events !== null && discounts !== null) {
      setIsLoading(false); // Move this outside the switch to reduce redundancy
      navigation.navigate(SCREEN_NAME.ORGANIZER_CONFIG);
    } else {
      setTimeout(() => {
        navigateToEventSelection();
      }, SYNC_STATUS_VERIFY);
    }
  }

  const handleSubmitAuth = async ({ username, password }) => {
    nextFrame();
    const response = await loginOrganizer({ username, password });
    // console.log("response", response);


    if (response.statusCode) {
      switch (response.statusCode) {
        case 200:
          navigateToEventSelection();
          break;
        case 401:
        case 503:
        case 403:
          setIsLoading(false);
          setVisible(true);
          setError(response.errorMessage);
          break;
        default: // Handle other unspecified errors
          setIsLoading(false);
          setVisible(true);
          setError("An unexpected error occurred");
          break;
      }
    }
  };

  const renderIconUser = (propsIcon) => (
    <Icon {...propsIcon} name="person-outline" />
  );

  const theme = useTheme();
  // console.log("login screen");

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  return (
    <ScrollView>
      <Box width="100%" height={NormalisedSizes(900)}>
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
            {themeName === "lightTheme" ? (
              <RoninLogo
                width={NormalisedSizes(186)}
                height={NormalisedSizes(225)}
              />
            ) : (
              <LogoRoninReversed
                width={NormalisedSizes(186)}
                height={NormalisedSizes(225)}
              />
            )}
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
                handleSubmitAuth({
                  username: values.username,
                  password: values.password,
                });
                actions.setSubmitting(false);
              }}
              validationSchema={validationSchema}
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
                        Organizer Username
                      </Label>
                    </Block>
                    <Block>
                      <Input
                        onChangeText={formikProps.handleChange("username")}
                        placeholder="Organizer Username"
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
                        PASSWORD
                      </Label>
                    </Block>

                    <Block>
                      <Input
                        onChangeText={formikProps.handleChange("password")}
                        placeholder="Password"
                        size="large"
                        disableFullscreenUI
                        autoCapitalize="none"
                        onBlur={formikProps.handleBlur("password")}
                        accessoryRight={renderIcon}
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
                          SIGN IN
                        </Label>
                      </ButtonExtended>
                    )}
                  </Block>
                </Box>
              )}
            </Formik>
          </Block>

          <Box>
            <Flex flexDirection="column" cells={1} alignItems="center">
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
                    <Link
                      url="https://www.roninpos.com/contact"
                      variantStyle="underline"
                    >
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
                    textAlign: "center",
                  }}
                  variants="c2"
                >
                  {`RoninPOS v${version} - build ${APPCENTER_BUILD_ID}`}
                </Caption>
                <Caption
                    style={{
                      fontSize: NormalisedFonts(18),
                      fontWeight: "600",
                      color: theme["color-basic-300"],
                      textAlign: "center",
                    }}
                    variants="c2"
                >
                  {`Android ID: ${deviceId}`}
                </Caption>
                <Caption
                    style={{
                      fontSize: NormalisedFonts(18),
                      fontWeight: "600",
                      color: theme["color-basic-300"],
                      textAlign: "center",
                      marginBottom: NormalisedFonts(18),
                    }}
                    variants="c2"
                >
                  {`Pending Orders: ${numberOfPendingOrders} - Deferred Orders: ${numberOfDeferredOrders}`}
                </Caption>
              </Block>
            </Flex>
          </Box>
        </Box>
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
