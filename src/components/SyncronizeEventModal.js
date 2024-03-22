import React, { Component } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { NormalisedSizes } from "../hooks/Normalized";
import Images from "../Images";

const SyncronizeEventModal = ({ isSynchronized, eventName }) => {
  return (
    <View>
      <View style={styles.mainView}>
        <Text style={styles.text}>{eventName} </Text>
        <View style={styles.line} />
        {!isSynchronized ? (
          <ActivityIndicator color="black" />
        ) : (
          <Image
            source={Images.checkmark_circle_outline}
            style={{
              width: NormalisedSizes(25),
              height: NormalisedSizes(25),
              tintColor: "green",
            }}
          />
        )}
      </View>
    </View>
  );
};

export default SyncronizeEventModal;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: NormalisedSizes(10),
    width: NormalisedSizes(450),
  },
  text: {
    fontSize: NormalisedSizes(30),
  },
  line: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderStyle: "dotted",
    top: NormalisedSizes(9),
    marginHorizontal: NormalisedSizes(5),
  },
});
