import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./DatabaseReset";
import { Label } from "../../../atoms/Text";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { NormalisedSizes } from "../../../../hooks/Normalized";
import ModalHeaderTitle from "./ModalHeaderTitle";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { AuthContext } from "../../../../contexts/AuthContext";
import ACService from "../../../../services/ACService";
import { Q } from "@nozbe/watermelondb";
import { Spinner } from "@ui-kitten/components";
import { WriteLog } from "../../../../../src/CommonLogFile";

const PendingSync = ({ setProcessingStatusModal }) => {
  const database = useDatabase();

  const { syncService } = useContext(AuthContext);
  const [offlineTxs, setOfflineTxs] = useState({});
  const [loading, setLoading] = useState(false);
  const [syncProcessingLoader, setSyncProcessingLoader] = useState(false);
  const [syncOrderLoader, setSyncOrderLoader] = useState(false);
  const [numberOfLocalOrders, setNumberOfLocalOrders] = useState(0);
  const [numberOfPushedOrders, setNumberOfPushedOrders] = useState(0);

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

  const fetchOfflineTxs = async (key) => {
    if (key === "syncing") {
      setSyncProcessingLoader(true);
    }
    try {
      const txs = await ACService.showPendingOfflineTransactions();
      setOfflineTxs(txs);
    } catch (error) {
      console.error("Error fetching offline transactions:", error);
    } finally {
      setSyncProcessingLoader(false);
      setLoading(false);
    }
  };

  const getOrderDetails = async (key) => {
    if (key === "refresh") {
      setLoading(true);
    }
    try {
      const localOrdersCount = await database
        .get("orders")
        .query()
        .fetchCount();
      setNumberOfLocalOrders(localOrdersCount);

      const pushedOrdersCount = await database
        .get("orders")
        .query(Q.where("is_pushed", true))
        .fetchCount();
      setNumberOfPushedOrders(pushedOrdersCount);
    } catch (err) {
      WriteLog("PendingSync err  " + err);
      console.log(err);
    }
  };
  // const syncOrders = async () => {
  //   setSyncOrderLoader(true);
  //   if (numberOfPushedOrders < numberOfLocalOrders) {
  //     try {
  //       const { error } = await syncService.orderSync();
  //     } catch (err) {
  //       console.log("Error during sync:", err);
  //     } finally {
  //       setSyncOrderLoader(false);
  //     }
  //   } else {
  //     setSyncOrderLoader(false);
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style={styles.modalMainView}>
        <ModalHeaderTitle
          onclose={() => setProcessingStatusModal()}
          title="PENDING SYNC"
        />
        <View style={styles.textViewStyle}>
          <Text style={{ fontSize: 17, fontWeight: "400" }}>
            Orders Synced to Server :
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {numberOfPushedOrders}/{numberOfLocalOrders}
          </Text>
        </View>
        <View style={[styles.textViewStyle, { marginTop: 15 }]}>
          <Text style={{ fontSize: 17, fontWeight: "400" }}>
            Deferred Orders Awaiting Processing :
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {offlineTxs?.size || 0}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: 100,
          }}
        >
          {/*{!syncOrderLoader ? (*/}
          {/*  <ButtonExtended*/}
          {/*    // size="medium"*/}
          {/*    status="primary"*/}
          {/*    style={{*/}
          {/*      width: NormalisedSizes(285),*/}
          {/*      marginHorizontal: 5,*/}
          {/*    }}*/}
          {/*    onPress={() => syncOrders()}*/}
          {/*  >*/}
          {/*    <Label*/}
          {/*      buttonLabel="LabelLargeBtn"*/}
          {/*      variants="label"*/}
          {/*      variantStyle="regular"*/}
          {/*      style={{ alignItem: "center" }}*/}
          {/*    >*/}
          {/*      Sync Pending Orders*/}
          {/*    </Label>*/}
          {/*  </ButtonExtended>*/}
          {/*) : (*/}
          {/*  <ButtonExtended*/}
          {/*    status="basic"*/}
          {/*    size="medium"*/}
          {/*    style={{*/}
          {/*      width: NormalisedSizes(285),*/}
          {/*      marginHorizontal: 5,*/}
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
          {/*{!syncProcessingLoader ? (*/}
          {/*  <ButtonExtended*/}
          {/*    status="primary"*/}
          {/*    style={{ width: NormalisedSizes(285), marginHorizontal: 5 }}*/}
          {/*    onPress={() => fetchOfflineTxs("syncing")}*/}
          {/*  >*/}
          {/*    <Label*/}
          {/*      buttonLabel="LabelLargeBtn"*/}
          {/*      variants="label"*/}
          {/*      variantStyle="regular"*/}
          {/*    >*/}
          {/*      Sync Deferred Orders*/}
          {/*    </Label>*/}
          {/*  </ButtonExtended>*/}
          {/*) : (*/}
          {/*  <ButtonExtended*/}
          {/*    status="basic"*/}
          {/*    style={{*/}
          {/*      width: NormalisedSizes(285),*/}
          {/*      marginHorizontal: 5,*/}
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
        </View>
      </View>
    </View>
  );
};

export default PendingSync;

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalMainView: {
    height: SCREEN_HEIGHT * 0.6,
    width: SCREEN_WIDTH * 0.6,
    display: "flex",
    borderColor: "black",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 5,
    padding: SCREEN_HEIGHT * 0.05,
  },
  textViewStyle: {
    marginTop: SCREEN_HEIGHT * 0.1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
