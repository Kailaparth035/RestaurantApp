/* eslint-disable no-unneeded-ternary */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */

import { Divider, Icon, useTheme } from "@ui-kitten/components";
import { isArray, keyBy } from "lodash";
import React from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import {
  displayForLocale,
  getDiscountTotal,
  getOrderTotal,
  formatNumber,
} from "../../../../helpers/calc";
import { NormalisedSizes } from "../../../../hooks/Normalized";
import { Subtitle } from "../../../atoms/Text/index";
import { Block, Box, Flex } from "../../../layouts/Index";
import { WriteLog } from "../../../../../src/CommonLogFile";

const styles = StyleSheet.create({
  container: {
    marginHorizontal: NormalisedSizes(43),
    marginVertical: NormalisedSizes(28),
  },

  dividerMargin: {
    marginVertical: NormalisedSizes(27.5),
  },

  mediumSpacing: {
    marginBottom: NormalisedSizes(32),
  },
  smallSpacing: {
    marginBottom: NormalisedSizes(21),
  },
  tinySpacing: {
    marginBottom: NormalisedSizes(16),
  },
});

function Printer(props) {
  const theme = useTheme();
  return (
    <Icon
      style={{
        tintColor: theme["color-primary-default"],
        width: NormalisedSizes(24),
        height: NormalisedSizes(24),
      }}
      name="printer-outline"
      animation="pulse"
    />
  );
}

// function Email(props) {
//   const theme = useTheme();
//   return (
//     <Icon
//       style={{
//         tintColor: theme["color-primary-default"],
//         width: NormalisedSizes(24),
//         height: NormalisedSizes(24),
//       }}
//       name="navigation-2"
//       animation="pulse"
//     />
//   );
// }

