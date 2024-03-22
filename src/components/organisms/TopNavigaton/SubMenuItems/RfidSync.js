import React, { useContext, useEffect, useState } from "react";
import { Q } from "@nozbe/watermelondb";
import { Input, useTheme, Button, Spinner } from "@ui-kitten/components";
import {
  Alert,
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
  Image,
} from "react-native";
import { startsWith } from "lodash";
import { useNetInfo } from "@react-native-community/netinfo";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { Label, Heading } from "../../../atoms/Text/index";
import { Keypad } from "../../NumericKeypad/NumericKeypad";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { NormalisedFonts, NormalisedSizes } from "../../../../hooks/Normalized";
import { Block, Box, Flex } from "../../../layouts/Index";
import customLogging from "../../../../customLogging";
import { AuthContext, useAuth } from "../../../../contexts/AuthContext";
import ACService from "../../../../services/ACService";
import RoninChipService from "../../../../services/RoninChipService";
import ModalHeaderTitle from "./ModalHeaderTitle";
import moment from "moment";
import { Strings } from "../../../../constants/Routes";
import {
  GET_ATTENDEES_WITH_EVENTID,
  GET_EVENT_ATTENDEES_AGG,
  GET_EVENT_RFIDS_AGG,
} from "../../../../fragments/resolvers";
import { useApolloClient } from "@apollo/client";
import Images from "../../../../Images";
import { WriteLog } from "../../../../../src/CommonLogFile";
import TextFiledWithValue from "./TextFiledWithValue";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

