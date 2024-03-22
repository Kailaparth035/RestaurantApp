import { Icon, useTheme, Button, Input } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { NormalisedSizes, NormalisedFonts } from "../../../../hooks/Normalized";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { Label, Heading } from "../../../atoms/Text/index";
import { Block, Box, Flex } from "../../../layouts/Index";
import { Filter } from "./FilterOrderHistory";
import { FocusCart } from "./FocusCart";
import { OrderHistoryContext } from "./OrderHistoryContext";
import { OrderHistoryItem } from "./OrderHistoryItem";
import { AuthContext, useAuth } from "../../../../contexts/AuthContext";
import { REFUND_ORDER, getOrderId } from "../../../../fragments/resolvers";
import { useApolloClient } from "@apollo/client";
import {
  formatCentsForUiDisplay,
  displayForLocale,
  getOrderTotal,
} from "../../../../helpers/calc";
import { ConfirmationModal } from "../../ConfirmationModal";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Q } from "@nozbe/watermelondb";
import { useNavigation } from "@react-navigation/native";
import { WriteLog } from "../../../../../src/CommonLogFile";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

const pageSize = 10;

const styles = StyleSheet.create({
  GapFilter: {
    marginBottom: NormalisedSizes(24),
    // width: "auto",
    flex: 1,
  },
});

function BackIcon(props) {
  const theme = useTheme();
  return (
    <Icon
      style={{
        tintColor: theme["color-basic-600"],
        width: NormalisedSizes(24),
        height: NormalisedSizes(24),
      }}
      name="arrow-ios-back-outline"
      animation="pulse"
    />
  );
}

