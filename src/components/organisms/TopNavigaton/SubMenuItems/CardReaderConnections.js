import React, {  useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Heading } from "../../../atoms/Text/index";
import ModalHeaderTitle from "./ModalHeaderTitle";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

export const CardReaderConnectionLogs = ({ onComplete, cardReaderContext }) => {
  const [offlineTxs, setOfflineTxs] = useState({});

  const {
    handleConnect,
    executionLogs = [],
    ...connectionDetails
  } = cardReaderContext;
  return (
    <View style={styles.container}>
      <View style={styles.modalMainView}>
        <ModalHeaderTitle
          onclose={() => onComplete()}
          title="Card Reader Details"
        />
        <View style={{ height: SCREEN_HEIGHT / 2, marginVertical: 10 }}>
          <Heading variants="h4">{`Card Reader Connection Details: `}</Heading>
          <ScrollView>
            {Object.keys(connectionDetails).map((key) => {
              if (key !== "size") {
                return <Text>{`${key}: ${connectionDetails[key]}`}</Text>;
              }
              return null;
            })}
          </ScrollView>
        </View>
      </View>
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
    width: SCREEN_WIDTH * 0.6,
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
