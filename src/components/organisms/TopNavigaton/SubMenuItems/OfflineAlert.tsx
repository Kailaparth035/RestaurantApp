import { Q } from "@nozbe/watermelondb";
import { Alert } from "react-native";
import { WriteLog } from "../../../../../src/CommonLogFile";

export const HandleOfflineAlert = async (
  database: any,
  // syncService: any,
  error?: string
) => {
  let numberOfLocalOrders = 0;
  let numberOfpushedOrders = 0;
  try {
    numberOfLocalOrders = await database.get("orders").query().fetchCount();

    numberOfpushedOrders = await database
      .get("orders")
      .query(Q.where("is_pushed", true))
      .fetchCount();

    // const syncOrders = async (sync: any) => {
      // const { error } = await sync.orderSync();
      // if (!error) {
      //   HandleOfflineAlert(database, syncService);
      // } else {
      //   HandleOfflineAlert(database, syncService, error);
      // }
    // };

    Alert.alert(
      error,
      `Orders synced: ${numberOfpushedOrders} / ${numberOfLocalOrders}`,
      [
        {
          text: "Refresh",
          onPress: () => {
            // if (numberOfpushedOrders < numberOfLocalOrders) {
            //   // syncOrders(syncService);
            // } else {
            //   HandleOfflineAlert(database, syncService);
            // }
          },
        },
        {
          text: "Close",
          onPress: () => {
            console.log("OK Pressed"), WriteLog("OfflineAlert OK Pressed");
            1;
          },
        },
      ]
    );
  } catch (err) {
    WriteLog("OfflineAlert  err" + err);
    console.log(err);
  }
};
