import { Alert } from "react-native";
import { WriteLog } from "../../../../../src/CommonLogFile";

export const UnavailableOrderHistoryAlert = () => {
  Alert.alert("", `You must first configure the POS to see the order history`, [
    {
      text: "Close",
      onPress: () => {
        console.log("OK Pressed"),
          WriteLog(
            "UnavailableOrderHistoryAlert You must first configure the POS to see the order history"
          );
      },
    },
  ]);
};
