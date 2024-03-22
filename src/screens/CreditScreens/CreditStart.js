/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-raw-text */
import { DdLogs } from "@datadog/mobile-react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import PropTypes from "prop-types";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  DeviceEventEmitter,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import MemoLogoAmex from "../../components/atoms/Logo/LogoAmex";
import MemoLogoMaster from "../../components/atoms/Logo/LogoMaster";
import MemoLogoVisa from "../../components/atoms/Logo/LogoVisa";
import { Heading, Label, Paragraph } from "../../components/atoms/Text";
import { OrderTotal } from "../../components/molecules/OrderTotal";
import { PaymentAction } from "../../components/organisms/PaymentAction";
import Row from "../../components/particles/Row";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { TransactionContext } from "../../contexts/TransactionContext";
import { useCardReaderContext } from "../../contexts/CardReaderContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  formatToPPSpayment,
  getSubtotalAfterDiscount,
} from "../../helpers/calc";
import ACService from "../../services/ACService";
import { TransactionApprovedCredit } from "./TransactionApprovedCredit";
import { TransactionDeclinedCredit } from "./TransactionDeclinedCredit";
import discover from "../../../assets/images/discover-logo.png";
import { APPCENTER_BUILD_ID } from "@env";
import { WriteLog } from "../../../src/CommonLogFile";
import ACModule from "../../services/ACService";