export const RfidSync = ({ onComplete }) => {
  const [offlineRfids, setOfflineRfids] = useState([]);
  const [showWristBandDetect, setShowWristBandDetect] = useState(false);
  const [scanWristbandModal, setScanWristbandModal] = useState(false);
  const [openRFIDDetails, setOpenRFIDDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localattendeeAssets, setLocalattendeeAssets] = useState(0);
  const [localattendeeRecord, setLocalattendeeRecord] = useState(0);
  const [cloudattendeeAssets, setCloudattendeeAssets] = useState(0);
  const [cloudattendeeRecord, setCloudattendeeRecord] = useState(0);
  const db = useDatabase();
  const client = useApolloClient();

  const {
    syncLogs,
    refreshRfidAndAttendee,
    loadingAuth,
    showLoading,
    offlineMode,
    tabletSelections: { event: selectedEvent },
  } = useAuth();
  WriteLog("RfidSync syncLogs  " + syncLogs);
  console.log({ syncLogs });
  const netInfo = useNetInfo();

  const searchRfid = async () => {
    return await RoninChipService.callScanRfid();
  };

  useEffect(() => {
    setLoading(loadingAuth);
    getLocalRfidData();
    getCloudRfidData();
    getLocalAttendeeData();
    getCloudAttendeeData();
  }, [loadingAuth]);

  const getLocalRfidData = async () => {
    try {
      const count = await db.collections
        .get('rfid_assets')
        .query(Q.where('event_id', selectedEvent?.eventId))
        .fetchCount();

      setLocalattendeeAssets(count);
    } catch (error) {
      WriteLog("RfidSync Error fetching RFID assets count:" + error);
      console.error("Error fetching RFID assets count:", error);
      Alert.alert("", `${Strings["RFID Asset Not Found Locally"]}`, [
        {
          text: "Okay",
          onPress: () => {
            setShowWristBandDetect(false);
            setScanWristbandModal(false);
            setOpenRFIDDetails(false);
          },
        },
      ]);
    }
  };

  const getCloudRfidData = async () => {
    try {
      let event_id = selectedEvent?.eventId;
      let rfidDataWithCloud = await client.query({
        query: GET_EVENT_RFIDS_AGG,
        variables: {
          eventId: event_id,
        },
      });

      if (
        rfidDataWithCloud?.data &&
        rfidDataWithCloud?.data?.rfid_assets_aggregate &&
        rfidDataWithCloud?.data?.rfid_assets_aggregate?.aggregate
      ) {
        setCloudattendeeAssets(
          rfidDataWithCloud?.data?.rfid_assets_aggregate?.aggregate?.count
        );
      } else {
        WriteLog("RfidSync No rfid_assets_aggregate received");
        console.error("No rfid_assets_aggregate received");
      }
    } catch (error) {
      WriteLog("RfidSync Error fetching cloud RFID data:" + error);
      console.error("Error fetching cloud RFID data:", error);
      setCloudattendeeAssets(0);
    }
  };

  const getLocalAttendeeData = async () => {
    try {
      const count = await db.collections
        .get("attendees")
        .query(Q.where("event_id", selectedEvent?.eventId))
        .fetchCount();

      setLocalattendeeRecord(count);
    } catch (error) {
      WriteLog("RfidSync Error fetching RFID assets count:" + error);
      console.error("Error fetching RFID assets count:", error);
      Alert.alert("", `${Strings["RFID Attendee Record Not Found Locally"]}`, [
        {
          text: "Okay",
          onPress: () => {
            setLocalattendeeRecord(0);
          },
        },
      ]);
    }
  };

  const getCloudAttendeeData = async () => {
    try {
      let event_id = selectedEvent?.eventId;
      let attendeeDataWithCloud = await client.query({
        query: GET_EVENT_ATTENDEES_AGG,
        variables: {
          eventId: event_id,
        },
      });
      if (
        attendeeDataWithCloud?.data &&
        attendeeDataWithCloud?.data?.attendees_aggregate &&
        attendeeDataWithCloud?.data?.attendees_aggregate?.aggregate
      ) {
        setCloudattendeeRecord(
          attendeeDataWithCloud?.data?.attendees_aggregate?.aggregate?.count
        );
      } else {
        WriteLog("RfidSync No attendees_aggregate received");
        console.error("No attendees_aggregate received");
      }
    } catch (error) {
      WriteLog("RfidSync Error fetching cloud RFID data:" + error);
      console.error("Error fetching cloud RFID data:", error);
      setCloudattendeeRecord(0);
    }
  };

  const fetchRfid = async (uid) => {
    try {
      const fetchedRfid = await db.collections.get("rfid_assets").find(uid);
      WriteLog(
        "RfidSync fetchRfid" +
          moment(rfid?.createdAt).format("MM/DD/YYYY hh:mm:ss A") +
          moment(rfid?.updatedAt).format("MM/DD/YYYY hh:mm:ss A")
      );
      let rfid = fetchedRfid;
      console.log(
        "fetchRfid :::",
        moment(rfid?.createdAt).format("MM/DD/YYYY hh:mm:ss A"),
        moment(rfid?.updatedAt).format("MM/DD/YYYY hh:mm:ss A")
      );

      setOfflineRfids([
        {
          id: rfid.id,
          rfid_id: rfid.rfid_id,
          uid: rfid.uid,
          last_four_phone_numbers: rfid.last_four_phone_numbers,
          is_active: rfid.is_active,
          event_id: rfid.event_id,
          attendee_id: rfid.attendeeId,
          cash_balance: rfid.cash_balance,
          promo_balance: rfid.promo_balance,
          tokens_balance: rfid.tokens_balance,
          created_at: moment(rfid?.createdAt).format("MM/DD/YYYY hh:mm:ss A"),
          updated_at: moment(rfid?.updatedAt).format("MM/DD/YYYY hh:mm:ss A"),
        },
      ]);
      setOpenRFIDDetails(true);
      setScanWristbandModal(false);
      setShowWristBandDetect(false);
    } catch (error) {
      WriteLog("RfidSync Error fetching RFID:" + error);
      console.error("Error fetching RFID:", error);
      alert("Asset not found this device.");
      setOfflineRfids([
        {
          id: '',
          rfid_id: '',
          uid: '',
          last_four_phone_numbers: '',
          is_active: false,
          event_id: "",
          attendee_id: "",
          cash_balance: "",
          promo_balance: "",
          tokens_balance: "",
          created_at: "",
          updated_at: "",
        },
      ]);
      setOpenRFIDDetails(true);
      setScanWristbandModal(false);
      setShowWristBandDetect(false);
    }
  };

  const formatTokensBalanceDisplay = (currentTokenBalance) => {
    if (typeof currentTokenBalance === "undefined") {
      return null;
    }
    if (Object.keys(currentTokenBalance).length > 0) {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "400" }}>
            tokens_balance :{" "}
          </Text>
          <View>
            {Object.keys(currentTokenBalance).map((t, index) => {
              const token = currentTokenBalance[t];
              return (
                <View
                  style={[
                    styles.textViewforRFIDdetails,
                    { marginTop: index === 0 ? 0 : 10 },
                  ]}
                >
                  <Text style={{ fontSize: 17, fontWeight: "400" }}>
                    {token?.redeemable_token_name || t}
                  </Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                  >
                    - {token.balance}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    return null;
  };

  // RFID Scan After executre flow

  useEffect(() => {
    if (scanWristbandModal) {
      const subscription = DeviceEventEmitter.addListener(
        "onRfidScanResult",
        async (event) => {
          WriteLog("RfidSync RFID SCAN RESULT" + event);
          console.log("RFID SCAN RESULT", event);
          const regHex = /[0-9A-Fa-f]{6}/g;

          let newEvent;

          if (startsWith(event, "00")) {
            newEvent = event.slice(2);
          }
          if (regHex.test(newEvent) && newEvent.length >= 8) {
            const result = newEvent;
            fetchRfid(result);
          } else {
            WriteLog("RfidSync RFID RESULT - SET DECLINE");
            console.log("RFID RESULT - SET DECLINE");
            // setScanWristbandModal(false);
            // setShowWristBandDetect(false);
            // setOpenRFIDDetails(false);
            // setPrompt(status.declined);
          }
          regHex.lastIndex = 0; // be sure to reset the index after using .text()
        }
      );
      return () => {
        subscription.remove();
      };
    }
  }, [scanWristbandModal]);

  const scanRFID = async () => {
    WriteLog("RfidSync scanWristbandModal" + scanWristbandModal);
    console.log("console scanWristbandModal ::", scanWristbandModal);
    try {
      await RoninChipService.callScanRfid();
    } catch (error) {
      WriteLog("RfidSync scan called error");
      console.log("scan called error");
    }
  };

  useEffect(() => {
    if (scanWristbandModal) {
      WriteLog("RfidSync scanWristbandModal" + scanWristbandModal);
      console.log("console scanWristbandModal ::", scanWristbandModal);
      setTimeout(() => {
        scanRFID();
      }, 900);
    }
  }, [scanWristbandModal]);

  const closeModal = () => {
    onComplete(), setOpenRFIDDetails(false);
    setScanWristbandModal(false);
    setShowWristBandDetect(false);
  };

  return (
    <View style={styles.container}>
      {!showWristBandDetect && !scanWristbandModal && !openRFIDDetails && (
        <View style={styles.modalMainView}>
          <ModalHeaderTitle onclose={() => closeModal()} title="RFID Details" />
          <TextFiledWithValue
            instructionText={Strings["Locally Stored Cashless Asset Count"]}
            value={localattendeeAssets}
            isNetworkCheck={false}
          />
          <TextFiledWithValue
            instructionText={Strings["Cloud Stored Cashless Asset Count"]}
            value={cloudattendeeAssets}
            isNetworkCheck={true}
            netWorkConnection={netInfo?.isConnected}
            image={Images.offlineWifi}
            containerStyle={{ marginTop: 15 }}
          />
          <TextFiledWithValue
            instructionText={Strings["Locally Stored Attendee Records"]}
            value={localattendeeRecord}
            isNetworkCheck={false}
            containerStyle={{ marginTop: 15 }}
          />
          <TextFiledWithValue
            instructionText={Strings["Cloud Stored Attendee Records"]}
            value={cloudattendeeRecord}
            isNetworkCheck={true}
            netWorkConnection={netInfo?.isConnected}
            image={Images.offlineWifi}
            containerStyle={{ marginTop: 15 }}
          />

          {/*{!loading ? (*/}
          {/*  <ButtonExtended*/}
          {/*    size="medium"*/}
          {/*    status="primary"*/}
          {/*    style={{*/}
          {/*      width: NormalisedSizes(440),*/}
          {/*      marginHorizontal: 5,*/}
          {/*      marginTop: 60,*/}
          {/*      alignSelf: "center",*/}
          {/*    }}*/}
          {/*    onPress={() => {*/}
          {/*      showLoading(true),*/}
          {/*        refreshRfidAndAttendee(selectedEvent.eventId);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Label*/}
          {/*      buttonLabel="LabelLargeBtn"*/}
          {/*      variants="label"*/}
          {/*      variantStyle="regular"*/}
          {/*      style={{ alignItem: "center" }}*/}
          {/*    >*/}
          {/*      {Strings.syncRFIDs}*/}
          {/*    </Label>*/}
          {/*  </ButtonExtended>*/}
          {/*) : (*/}
          {/*  <ButtonExtended*/}
          {/*    status="basic"*/}
          {/*    size="medium"*/}
          {/*    style={{*/}
          {/*      width: NormalisedSizes(440),*/}
          {/*      marginHorizontal: 5,*/}
          {/*      marginTop: 60,*/}
          {/*      alignSelf: "center",*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Label*/}
          {/*      buttonLabel="LabelLargeBtn"*/}
          {/*      variants="label"*/}
          {/*      variantStyle="uppercaseBold"*/}
          {/*    >*/}
          {/*      <Spinner />*/}
          {/*    </Label>*/}
          {/*  </ButtonExtended>*/}
          {/*)}*/}
          <ButtonExtended
            size="medium"
            status="tertiary"
            style={{
              width: NormalisedSizes(440),
              marginHorizontal: 5,
              marginTop: 10,
              alignSelf: "center",
            }}
            onPress={() => {
              setShowWristBandDetect(true);
            }}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="regular"
              style={{ alignItem: "center" }}
            >
              {Strings.localRFIDLookup}
            </Label>
          </ButtonExtended>
        </View>
      )}
      {showWristBandDetect && (
        <View style={[styles.modalMainView]}>
          <ModalHeaderTitle onclose={() => closeModal()} title="RFID Details" />
          <View style={styles.detailsView}>
            <Text style={styles.headerTitleText}>
              {scanWristbandModal
                ? Strings.pleaseTapWristband
                : Strings["Would you like to look up an RFID Assets ?"]}
            </Text>
            <ButtonExtended
              size="medium"
              status="primary"
              style={{
                width: NormalisedSizes(440),
                marginHorizontal: 5,
                marginTop: 10,
                alignSelf: "center",
              }}
              onPress={() => {
                if (scanWristbandModal) {
                  setOpenRFIDDetails(false);
                  setScanWristbandModal(false);
                  setShowWristBandDetect(false);
                } else {
                  setScanWristbandModal(true);
                }
              }}
            >
              <Label
                buttonLabel="LabelLargeBtn"
                variants="label"
                variantStyle="regular"
                style={{ alignItem: "center" }}
              >
                {scanWristbandModal ? "Cancel" : "Yes!"}
              </Label>
            </ButtonExtended>
          </View>
        </View>
      )}
      {openRFIDDetails && (
        <View style={[styles.modalMainView]}>
          <ModalHeaderTitle onclose={() => closeModal()} title="RFID Details" />
          <View style={styles.detailsView}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.textViewforRFIDdetails,
                  { alignSelf: "flex-start" },
                ]}
              >
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  rfid_id :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.rfid_id}
                </Text>
              </View>
              <View
                style={[
                  styles.textViewforRFIDdetails,
                  { alignSelf: "flex-start" },
                ]}
              >
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  id :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.id}
                </Text>
              </View>
              <View
                style={[
                  styles.textViewforRFIDdetails,
                  { alignSelf: "flex-start" },
                ]}
              >
                <Text style={{ fontSize: 17, fontWeight: "400" }}>uid :</Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.uid}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  last_four_phone_numbers :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.last_four_phone_numbers}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  is_active :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.is_active}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  event_id :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.event_id}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  attendee_id :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.attendee_id}
                </Text>
              </View>

              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  cash_balance :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.cash_balance}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  promo_balance :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.promo_balance}
                </Text>
              </View>
              <View variants="h3" style={{ marginTop: 10 }}>
                {formatTokensBalanceDisplay(offlineRfids[0]?.tokens_balance)}
              </View>

              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  created_at :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.created_at}
                </Text>
              </View>
              <View style={styles.textViewforRFIDdetails}>
                <Text style={{ fontSize: 17, fontWeight: "400" }}>
                  updated_at :
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}
                >
                  {offlineRfids[0]?.updated_at}
                </Text>
              </View>
            </ScrollView>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ButtonExtended
                size="medium"
                status="secondary"
                style={{
                  width: NormalisedSizes(280),
                  marginHorizontal: 5,
                  marginTop: 10,
                  alignSelf: "center",
                }}
                onPress={() => {
                  setOpenRFIDDetails(false);
                  setScanWristbandModal(false);
                  setShowWristBandDetect(false);
                }}
              >
                <Label
                  buttonLabel="LabelLargeBtn"
                  variants="label"
                  variantStyle="regular"
                  style={{ alignItem: "center" }}
                >
                  Cancel
                </Label>
              </ButtonExtended>
              <ButtonExtended
                size="medium"
                status="primary"
                style={{
                  width: NormalisedSizes(280),
                  marginHorizontal: 5,
                  marginTop: 10,
                  alignSelf: "center",
                }}
                onPress={() => {
                  setScanWristbandModal(true);
                  setOpenRFIDDetails(false);
                  setShowWristBandDetect(true);
                }}
              >
                <Label
                  buttonLabel="LabelLargeBtn"
                  variants="label"
                  variantStyle="regular"
                  style={{ alignItem: "center" }}
                >
                  Scan Another RFID
                </Label>
              </ButtonExtended>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalMainView: {
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.3,
    width: SCREEN_WIDTH * 0.5,
    borderColor: "black",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
  },
  textViewStyle: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  passwordHeading: {
    alignItems: "center",
    marginVertical: 20,
    alignSelf: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 35,
    alignSelf: "center",
  },
  detailsView: {
    alignItems: "flex-start",
    justifyContent: "center",
    flex: 1,
    marginTop: 10,
  },
  textViewforRFIDdetails: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
