import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  ApprovedStep,
  CreditStart,
  CustomItemScreen,
  EditOrderScreen,
  EnterPhoneNumberStep,
  InsertPin,
  LoginScreen,
  Menu,
  PhoneNumberAssociation,
  RFIDPrompts,
  ReaderReady,
  QRCodeReaderReady,
  QRCodePrompts,
  TenderedAmountStep,
  TipStep,
  TransactionApprovedRfid,
  TransactionCompletedRfid,
  TransactionCompletedStep,
  TransactionDeclinedRfid,
  TransactionApprovedQRCode,
  TransactionCompletedQRCode,
  TransactionDeclinedQRCode,
  UserLogin,
  UserPasscode,
} from "./screens";
import { AuthContext } from "./contexts/AuthContext";
import OrganizerConfig from "./screens/AuthScreens/OrganizerConfig";
import { TopNav } from "./components/organisms/TopNavigaton/TopNavigationDefault";
import PosConfig from "./screens/Management/PosConfig";
import TopBar from "./components/molecules/TopBar/TopBar";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getCachedItem } from "./helpers/storeData";
import { KEY_NAME, SCREEN_NAME, SYNC_STATUS_VERIFY } from "./helpers/constants";
import OrderHistory from "./screens/Management/OrderHistory";
import { TopNavPayment } from "./components/organisms/TopNavigaton/TopNavigationPayment";
import QrCodeScanner from "./screens/Management/QrCodeScanner";
import AdminPanel from "./screens/Management/AdminPanel";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Q } from "@nozbe/watermelondb";
import ACModule from "./services/ACService";
import TicketRedemption from "./screens/Management/TicketRedemption";
import ScaningScreen from "./screens/Management/ScaningScreen";
import TokenRedeemSuccessFail from "./screens/Management/TokenRedeemSuccessFail";