export function FocusCart({ variants, order, ...props }) {
  const theme = useTheme();

  const subtotalPrice = 0;

  const {
    order_id = "",
    discount = [],
    reference_id = "",
    payment_method = "",
    payments = "",
    digital_surcharge_label = "",
    digital_surcharge_percentage = 0,
    items = [],
    subtotal = 0,
    tax = 0,
    tip = 0,
    digital_surcharge_amount = 0,
  } = order;

  const surchargeLabel = digital_surcharge_label;
  const surchargeValue = digital_surcharge_percentage;

  const getItemIds = (items) => {
    const newArrayItems = [];

    if (isArray(items)) {
      items.map((item) => {
        return newArrayItems.push(item.id);
      });
    } else {
      WriteLog("Focuscart items.length." + items);
      WriteLog("Focuscart items.length." + items.length);
      // console.log("items.length", typeof items);
      // console.log("items.length", items.length);
    }
    return newArrayItems;
  };

  const itemsIds = getItemIds(items);

  function uniqueArray(value) {
    return [...new Set(value)];
  }
  function getIdenticalItems(array, value) {
    return array.filter((v) => v === value)?.length;
  }
  const uniqueItemsIds = uniqueArray(itemsIds);

  const uniqueArrayItems = keyBy(items, "id");
  const discountTotal = getDiscountTotal({ discounts: discount, subtotal });
  const orderTotal = getOrderTotal(order);
  let surchargeAmount = 0;
  if (payment_method !== "cash") {
    if (payment_method == "credit") {
      surchargeAmount = digital_surcharge_amount;
    } else {
      surchargeAmount = items[0].surchargeAmount;
    }
  }

  const capitalizeFirstLetter = (word) => {
    if (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      return "";
    }
  };

  const modifierPrice = (item) => {
    let total = 0;
    if (
      item.modifier_type !== "" &&
      item?.modifiers_update &&
      item?.modifiers_update.length > 0
    ) {
      item?.modifiers_update.map((mapItem) => {
        total += mapItem.additional_price;
      });
    }
    return total;
  };
  return (
    <Box level="2" {...props} height="100%">
      <ScrollView height="100%">
        <Box level="2" style={styles.container}>
          <Block width="100%">
            <Box level="2" style={styles.mediumSpacing}>
              <Block style={{ marginBottom: NormalisedSizes(8) }}>
                <Subtitle variants="s1">Order #{order_id}</Subtitle>
              </Block>
              <Block style={{ marginBottom: NormalisedSizes(8) }}>
                <Subtitle variants="s2">Ref ID: {reference_id}</Subtitle>
              </Block>
              <Block>
                <Subtitle style={{ textTransform: "uppercase" }} variants="s2">
                  {payment_method}
                  {payment_method == "credit" &&
                  payments?.payment_data?.gatewayResponse?.rawResponse
                    ?.cardAccount?.last4
                    ? ": " +
                      payments?.payment_data?.gatewayResponse?.rawResponse
                        ?.cardAccount?.last4
                    : ""}
                </Subtitle>
              </Block>
            </Box>

            <Block style={{ marginBottom: 0 }}>
              {uniqueItemsIds.map((mapItem) => {
                // console.log("item ::::", mapItem);
                return (
                  <Block
                    key={uniqueArrayItems[mapItem].id}
                    style={styles.tinySpacing}
                  >
                    <Flex flexDirection="row" justifyContent="space-between">
                      <Block>
                        <Subtitle variants="s2">
                          {`${
                            uniqueArrayItems[mapItem].short_name
                          }  (${getIdenticalItems(
                            itemsIds,
                            uniqueArrayItems[mapItem].id
                          )}) `}
                        </Subtitle>
                        {uniqueArrayItems[mapItem].modifier_type !== "" && (
                          <FlatList
                            data={uniqueArrayItems[mapItem]?.modifiers_update}
                            renderItem={({ item }) => {
                              return (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Subtitle
                                    style={{ textTransform: "none" }}
                                    variants="s2"
                                  >
                                    -{" "}
                                    {capitalizeFirstLetter(
                                      uniqueArrayItems[mapItem]?.modifier_type
                                    )}{" "}
                                    : {capitalizeFirstLetter(item?.name)}{" "}
                                    {item.additional_price > 0 &&
                                      "(" +
                                        formatNumber(item.additional_price) +
                                        ")"}
                                  </Subtitle>
                                </View>
                              );
                            }}
                          />
                        )}
                      </Block>
                      <Block>
                        <Subtitle variants="s2">
                          {formatNumber(
                            uniqueArrayItems[mapItem]?.price +
                              modifierPrice(uniqueArrayItems[mapItem])
                          )}
                          {/* {`${(uniqueArrayItems[mapItem].price / 100).toFixed(
                            2
                          )}`} */}
                        </Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                );
              })}
              <Divider style={[styles.dividerMargin, { marginTop: 5 }]} />
              <Block style={styles.tinySpacing}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Subtitle variants="s2">Subtotal</Subtitle>

                  <Subtitle variants="s2">
                    {displayForLocale(subtotal)}
                  </Subtitle>
                </Flex>
              </Block>
              <Block style={styles.tinySpacing}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Subtitle variants="s2">Tax</Subtitle>

                  <Subtitle variants="s2">{displayForLocale(tax)}</Subtitle>
                </Flex>
              </Block>
              <Block style={styles.tinySpacing}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Subtitle variants="s2">Tip</Subtitle>

                  <Subtitle variants="s2">{displayForLocale(tip)}</Subtitle>
                </Flex>
              </Block>
              <Block style={styles.tinySpacing}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Subtitle variants="s2">Discount</Subtitle>

                  <Subtitle variants="s2">
                    {`${discountTotal > 0 ? "- " : ""}${displayForLocale(
                      discountTotal
                    )}`}
                  </Subtitle>
                </Flex>
              </Block>
              <Block style={styles.tinySpacing}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Subtitle variants="s2">{"Service Fee"}</Subtitle>
                  <Subtitle variants="s2">
                    {displayForLocale(digital_surcharge_amount)}
                  </Subtitle>
                </Flex>
              </Block>
            </Block>
          </Block>
          <Divider style={styles.dividerMargin} />
          <Block width="100%">
            <Block style={{ marginBottom: NormalisedSizes(44) }}>
              <Flex flexDirection="row" justifyContent="space-between">
                <Subtitle variants="s1" variantStyle="semiBold">
                  Total
                </Subtitle>

                <Subtitle variants="s1" variantStyle="semiBold">
                  {displayForLocale(orderTotal)}
                </Subtitle>
              </Flex>
            </Block>
            {/* {variants === "admin" ? (
              <>
                <Block style={styles.mediumSpacing}>
                  <ButtonExtended status="primary" size="large">
                    <Label
                      buttonLabel="LabelLargeBtn"
                      variants="label"
                      variantStyle="uppercaseBold"
                    >
                      adjust
                    </Label>
                  </ButtonExtended>
                </Block>

                <Block style={styles.mediumSpacing}>
                  <ButtonExtended status="primary" size="large">
                    <Label
                      buttonLabel="LabelLargeBtn"
                      variants="label"
                      variantStyle="uppercaseBold"
                    >
                      void
                    </Label>
                  </ButtonExtended>
                </Block>

                <Block>
                  <Flex flexDirection="row" justifyContent="space-between">
                    <ButtonExtended
                      status="primary"
                      appearance="ghost"
                      size="large"
                      accessoryLeft={Printer}
                    >
                      <Label
                        buttonLabel="LabelLargeBtn"
                        variants="label"
                        variantStyle="regular"
                      >
                        Print Receipt
                      </Label>
                    </ButtonExtended>

                    <ButtonExtended
                      status="primary"
                      appearance="ghost"
                      size="large"
                      accessoryLeft={Email}
                    >
                      <Label
                        buttonLabel="LabelLargeBtn"
                        variants="label"
                        variantStyle="regular"
                      >
                        Email Receipt
                      </Label>
                    </ButtonExtended>
                  </Flex>
                </Block>
              </>
            ) : null} */}
          </Block>
        </Box>
      </ScrollView>
    </Box>
  );
}
