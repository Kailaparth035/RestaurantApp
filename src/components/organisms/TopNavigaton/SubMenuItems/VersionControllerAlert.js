import { APPCENTER_BUILD_ID, RONIN_CLIENT, RONIN_ENVIRONMENT } from "@env";
import { Alert } from "react-native";
import { version } from "../../../../../package.json";
import { WriteLog } from "../../../../../src/CommonLogFile";

export const HandleVersionAlert = async () => {
  Alert.alert(
    "About Ronin POS",
    `\tVersion ${version}\n
\tBuild ${APPCENTER_BUILD_ID}\n
\tEnvironment ${RONIN_ENVIRONMENT}\n
\tClient ${RONIN_CLIENT}\n
    `,
    [
      {
        text: "Close",
        onPress: () => {
          console.log("OK Pressed"),
            WriteLog("HandleVersionAlert About Ronin POS");
        },
      },
    ]
  );
};
