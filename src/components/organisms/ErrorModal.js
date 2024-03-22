/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */

import { useNavigation } from "@react-navigation/native";
import { Button, Card, Modal } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BoxShadow } from "react-native-shadow";
import { NormalisedSizes } from "../../hooks/Normalized";
import { ButtonExtended } from "../atoms/Button/Button";
import { CloseIcon } from "../atoms/Icons/Icons";
import { Heading, Label, Paragraph } from "../atoms/Text";
import Row from "../particles/Row";

const shadowOpt = {
  width: NormalisedSizes(423),
  height: NormalisedSizes(334),
  color: "#000",
  border: NormalisedSizes(24),
  radius: NormalisedSizes(8),
  opacity: 0.13,
  x: NormalisedSizes(1),
  y: NormalisedSizes(8),
};

export function ErrorModal({ message, visible, setVisible, route }) {
  const navigation = useNavigation();

  const handlePress = () => {
    setVisible(false);
    if (route && route?.params?.routeNavigator === "RFID ASSOCIATION") {
      return navigation.navigate("Menu");
    }
  };

  const handleCloseX = () => {
    setVisible(false);
    if (route && route?.params?.routeNavigator === "RFID ASSOCIATION") {
      return navigation.navigate("Menu");
    }
  };

  const errorTitle = () => {
    if (route?.name === "Login") {
      return "Unable to log in";
    }
    if (route && route?.params?.routeNavigator === "RFID ASSOCIATION") {
      return "Contact customer service";
    }
  };

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => setVisible(false)}
    >
      <View style={styles.container}>
        <BoxShadow setting={shadowOpt}>
          <Card
            disabled
            style={{
              minWidth: NormalisedSizes(423),
              minHeight: NormalisedSizes(334),
              borderRadius: NormalisedSizes(8),
              borderWidth: 0,
              position: "relative",
            }}
          >
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                appearance="ghost"
                status="basic"
                size="medium"
                accessoryLeft={CloseIcon}
                onPress={handleCloseX}
                style={{
                  position: "absolute",
                  left: "-13.5%",
                }}
              />
              <Heading variants="h4">{errorTitle()}</Heading>
            </Row>
            <Row style={{ marginVertical: NormalisedSizes(56) }}>
              <Paragraph
                variants="p1"
                variantStyle="bold"
                style={{
                  textAlign: "center",
                  flex: 1,
                }}
              >
                {message}
              </Paragraph>
            </Row>
            <Row
              style={{
                justifyContent: "center",
                height: NormalisedSizes(72),
              }}
            >
              <ButtonExtended
                // onPress={() => setVisible(false)}
                size="medium"
                style={{ width: NormalisedSizes(184), marginHorizontal: 5 }}
                onPress={handlePress}
              >
                <Label
                  buttonLabel="LabelLargeBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  OK
                </Label>
              </ButtonExtended>
            </Row>
          </Card>
        </BoxShadow>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
