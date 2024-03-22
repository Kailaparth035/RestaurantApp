import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import ModalHeaderTitle from "./ModalHeaderTitle";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./DatabaseReset";
import { version } from "../../../../../package.json";
import { APPCENTER_BUILD_ID } from "@env";
import { AuthContext } from "../../../../contexts/AuthContext";
import RoninChipModule from "../../../../services/RoninChipService";
import { WriteLog } from "../../../../../src/CommonLogFile";

const AboutRoninModal = ({ setAboutRoninModal }) => {
  const { deviceId, firmwareVersion } = useContext(AuthContext);
  WriteLog("AboutRoninModal firmwareVersion" + firmwareVersion);
  console.log("firmwareVersion :::", firmwareVersion);

  return (
    <View style={styles.container}>
      <View style={styles.modalMainView}>
        <ModalHeaderTitle
          onclose={() => setAboutRoninModal()}
          title="About RONIN POS"
        />
        <View
          style={[
            styles.textViewStyle,
            {
              marginTop: 15,
            },
          ]}
        >
          <Text style={{ fontSize: 17, fontWeight: "400" }}>Version:</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {version}
          </Text>
        </View>
        <View
          style={[
            styles.textViewStyle,
            {
              marginTop: 5,
            },
          ]}
        >
          <Text style={{ fontSize: 17, fontWeight: "400" }}>App Build #:</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {APPCENTER_BUILD_ID}
          </Text>
        </View>
        <View
          style={[
            styles.textViewStyle,
            {
              marginTop: 5,
            },
          ]}
        >
          <Text style={{ fontSize: 17, fontWeight: "400" }}>
            Android Device ID:
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {deviceId}
          </Text>
        </View>
        <View
          style={[
            styles.textViewStyle,
            {
              marginTop: 5,
            },
          ]}
        >
          <Text style={{ fontSize: 17, fontWeight: "400" }}>
            PCB Firmware Version:
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 5 }}>
            {JSON.stringify(firmwareVersion)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AboutRoninModal;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalMainView: {
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.6,
    width: SCREEN_WIDTH * 0.5,
    display: "flex",
    borderColor: "black",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
  },
  textViewStyle: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
