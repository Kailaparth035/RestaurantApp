import { useTheme, Button } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { Heading, Label } from "../../atoms/Text";
import StyledTopBarWrapper from "./TopBar.styles";
import { useTransactionContext } from "../../../contexts/TransactionContext";
import { useAuth } from "../../../contexts/AuthContext";
import { GetBackTitle } from "../../../helpers/GetRouteStrings";
import { ButtonExtended } from "../../atoms/Button/Button";
import { BackIcon } from "../../atoms/Icons/Icons";

function TopBar(props) {
  const {
    tabletSelections: { event: selectedEvent, location: selectedLocation },
  } = useAuth();
  const eventName = selectedEvent.name;
  const location = selectedLocation.name;
  const theme = useTheme();
  const { setTip, updateOrderTotals } = useTransactionContext();

  const goBack = () => {
    setTip(0);
    // updateOrderTotals({tip: 0})
    props.navigation.goBack();
  };
  //console.log("props?.route?.name ===>", props?.route?.name);
  return (
    <StyledTopBarWrapper>
      <View
        style={[
          styles.mainView,
          {
            height:
              props?.route?.name === "TicketRedemption" ||
              props?.route?.name === "ScaningScreen" ||
              props?.route?.name === "TokenRedeemSuccessFail"
                ? 35
                : 30,
          },
        ]}
      >
        <View
          style={[
            styles.backOptionView,
            { flex: props?.route?.name === "TicketRedemption" ? 0.9 : 0.7 },
          ]}
        >
          {(props?.route?.name === "TicketRedemption" ||
            props?.route?.name === "ScaningScreen" ||
            props?.route?.name === "TokenRedeemSuccessFail") && (
            <ButtonExtended
              variants="default"
              appearance="ghost"
              accessoryLeft={BackIcon({ color: "white" })}
              status="basic"
              size="large"
              onPress={() =>
                props?.route?.name === "TicketRedemption"
                  ? props.navigation.navigate("AdminPanel", {
                      screen: "UserPasscode",
                    })
                  : props.navigation.goBack()
              }
            >
              <View>
                <Text style={styles.backText}>
                  {props?.route?.name === "TicketRedemption"
                    ? "Admin Panel"
                    : "Back"}
                </Text>
              </View>
            </ButtonExtended>
          )}
        </View>
        <View
          style={[
            styles.titleView,
            {
              flex: props?.route?.name === "TicketRedemption" ? 4 : 5,
              height:
                props?.route?.name === "TicketRedemption" ||
                props?.route?.name === "ScaningScreen" ||
                props?.route?.name === "TokenRedeemSuccessFail"
                  ? 35
                  : 30,
            },
          ]}
        >
          <Heading
            variants="h4"
            style={{
              color: `${theme["color-basic-100"]}`,
              textAlign: "center",
            }}
          >
            {eventName}
            {"\n"}
          </Heading>
          {(props?.route?.name === "TicketRedemption" ||
            props?.route?.name === "ScaningScreen" ||
            props?.route?.name === "TokenRedeemSuccessFail") && (
            <Heading
              variants="h4"
              style={{
                color: `${theme["color-basic-100"]}`,
                textAlign: "center",
                top: -10,
              }}
            >
              {location}
            </Heading>
          )}
        </View>
        <View style={styles.emptyView} />
      </View>
    </StyledTopBarWrapper>
  );
}

export default TopBar;

const styles = StyleSheet.create({
  icon: {
    left: "0%",
    paddingHorizontal: 25,
    position: "absolute",
  },
  mainView: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
  },
  backOptionView: {
    alignItems: "flex-start",
    justifyContent: "center",
    left: -10,
  },
  backText: { color: "white", fontSize: 17 },
  titleView: {
    flex: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyView: {
    flex: 0.7,
  },
});
