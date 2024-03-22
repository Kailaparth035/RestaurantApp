/* eslint-disable default-case */
import { Divider, useTheme } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import moment from "moment";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  formatCentsForUiDisplay,
  displayForLocale,
  getOrderTotal,
} from "../../../../helpers/calc";
import { NormalisedSizes } from "../../../../hooks/Normalized";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { Label, Paragraph, Subtitle } from "../../../atoms/Text";
import { Block, Box, Flex } from "../../../layouts/Index";
import { OrderHistoryContext } from "./OrderHistoryContext";

const styles = StyleSheet.create({
  itemGapBottom: {
    marginBottom: NormalisedSizes(4),
  },
});

const TagType = (type) => {
  const status = type.toLowerCase();
  switch (status) {
    case "processed":
      return "success";
    case "approved":
      return "success";
    case "void":
      return "warning";
    case "declined":
      return "danger";
    case "cancelled":
      return "danger";
    case "paid":
      return "success";
    case "refund":
      return "warning";
    case "pending":
      return "warning";
  }
};

export function OrderHistoryItem({ variants, order, ...props }) {
  const theme = useTheme();

  const { events, locations, users } = useContext(OrderHistoryContext);

  // console.log("@@====events========",events)
  // console.log("@@====locations========",locations)
  // console.log("@@====users========",users)
  // console.log("@@====order========",order)

  const event = events?.find(
    (eventData) => eventData._raw.event_id == order.event_id
  );

  const location = locations?.find(
    (locationData) => locationData._raw.location_id == order.location_id
  );

  const user = users?.find(
    (userData) => userData._raw.user_id == order.user_id
  );

  const orderTotal = getOrderTotal(order);
  return (
    <TouchableOpacity {...props}>
      <Box
        level={variants === "focused" ? "2" : "1"}
        padding={NormalisedSizes(12)}
      >
        <Block style={styles.itemGapBottom}>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Paragraph variants="p2">Ref ID: {order?.reference_id}</Paragraph>
            <Paragraph variants="p2">
              {moment.utc(order?.transaction_time).local().format("llll")}
            </Paragraph>
          </Flex>
        </Block>

        <Block style={[styles.itemGapBottom]}>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Paragraph variants="p2">{location?.name}</Paragraph>
            <Paragraph variants="p2">{event?.name}</Paragraph>
          </Flex>
        </Block>

        <Block style={styles.itemGapBottom}>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Subtitle variants="s1" variantStyle="bold">
              {user?.username ? user?.username : "N/a"}
            </Subtitle>
            <Subtitle variants="s1" variantStyle="bold">
              {`Total: ${displayForLocale(orderTotal)}`}
            </Subtitle>
          </Flex>
        </Block>

        <Block>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <ButtonExtended
              variants="tags"
              status={TagType(order?.status)}
              size="tiny"
            >
              <Label buttonLabel="LabelTinyBtn" variantStyle="uppercaseBold">
                {order?.status === "processed" ? "processed" : order?.status}
              </Label>
            </ButtonExtended>
            <Subtitle
              style={{ textTransform: "uppercase" }}
              variants="s1"
              variantStyle="bold"
            >
              {order?.payment_method}
              {order?.payment_method == "credit" &&
              order?.payments?.payment_data?.gatewayResponse?.rawResponse
                ?.cardAccount?.last4
                ? ": " +
                  order?.payments?.payment_data?.gatewayResponse?.rawResponse
                    ?.cardAccount?.last4
                : ""}
            </Subtitle>
          </Flex>
        </Block>
      </Box>
      <Divider />
    </TouchableOpacity>
  );
}

OrderHistoryItem.propTypes = {
  variants: PropTypes.oneOf(["focused", "default"]),
};
