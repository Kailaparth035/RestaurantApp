import React, { Component } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ButtonExtended } from "../../../../components/atoms/Button/Button";
import { Heading, Label } from "../../../../components/atoms/Text";
import { Box } from "../../../../components/layouts/BoxContainer";
import { Block } from "../../../../components/layouts/block";
import { Flex } from "../../../../components/layouts/flex";
import { NormalisedSizes } from "../../../../hooks/Normalized";
import ACModule from "../../../../services/ACService";
import { useAuth } from "../../../../contexts/AuthContext";
import ModalHeaderTitle from "./ModalHeaderTitle";
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

const RelaunchAppModal = ({ onCloseModal }) => {
  const { clearOrganizerUser } = useAuth();

  const handleReLaunch = async (type) => {
    if (type === "Logout") {
      clearOrganizerUser();
    }
    setTimeout(() => {
      ACModule.reLaunchApp();
    }, 500);
  };
  return (
    <View style={styles.container}>
      <View style={styles.modalMainView}>
        <ModalHeaderTitle onclose={() => onCloseModal()} title="Relaunch App" />

        <View style={styles.textViewStyle}>
          <Text style={{ fontSize: 17, fontWeight: "600" }}>
            Log out of Clerk and Organizer, and Relaunch?
          </Text>
        </View>
        <Flex flexDirection="column" alignItems="center">
          <ButtonExtended
            size="medium"
            status="primary"
            style={styles.buttonStyle}
            onPress={() => {
              handleReLaunch("Logout");
            }}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="regular"
              style={{ alignItem: "center" }}
            >
              Logout and Relaunch
            </Label>
          </ButtonExtended>
          <ButtonExtended
            size="medium"
            status="tertiary"
            style={[
              styles.buttonStyle,
              {
                marginTop: 10,
              },
            ]}
            onPress={() => handleReLaunch("")}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="regular"
              style={{ alignItem: "center" }}
            >
              Relaunch
            </Label>
          </ButtonExtended>
        </Flex>
      </View>
    </View>
  );
};

export default RelaunchAppModal;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  modalMainView: {
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.4,
    width: SCREEN_WIDTH * 0.5,
    borderColor: "black",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
  },
  textViewStyle: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStyle: {
    width: NormalisedSizes(440),
    marginHorizontal: 5,
    marginTop: 60,
    alignSelf: "center",
  },
});
