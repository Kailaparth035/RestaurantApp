import { MenuItem, useTheme } from "@ui-kitten/components";
import React, { useContext } from "react";
import { NormalisedFonts, NormalisedSizes } from "../../../../hooks/Normalized";
import { LogoutIcon } from "../../../atoms/Icons/Icons";
import { Subtitle } from "../../../atoms/Text/index";
import { Block, Box, Flex } from "../../../layouts/Index";
import { NavigationAdminContext } from "./NavigationAdminContext";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../../contexts/AuthContext";
import NewSyncService from "../../../../services/new_sync/newSyncService";
import { useDatabase } from "@nozbe/watermelondb/hooks";

export function NavigationAdmin(props) {
  const { navigation, setNavigation } = useContext(NavigationAdminContext);

  const theme = useTheme();
  const nav = useNavigation();
  const { offlineMode } = useAuth();
  const database = useDatabase();

  let rfidRecordSyncTimeoutIds = [];

  const recursiveRfidRecordSync = async () => {
    console.log("@@===recursiveRfidRecordSync===")
    rfidRecordSyncTimeoutIds.forEach((id) => clearTimeout(id));
    if (rfidRecordSyncTimeoutIds.length > 5) {
      rfidRecordSyncTimeoutIds = rfidRecordSyncTimeoutIds.slice(-5);
    }
    try {
      if (!offlineMode) {
        const newSyncRfidRecord = new NewSyncService({
          database,
          organizationId: 0,
          eventId: 0,
        });
        await Promise.all([
          newSyncRfidRecord.newRfidRecordSync(),
        ]);
        // setSyncService(newSyncOrders);
      }
      rfidRecordSyncTimeoutIds.push(setTimeout(recursiveRfidRecordSync, 60000));
    } catch (error) {
      console.error("Error in recursiveOrderSync:", error);
    }
  };
  return (
    <Box
      width={NormalisedSizes(312)}
      height="100%"
      style={{
        borderRightWidth: NormalisedSizes(2),
        borderColor: theme["color-basic-25"],
        marginTop: NormalisedSizes(12),
      }}
      {...props}
    >
      <Flex flexDirection="column" height="100%" justifyContent="space-between">
        <Block width="100%">
          <NavigationItem
            variants={navigation === "OrderHistory" ? "focused" : "default"}
            name="Order History"
            onPress={() =>
              navigation !== "OrderHistory"
                ? setNavigation("OrderHistory")
                : null
            }
            iconName="search"
          />
          <NavigationItem
            variants={navigation === "RFID Lookup" ? "focused" : "default"}
            name="RFID Lookup"
            onPress={() =>
              navigation !== "RFID Lookup" ? setNavigation("RFID Lookup") : null
            }
            iconName="search-outline"
          />
          <NavigationItem
            variants={navigation === "Add Cash" ? "focused" : "default"}
            name=" $  Add Cash Balance"
            onPress={() =>
              navigation !== "Add Cash" ? setNavigation("Add Cash") : null
            }
            iconName=""
          />
          <NavigationItem
            variants={navigation === "Add Promo" ? "focused" : "default"}
            name="Add Promo Balance"
            onPress={() =>
              navigation !== "Add Promo" ? setNavigation("Add Promo") : null
            }
            iconName="gift-outline"
          />
          <NavigationItem
            variants={navigation === "Add Token" ? "focused" : "default"}
            name="Add Token Balance"
            onPress={() =>
              navigation !== "Add Token" ? setNavigation("Add Token") : null
            }
            iconName="award-outline"
          />
          <NavigationItem
            variants={navigation === "Refund Cash" ? "focused" : "default"}
            name=" $  Refund Cash Balance"
            onPress={() =>
              navigation !== "Refund Cash" ? setNavigation("Refund Cash") : null
            }
            iconName=""
          />
          <NavigationItem
            variants={
              navigation === "Ticket Redemption" ? "focused" : "default"
            }
            name=" $  Ticket Redemption"
            onPress={() =>
              navigation !== "Ticket Redemption"
                ? (nav.navigate("TicketRedemption"), recursiveRfidRecordSync())
                : null
            }
            iconName=""
          />
        </Block>
      </Flex>
    </Box>
  );
}