const NavigationScreen = () => {
  const Stack = createStackNavigator();
  const {
    organizerUser,
    employeeUser,
    setEmployeeUser,
    menuDisplayRefresh,
    updateTabletSelections,
    tabletSelections: { event },
  } = useContext(AuthContext);
  const [initRoute, setInitRoute] = useState(null);
  const navigation = useNavigation();
  const isFocus = useIsFocused();
  const database = useDatabase();

  const navigateToScreen = async () => {
    const OrgAccessToken = await getCachedItem(KEY_NAME.ORG_USER_ACCESS_TOKEN);
    const EventId = await getCachedItem(KEY_NAME.EVENT_ID);
    const EmpAccessToken = await getCachedItem(KEY_NAME.EMP_USER_ACCESS_TOKEN);
    const selectedLocation = await getCachedItem(KEY_NAME.SELECTED_LOCATION);
    const selectedMenu = await getCachedItem(KEY_NAME.SELECTED_MENU);
    console.log("Location ===>", selectedLocation);
    console.log("Menu ===>", selectedMenu);
    console.log("EmpAccessToken ===>", EmpAccessToken);

    const handleConnect = async ({ localLocation }) => {
      ACModule.setMerchantCredentials(
        localLocation.consumerKey,
        localLocation.secretKey,
        localLocation.merchantId
      );
    };


    if (EmpAccessToken.item !== null) {
      //console.log("@@======EmpAccessToken.item======", EmpAccessToken.item)
      const user = await database.collections.get('users').query(Q.where('user_id', parseInt(EmpAccessToken.item))).fetch();
      console.log("@@=====user=====", user)
      if (user[0]) {
        const updatedEmployee = {
          username: user[0]._raw.username,
          user_id: user[0]._raw.user_id,
          organization_id: user[0]._raw.organisation_id,
          allowed_roles: "clerk",
          tablet_access_code: user[0]._raw.tablet_access_code,
          accessTokenExp: '',
        };
        setEmployeeUser(updatedEmployee);
      }
    }

    if (selectedLocation?.item && selectedMenu?.item) {
      if (selectedLocation?.item !== null && selectedMenu?.item !== null) {
        const location = await database.collections.get("locations").find(selectedLocation?.item);
        const menu = await database.collections.get("menus").find(selectedMenu?.item);

        updateTabletSelections({
          location: location?._raw,
          menu: menu
        });
        handleConnect({
          localLocation: JSON.parse(
            location?._raw.payment_processor_config
          ),
        });
      }
    }


    const navigateToEventSelection = async () => {
      const users = await getCachedItem(KEY_NAME.USERS_SYNC);
      const events = await getCachedItem(KEY_NAME.EVENTS_SYNC);
      const discounts = await getCachedItem(KEY_NAME.DISCOUNTS_SYNC);
      if (users !== null && events !== null && discounts !== null) {
        return true;
      } else {
        setTimeout(() => {
          navigateToEventSelection();
        }, SYNC_STATUS_VERIFY);
      }
    }

    if (OrgAccessToken?.item && navigateToEventSelection()) {
      if (EventId?.item !== null) {
        if (EmpAccessToken?.item) {
          if (selectedLocation?.item && selectedMenu?.item) {
            setInitRoute(SCREEN_NAME.MENU);
          } else {
            setInitRoute(SCREEN_NAME.POS_CONFIG);
          }
        } else {
          setInitRoute(SCREEN_NAME.USER_LOGIN);
        }
      } else {
        setInitRoute(SCREEN_NAME.ORGANIZER_CONFIG);
      }
    } else {
      setInitRoute(SCREEN_NAME.COMPANY_LOGIN);
    }
  };

  useEffect(() => {
    navigateToScreen();
  }, [isFocus, initRoute, menuDisplayRefresh]);

  return (
    initRoute && (
      <Stack.Navigator initialRouteName={initRoute}>
        <Stack.Screen
          name={SCREEN_NAME.COMPANY_LOGIN}
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREEN_NAME.ORGANIZER_CONFIG}
          component={OrganizerConfig}
          options={(props) => ({
            header: () => <TopNav {...props} />,
          })}
        />

        <Stack.Screen
          name={SCREEN_NAME.USER_LOGIN}
          component={UserLogin}
          options={(props) => ({
            header: () => <TopNav {...props} />,
          })}
        />

        <Stack.Screen
          name={SCREEN_NAME.POS_CONFIG}
          component={PosConfig}
          options={(props) => ({
            header: () => <TopNav {...props} />,
          })}
        />
        <Stack.Screen
          name={SCREEN_NAME.MENU}
          component={Menu}
          options={() => ({
            header: (props) => (
              <TopNav navigation={props.navigation} route={props.route} />
            ),
          })}
        />
        <Stack.Screen
          name={SCREEN_NAME.EDIT_ORDER}
          component={EditOrderScreen}
          options={() => ({
            header: (props) => (
              <TopNav navigation={props.navigation} route={props.route} />
            ),
          })}
        />
        <Stack.Screen
          name={SCREEN_NAME.USER_PASSCODE}
          component={UserPasscode}
          options={(props) => ({
            header: () => <TopNav {...props} />,
          })}
        />

        <Stack.Screen
          name={SCREEN_NAME.ADMIN_PANEL}
          options={() => ({
            header: (props) => (
              <TopNav navigation={props.navigation} route={props.route} />
            ),
          })}
          component={AdminPanel}
        />

        <Stack.Screen
          name={SCREEN_NAME.CUSTOM_ITEM}
          component={CustomItemScreen}
          options={() => ({
            header: (props) => (
              <TopNav navigation={props.navigation} route={props.route} />
            ),
          })}
        />
        <Stack.Screen
          name={SCREEN_NAME.ORDER_HISTORY}
          component={OrderHistory}
          options={() => ({
            header: (props) => (
              <TopNav navigation={props.navigation} route={props.route} />
            ),
          })}
        />

        {/* Cash Transactions Screens */}
        <Stack.Group
          screenOptions={({ navigation, route }) => ({
            header: () => (
              <TopNavPayment navigation={navigation} route={route} />
            ),
            animationEnabled: false,
          })}
        >
          <Stack.Screen
            name={SCREEN_NAME.TENDERED_AMOUNT_STEP_CASH}
            component={TenderedAmountStep}
          />

          <Stack.Screen
            name={SCREEN_NAME.APPROVED_STEP}
            component={ApprovedStep}
          />
          <Stack.Screen
            name={SCREEN_NAME.ENTER_PHONE_NUMBER_STEP_CASH}
            component={EnterPhoneNumberStep}
          />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_COMPLETED_STEP_CASH}
            component={TransactionCompletedStep}
          />
        </Stack.Group>

        {/* Credit Transactions Screens */}
        <Stack.Group
          screenOptions={() => ({
            header: (props) => (
              <TopBar navigation={props.navigation} route={props.route} />
            ),
          })}
        >
          <Stack.Screen
            name={SCREEN_NAME.TIP_STEP_CREDIT}
            component={TipStep}
          />
          <Stack.Screen
            name={SCREEN_NAME.CREDIT_START}
            component={CreditStart}
          />
          <Stack.Screen
            name={SCREEN_NAME.ENTER_PHONE_NUMBER_STEP_CREDIT}
            component={EnterPhoneNumberStep}
          />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_COMPLETED_STEP_CREDIT}
            component={TransactionCompletedStep}
          />
        </Stack.Group>

        {/* Rfid Screens */}
        <Stack.Group
          screenOptions={(props) => ({
            header: (headerProps) => (
              <TopBar {...{ ...props, ...headerProps }} />
            ),
          })}
        >
          <Stack.Screen name={SCREEN_NAME.TIP_STEP_RFID} component={TipStep} />
          <Stack.Screen
            name={SCREEN_NAME.READER_READY}
            component={ReaderReady}
          />
          <Stack.Screen
            name={SCREEN_NAME.RFID}
            component={RFIDPrompts}
          ></Stack.Screen>

          <Stack.Screen
            name={SCREEN_NAME.REGISTER_RFID_ASSOCIATION}
            component={PhoneNumberAssociation}
          />

          <Stack.Screen name={SCREEN_NAME.PIN_INSERT} component={InsertPin} />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_RFID_DECLINED}
            component={TransactionDeclinedRfid}
          />

          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_RFID_APPROVED}
            component={TransactionApprovedRfid}
          />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_COMPLETED_RFID}
            component={TransactionCompletedRfid}
          />
          <Stack.Screen
            name={SCREEN_NAME.QR_CODE_SCANNER}
            component={QrCodeScanner}
          />
          <Stack.Screen
            name={SCREEN_NAME.TICKET_REDEMPTION}
            component={TicketRedemption}
          />
          <Stack.Screen
            name={SCREEN_NAME.SCANING_SCREEN}
            component={ScaningScreen}
          />
          <Stack.Screen
            name={SCREEN_NAME.TOKEN_REDEEM_SUCCESS_FAIL}
            component={TokenRedeemSuccessFail}
          />
        </Stack.Group>

        {/* QRCode Screens */}
        <Stack.Group
          screenOptions={(props) => ({
            header: (headerProps) => (
              <TopBar {...{ ...props, ...headerProps }} />
            ),
          })}
        >
          <Stack.Screen name={SCREEN_NAME.TIP_STEP_QR_CODE} component={TipStep} />
          <Stack.Screen
            name={SCREEN_NAME.QR_CODE_READER_READY}
            component={QRCodeReaderReady}
          />
          <Stack.Screen
            name={SCREEN_NAME.QRCODE}
            component={QRCodePrompts}
          />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_QRCODE_DECLINED}
            component={TransactionDeclinedQRCode}
          />

          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_QRCODE_APPROVED}
            component={TransactionApprovedQRCode}
          />
          <Stack.Screen
            name={SCREEN_NAME.TRANSACTION_COMPLETED_QRCODE}
            component={TransactionCompletedQRCode}
          />
        </Stack.Group>
      </Stack.Navigator>
    )
  );
};

export default NavigationScreen;
