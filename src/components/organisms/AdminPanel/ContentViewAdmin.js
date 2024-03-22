// import { useTheme } from "@ui-kitten/components";
import { Spinner } from "@ui-kitten/components";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { NormalisedSizes } from "../../../hooks/Normalized";
import { Block, Box } from "../../layouts/Index";
import { NavigationAdminContext } from "./Navigation/NavigationAdminContext";
import OrderHistoryProvider from "./OrderHistory/OrderHistoryContext";
import { PasswordProtectedOrderHistoryView } from "./OrderHistory/OrderHistoryView";
import AddCash from "./AddCash";
import RFIDLookupWithPassword from "./RfidLookup";
import AddPromoContainerWithPassword from "./AddPromo";
import RefundCashContainerWithPassword from "./RefundCash";
import AddToken from "./AddToken";

function MainContent({ organizationId, eventIds, variants, navigation }) {
  switch (navigation) {
    case "OrderHistory":
      return (
        <OrderHistoryProvider
          organizationId={organizationId}
          eventIds={eventIds}
        >
          <PasswordProtectedOrderHistoryView variants={variants} />
        </OrderHistoryProvider>
      );
      break;
    case "Printer Configuration":
      return (
        <Block style={styles.loadingBox}>
          <Block style={styles.loadingSpinner}>
            <Spinner />
          </Block>
        </Block>
      );
      break;
    case "RFID Lookup":
      return <RFIDLookupWithPassword />;
    case "Add Cash":
      return <AddCash />;
    case "Add Promo":
      return <AddPromoContainerWithPassword />;
    case "Add Token":
      return <AddToken />;
    case "Refund Cash":
      return <RefundCashContainerWithPassword />;
    default:
      return (
        <Block style={styles.loadingBox}>
          <Block style={styles.loadingSpinner}>
            <Spinner />
          </Block>
        </Block>
      );
      break;
  }
}

export function ContentViewAdmin({
  variants,
  eventIds,
  organizationId,
  ...props
}) {
  const { navigation } = useContext(NavigationAdminContext);

  return (
    <Box width={variants === "admin" ? NormalisedSizes(968) : "100%"}>
      {MainContent({ organizationId, eventIds, variants, navigation })}
    </Box>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    height: "100%",
    position: "relative",
    width: "100%",
  },

  loadingSpinner: {
    bottom: "50%",
    left: "50%",
    position: "absolute",
    right: "50%",
  },
});