function OrderHistoryView({ variants, props }) {
  const database = useDatabase();
  const navigation = useNavigation();
  const client = useApolloClient();

  const { focusOrder, setFocusOrder, order, setOrder } =
    useContext(OrderHistoryContext);
  const {
    tabletSelections: { event: selectedEvent },
  } = useContext(AuthContext);
  const [orderHistory, setOrderHistory] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refundOrderLoading, setRefundOrderLoading] = useState(false);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [skipData, setSkipData] = useState(0);
  const handleItemOnPress = (orderData) => {
    setOrder(orderData);
    setFocusOrder(true);
  };
  let ordersTotal;
  let showVoid_time = false;
  if (order !== null) {
    ordersTotal = getOrderTotal(order);
    let transactionDate = order._raw.transaction_at;
    let current_date = Math.round(new Date().getTime() / 1000);
    showVoid_time =
      transactionDate - current_date > 24 * 60 * 60 * 1000 ? true : false;
  }

  const voidTransaction = async () => {
    setRefundOrderLoading(true);

    let reference_id = order?.reference_id;
    try {
      let orderId = await client.query({
        query: getOrderId,
        variables: {
          reference_id,
        },
      });
      refundTransaction(orderId.data.orders[0].id, reference_id);
    } catch (error) {
      setRefundOrderLoading(false);
      // console.log("error ::", error);
      alert("Something went wrong");
    }
  };

  const refundTransaction = async (orderId, reference_id) => {
    const RefundsInsertInput = {
      order_id: orderId,
      amountRefund: getOrderTotal(order),
      fullRefund: true,
      paymentType: order?.payment_method,
      totals: getOrderTotal(order),
      notes: "Refunded from POS app",
    };
    try {
      await client.mutate({
        mutation: REFUND_ORDER,
        variables: {
          object: RefundsInsertInput,
        },
      });

      try {
        let record = await database.collections
          .get("orders")
          .query(Q.where("reference_id", reference_id))
          .fetch();
        await database.action(async () => {
          await record[0].update((record) => {
            record.status = "refund";
          });
        });
      } catch (error) {
        WriteLog("OrderHistoryView error " + error);
        console.log("error :::", error);
      }
      setRefundOrderLoading(false);
      setVisible(false);
    } catch (error) {
      setRefundOrderLoading(false);
      setVisible(false);
      // console.log("error ::", error);
      alert(error.message);
    }
  };

  const handleReceipt = () => {
    let reference_id = order?.reference_id;
    navigation.navigate("EnterPhoneNumberStepCredit", { reference_id });
  };

  useEffect(() => {
    getOrderHistory();
  }, []);

  const getOrderHistory = async () => {
    setLoading(true);
    const fetchedOrders = await database.collections
        .get("orders")
        .query(
            Q.where("event_id", selectedEvent?.eventId),
            Q.sortBy("transaction_time", "desc"),  // This remains as it is
            Q.skip(skipData),
            Q.take(pageSize)
        )
        .fetch();
    // Convert and sort the fetchedOrders
    const sortedOrders = fetchedOrders.sort((a, b) => {
      const dateA = new Date(a.transaction_time).getTime();
      const dateB = new Date(b.transaction_time).getTime();
      return dateB - dateA;  // For descending order
    });

    // console.log("sortedOrders :::", sortedOrders);

    if (sortedOrders.length !== 0) {
      const newData = [...orderHistory, ...sortedOrders];
      setOrderHistory(newData);
      setShowMore(true);
    } else {
      setShowMore(false);
    }
    setSkipData(skipData + pageSize);
    setLoading(false);
  };
  return (
    <Box width="100%" height="100%">
      <Flex flexDirection="row" width="100%">
        {focusOrder && (
          <Box width="100%">
            <Flex width="100%" flexDirection="row">
              <ScrollView style={{ width: "100%" }}>
                <Box width="100%" padding={NormalisedSizes(24)}>
                  <Flex flexDirection="row">
                    <Block style={styles.GapFilter}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <ButtonExtended
                          accessoryLeft={BackIcon}
                          onPress={() => setFocusOrder(false)}
                          status="secondary"
                          size="large"
                          appearance="filled"
                          style={{ width: 200 }}
                        >
                          <Label buttonLabel="LabelLargeBtn">
                            back to list
                          </Label>
                        </ButtonExtended>
                        {order.payment_method !== "cash" &&
                          order.status !== "refund" &&
                          showVoid_time && (
                            <View style={{ flexDirection: "row" }}>
                              {/*<ButtonExtended*/}
                              {/*  status="tertiary"*/}
                              {/*  onPress={() => handleReceipt()}*/}
                              {/*  size="large"*/}
                              {/*  appearance="filled"*/}
                              {/*  style={{ width: 140, marginRight: 5 }}*/}
                              {/*>*/}
                              {/*  <Label buttonLabel="LabelLargeBtn">*/}
                              {/*    SMS Receipt*/}
                              {/*  </Label>*/}
                              {/*</ButtonExtended>*/}
                              <ButtonExtended
                                status="primary"
                                onPress={() => setVisible(true)}
                                size="large"
                                appearance="filled"
                                style={{ width: 140, marginLeft: 5 }}
                              >
                                <Label buttonLabel="LabelLargeBtn">Void</Label>
                              </ButtonExtended>
                            </View>
                          )}
                      </View>
                    </Block>
                  </Flex>
                  <Block>
                    <OrderHistoryItem variants="focused" order={order} />
                  </Block>
                </Box>
              </ScrollView>
              <FocusCart
                variants={variants}
                order={order}
                width={NormalisedSizes(495)}
              />
            </Flex>
          </Box>
        )}

        <Box width="100%" padding={NormalisedSizes(24)}>
          <Box width="100%" height={370}>
            {/*<Block style={{}}>*/}
            {/*  <Filter />*/}
            {/*</Block>*/}

            <Block
              width={variants === "admin" ? "100%" : "80%"}
              paddingTop={NormalisedSizes(10)}
            >
              {orderHistory.length > 0 && (
                <FlatList
                  data={orderHistory}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={() => {
                    return (
                      <>
                        {orderHistory.length >= pageSize && showMore && (
                          <View
                            style={{
                              marginVertical: 30,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ButtonExtended
                              onPress={() => getOrderHistory()}
                              status="primary"
                              size="large"
                              appearance="filled"
                              style={{ width: 140 }}
                            >
                              {!loading ? (
                                <Label buttonLabel="LabelLargeBtn">
                                  Show More
                                </Label>
                              ) : (
                                <ActivityIndicator color={"#ffffff"} />
                              )}
                            </ButtonExtended>
                          </View>
                        )}
                      </>
                    );
                  }}
                  renderItem={({ item, index }) => {
                    return (
                      <OrderHistoryItem
                        key={index}
                        order={item}
                        onPress={() => handleItemOnPress(item)}
                      />
                    );
                  }}
                />
              )}
            </Block>
          </Box>
        </Box>
        <ConfirmationModal
          actionType={"voidAction"}
          orderTotal={ordersTotal / 100}
          visible={visible}
          setVisible={setVisible}
          fromOverflow
          voidTransaction={() => voidTransaction()}
          refundOrderLoading={refundOrderLoading}
        />
      </Flex>
    </Box>
  );
}

export function PasswordProtectedOrderHistoryView(props) {
  const { organizerUser, employeeUser } = useAuth();
  const [password, setPassword] = React.useState("");
  const [showOrderHistory, setshowOrderHistory] = React.useState("");

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

  const handlePasswordSubmit = () => {
    if (password.length === 5) {
      if (
        password == employeeUser.tablet_access_code ||
        password == organizerUser.tablet_access_code
      ) {
        setshowOrderHistory(true);
      } else {
        Alert.alert("", `Invalid Pin, Please try again.`, [
          {
            text: "Close",
            onPress: () => {
              console.log("Invalid Pin, Please try again."),
                WriteLog("OrderHistoryView Invalid Pin, Please try again.");
            },
          },
        ]);
      }
    } else {
      Alert.alert("", `Please enter 5 digit pin.`, [
        {
          text: "Close",
          onPress: () => {
            console.log("Please enter 5 digit pin."),
              WriteLog("OrderHistoryView Please enter 5 digit pin.");
          },
        },
      ]);
    }
  };

  if (showOrderHistory) {
    return <OrderHistoryView {...props} />;
  }
  return (
    <Box level="1" width="100%" style={styles.prompt}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Flex style={styles.validateFlex}>
          <Block style={styles.heading}>
            <Heading variants="h2">Please Enter Organizer or Clerk Access Code.</Heading>
          </Block>
          <Input
            keyboardType="number-pad"
            disableFullscreenUI
            // autoFocus
            secureTextEntry
            value={password}
            // onChange={(value) => setPin(value)}
            onChangeText={(text) => {
              setPassword(text);
            }}
            placeholder="PIN"
            onSubmitEditing={() => {
              handlePasswordSubmit();
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
              handlePasswordSubmit();
            }}
          >
            Submit Password
          </Button>
        </Flex>
      </ScrollView>
    </Box>
  );
}

export default OrderHistoryView;