const styles = StyleSheet.create({
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  cardLogoRow: {
    flexWrap: "nowrap",
    marginBottom: 10,
    marginTop: 10,
  },
  cardLogos: {
    marginHorizontal: 21,
  },
  marginVertical: {
    marginVertical: 10,
  },
  paymentReaderEvent: {
    marginBottom: 15,
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

const InsertCardIcons = () => (
  <>
    <Row style={styles.cardLogoRow}>
      <View style={styles.cardLogos}>
        <MemoLogoMaster width={69} height={47} />
      </View>
      <View style={styles.cardLogos}>
        <MemoLogoVisa width={70} height={46} />
      </View>
      <View style={styles.cardLogos}>
        <MemoLogoAmex width={69} height={46} />
      </View>
      <View style={styles.cardLogos}>
        <Image
          source={discover}
          style={{ width: 70, height: 46 }}
          alt="DiscoverLogo"
        />
      </View>
    </Row>
    <PaymentAction />
  </>
);

const RetryConnectButton = ({ onPress }) => (
  <Button
    title="Please Retry"
    onPress={onPress}
    status="primary"
    size="medium"
    style={styles.button}
  >
    Please Retry
  </Button>
);

const CancelButton = ({ onPress, buttonName, navigation }) => (
  <ButtonExtended
    style={styles.button}
    onPress={onPress}
    status={buttonName === "Cancel" ? "secondary" : "tertiary"}
    size="giant"
  >
    <Label
      buttonLabel={buttonName === "Cancel" ? "none" : "LabelGiantBtn"}
      variants="label"
      variantStyle="uppercaseBold"
    >
      {buttonName}
    </Label>
  </ButtonExtended>
);

const ConnectPrompt = ({ connectionStatus, onClose }) => {
  const cardReaderContext = useCardReaderContext();
  const navigation = useNavigation();
  const handleNewReaderConnect = () => {
    ACModule.reLaunchApp();
  };
  return (
    <Layout>
      <View style={styles.prompt}>
        <Heading variants="h1">Card Reader Disconnected</Heading>
        <Row>
          <View style={styles.sameWidth}>
            <Button
              onPress={handleNewReaderConnect}
              status="primary"
              size="medium"
              style={[styles.button, { fontSize: 40 }, { marginTop: 30 }]}>
              RELAUNCH APP
            </Button>
          </View>
        </Row>
        <Row>
          <View style={styles.sameWidth}>
            <CancelButton
              onPress={() => navigation.goBack()}
              buttonName={"Cancel"}
              navigation={navigation}
            />
          </View>
        </Row>
      </View>
    </Layout>
  );
};

export const CreditStart = (props) => {
  const refId = nanoid(16);
  const [reference_id, _] = useState(refId);
  const [readerEvent, setReaderEvent] = useState("");
  const [swipe, setSwipe] = useState("");
  const [readerError, setReaderError] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retried, setRetried] = useState(false);
  const { newReaderConnect, controllerConnectionStatus, connected } =
    useCardReaderContext();
  const [connectionStatus, setConnectionStatus] = useState(
    controllerConnectionStatus
  );
  const navigation = useNavigation();
  // WriteLog(
  //   "CreditStart controllerConnectionStatus" + controllerConnectionStatus
  // );
  // console.log({ controllerConnectionStatus });
  const { setTransaction, orderTotals, createOrder } =
    useContext(TransactionContext);

  const {
    offlineMode,
    employeeUser,
    allowBatchMode,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
    deviceId
  } = useAuth();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const { total_paid, total_tax, updated_items, subtotal_after_tokens, tip } =
    orderTotals;

  const cartState = useTrackedState();
  const { total } = cartState;

  const { isDiscounted, discountType, discount } = useContext(DiscountContext);
  const [retryTransaction, setRetryTransaction] = useState(false);

  const ppsTotal = (total_paid / 100).toFixed(2);
  const toggleSwipe = () => {
    const swipeState = ACService.toggleSwipe(
      ppsTotal,
      reference_id,
      updated_items,
      (selectedLocation.dynamic_descriptor !== null && selectedLocation.dynamic_descriptor !== "")
        ? selectedLocation.dynamic_descriptor
        : selectedEvent.dynamic_descriptor,
      allowBatchMode
    );
    setSwipe(swipeState);
  };
  const transaction_time = moment(
    new Date().toUTCString(),
    "DD MMM YYYY HH:mm:ss"
  ).format("YYYY-MM-DDTHH:mm:ss");
  const metaData = {
    items: updated_items,
    reference_id,
    subtotal: subtotal_after_tokens,
    tax: total_tax,
    tip,
    transaction_time,
    user_id: parseInt(employeeUser.user_id, 10),
    // payments: paymentFields,
    location_id: selectedLocation.location_id,
    event_id: selectedLocation.event_id,
    device_id: parseInt(APPCENTER_BUILD_ID), // due to data type mismatch storing into device_id
    device_app_id: deviceId ? deviceId : "null", // due to data type mismatch storing into device_app_id
    vendor_id: Number(selectedLocation.vendor_id) || null,
    menu_id: Number(selectedMenu.id),
  };
  const checkPendingTransactionsThenCreateOrder = async () => {
    try {
      const txs = await ACService.showPendingOfflineTransactions();
      if (txs[refId]) {
        createNewOrder({ deferred: true });
        setReaderEvent("DEFERRED");
      } else {
        setReaderEvent("DECLINED");
      }
    } catch (error) {
      setReaderEvent("DECLINED");
    }
  };

  const recreateOrder = () => {
    setRetryTransaction((prevState) => {
      if (prevState) {
        ACService.startEMV(
          ppsTotal,
          reference_id,
          JSON.stringify({ items: updated_items, data: metaData }),
          (selectedLocation.dynamic_descriptor !== null && selectedLocation.dynamic_descriptor !== "")
            ? selectedLocation.dynamic_descriptor
            : selectedEvent.dynamic_descriptor,
          allowBatchMode
        );
      }
      return false;
    });
  };
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onCardReaderEvent",
      (event) => {
        console.info({ event });
        // WriteLog("CreditStart event message is" + event.message);
        // console.log("event message is", event.message);
        // eslint-disable-next-line no-empty

        if (!(event.message === "")) {
          if (event.message === "DEFERRED") {
            checkPendingTransactionsThenCreateOrder();
          } else if (event.message === "DECLINED") {
            if (event.ref_id === reference_id) {
              // reason "Device Error (COMM_ERROR)"
              if (event?.reason?.includes("User cancelled")) {
                recreateOrder();
              } else {
                setReaderEvent("DECLINED");
              }
            }
          } else if (event["On EMV START"] === "no reader connected EMV") {
            setReaderEvent(event.message);
          } else {
            setReaderEvent(event.message);
          }
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    ACService.startEMV(
      ppsTotal,
      reference_id,
      JSON.stringify({ items: updated_items, data: metaData }),
      (selectedLocation.dynamic_descriptor !== null && selectedLocation.dynamic_descriptor !== "")
        ? selectedLocation.dynamic_descriptor
        : selectedEvent.dynamic_descriptor,
      allowBatchMode
    );
    // }
  }, []);

  const createNewOrder = async ({ ...props }) => {
    createOrder({
      offlineMode,
      methodOfPayment: "credit",
      referenceId: reference_id,
      ...props,
    });
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onTransactionCompleted",
      (event) => {
        WriteLog("CreditStart on transaction completed" + event + reference_id);
        console.log("on transaction completed", event, reference_id);
        const { cardReader, customFields, endpoint, ...completedTransaction } =
          JSON.parse(event.transaction) || {};
        setTransaction(JSON.parse(event.transaction));
        createNewOrder({
          deferred: false,
          transactionData: {
            mx_ref_id: event.invoiceNumber,
            ...completedTransaction,
          },
        });
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const zeroDollarTransaction = () => {
    const { cardReader, customFields, endpoint, ...completedTransaction } = {
      eventType: "PaymentSuccess",
      mx_ref_id: "ManualZero",
      totalAmount: 0,
      responseMessage: "Approved or completed successfully",
      transactionDate: transaction_time,
    };

    createNewOrder({
      deferred: false,
      transactionData: {
        mx_ref_id: "ManualZero",
        ...completedTransaction,
      },
    });
    navigation.navigate("TransactionCompletedStepCredit", {
      reference_id,
    });
  };

  // const postDeclinedTransaction = () => {
  //   ACService.cancelTransaction(reference_id);
  //   const { cardReader, customFields, endpoint, ...completedTransaction } = {
  //     eventType: "PaymentFailure",
  //     mx_ref_id: "Declined",
  //     totalAmount: ppsTotal,
  //     responseMessage: "Approved or completed successfully",
  //     transactionDate: transaction_time,
  //   };
  //
  //   createNewOrder({
  //     deferred: false,
  //     transactionData: {
  //       mx_ref_id: "Declined",
  //       ...completedTransaction,
  //     },
  //   });
  // };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onTransactionFailed",
      (event) => {
        DdLogs.info(
          '"Card Present" Transaction failed (deferred offline or decline)',
          { event }
        );
        if (event.includes("TIMEOUT")) {
          WriteLog("CreditStart timed out");
          console.log("timed out");
          setIsTimedOut(true);
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onTransactionCancelled",
      (event) => {
        WriteLog("CreditStart transaction cancelled");
        console.log("transaction cancelled");
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const fetchRefTransaction = async () => {
    const currentTransaction = await ACService.showCurrentTransaction();
  };

  const retryCurrentTransaction = async () => {
    setRetryTransaction(true);
    await ACService.cancelTransaction(reference_id);
  };

  useEffect(() => {
    if (
      connectionStatus == "CONNECTED" &&
      controllerConnectionStatus === "DISCONNECTED"
    ) {
      setConnectionStatus(controllerConnectionStatus);
      fetchRefTransaction();
    } else if (
      connectionStatus == "DISCONNECTED" &&
      controllerConnectionStatus === "CONNECTED"
    ) {
      retryCurrentTransaction();
      setConnectionStatus(controllerConnectionStatus);
    }
  }, [controllerConnectionStatus, connectionStatus]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onCardReaderError",
      (event) => {
        console.info({ event });
        WriteLog("CreditStart onCardReaderError" + event.message);
        console.log("onCardReaderError", event.message);
        setReaderError(event.message);
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleRestart = () => {
    ACService.cancelTransaction(reference_id);
    if (props?.route?.params?.fromPaymentMethod == "qr_code") {
      selectedMenu?.is_tips
        ? navigation.navigate("TipStepQRCode")
        : navigation.navigate("QRCodeReaderReady");
    } else if (props?.route?.params?.fromPaymentMethod == "rfid") {
      selectedMenu?.is_tips
        ? navigation.navigate("TipStepRfid")
        : navigation.navigate("ReaderReady");
    }
    else {
      navigation.goBack();
    }
  };

  const PaymentPrompt = ({
    readerEvent: paymentReaderEvent,
    handleRestart,
  }) => {
    WriteLog("CreditStart paymentReaderEvent" + paymentReaderEvent);
    console.log({ paymentReaderEvent });
    if (paymentReaderEvent === "Please Wait") {
      WriteLog("CreditStart payment reader event is" + paymentReaderEvent);
      console.log("payment reader event is", paymentReaderEvent);
      return (
        <View style={styles.prompt}>
          <Heading variants="h2" style={styles.paymentReaderEvent}>
            {paymentReaderEvent}
          </Heading>
          <OrderTotal />
          <Spinner size="giant" />
        </View>
      );
    }

    if (paymentReaderEvent === "DECLINED") {
      WriteLog("CreditStart payment reader event is" + paymentReaderEvent);
      console.log("payment reader event is", paymentReaderEvent);
      // postDeclinedTransaction();
      let message = "declined";
      if (isTimedOut) {
        message = "timed out";
      }
      return (
        <TransactionDeclinedCredit
          setReaderEvent={setReaderEvent}
          message={message}
          isTimedOut={isTimedOut}
          setIsTimedOut={setIsTimedOut}
          handleRestart={handleRestart}
          refId={reference_id}
        />
      );
    }

    if (
      paymentReaderEvent === "APPROVED" ||
      paymentReaderEvent === "DEFERRED"
    ) {
      return <TransactionApprovedCredit reference_id={reference_id} />;
    }
    if (
      paymentReaderEvent === "Insert, Swipe, or Tap Card" ||
      "Insert or Tap Card" ||
      "PRESENT_CARD"
    ) {
      WriteLog("CreditStart payment reader event is" + paymentReaderEvent);
      console.log("payment reader event is", paymentReaderEvent);
      return (
        <View style={styles.prompt}>
          {props?.route?.params?.fromPaymentMethod && (
            <Heading variants="h2" style={styles.paymentReaderEvent}>
              Please Associate a Credit/Debit Card for Future Payments
            </Heading>
          )}
          <Heading variants="h2" style={styles.paymentReaderEvent}>
            Insert, Swipe, or Tap Card
          </Heading>
          <OrderTotal />
          <InsertCardIcons />
          <Row>
            <View style={styles.sameWidth}>
              <CancelButton onPress={handleRestart} buttonName="Cancel" />
            </View>
          </Row>
          {total_paid === 0 && (
            <Row>
              <View style={styles.sameWidth}>
                <CancelButton
                  onPress={() => {
                    zeroDollarTransaction();
                  }}
                  buttonName="Comp Order Completion"
                />
              </View>
            </Row>
          )}
        </View>
      );
    }

    if (
      paymentReaderEvent === "REMOVE_CARD" ||
      "AUTHORISING" ||
      "Please Wait"
    ) {
      WriteLog("CreditStart payment reader event is" + paymentReaderEvent);
      console.log("payment reader event is", paymentReaderEvent);
      console.log({ paymentReaderEvent });
      return (
        <View>
          <Text category="h4">{paymentReaderEvent}</Text>
          <Spinner />
        </View>
      );
    }

    return <Text> Catch Payment Prompt</Text>;
  };

  PaymentPrompt.propTypes = {
    readerEvent: PropTypes.string.isRequired,
  };

  const SwipeButton = () => (
    <View>
      <Button
        title="Toggle Swipe"
        style={styles.button}
        status="primary"
        size="medium"
        onPress={toggleSwipe}
      >
        Toggle Swipe
      </Button>
    </View>
  );

  return (
    <View style={styles.prompt}>
      {!connected || controllerConnectionStatus == "CONNECTING" ? (
        <ConnectPrompt
          connectionStatus={controllerConnectionStatus}
          onClose={handleRestart}
        />
      ) : (
        <PaymentPrompt
          readerEvent={readerEvent}
          handleRestart={handleRestart}
        />
      )}
    </View>
  );
};
