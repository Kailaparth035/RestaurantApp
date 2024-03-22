/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-warning-comments */
/* eslint-disable no-unused-vars */

import { Text } from "@ui-kitten/components";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useTrackedState } from "../../contexts/CartContext";
import { DiscountContext } from "../../contexts/DiscountContext";
import { useAuth } from "../..//contexts/AuthContext";
import {
  displayForLocale,
  formatNumber,
  getDiscountTaxAmountForUi,
  getDiscountValue,
  getSurchargeAmount,
  getSurchargeAmountForDiscountedOrder,
  getTaxAmount,
  getTotal,
  getTotalWithAppliedDiscountAndSurcharge,
  getTotalWithSurcharge,
  getWithDiscountTotal,
} from "../../helpers/calc";
import { NormalisedSizes } from "../../hooks/Normalized";
import { Heading, Subtitle } from "../atoms/Text";
import { Block, Box, Flex } from "../layouts/Index";
import { useTransactionContext } from "../../../src/contexts/TransactionContext";

const styles = StyleSheet.create({
  mediumSpacing: {
    marginBottom: NormalisedSizes(32),
  },
  tinySpacing: {
    marginBottom: NormalisedSizes(16),
  },
});

export function OrderSummary() {
  const { discount, isDiscounted, discountType } = useContext(DiscountContext);
  const {
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation
    }
  } = useAuth();
  const {subtotal_after_tokens, total_discount,total_tax, subtotal_with_tax_and_tip, ...transactionCtx } = useTransactionContext().orderTotals;
  const cartState = useTrackedState();
  const cartItems = cartState?.cartItems;
  const total = cartState?.total;
  const surchargeLabel = selectedEvent?.digital_surcharge_label;
  const surchargeValue = selectedLocation?.digital_surcharge_percentage;

  return (
    <Box width="100%">
      {cartItems?.length > 0 ? (
        <Flex justifyContent="space-evenly">
          <Block
            style={{
              marginBottom: NormalisedSizes(32),
              marginTop: NormalisedSizes(16),
            }}
          >
            <Flex flexDirection="row" justifyContent="space-between">
              <Subtitle variants="s1" variantStyle="semiBold">
                Subtotal:
              </Subtitle>
              <Subtitle variants="s1" variantStyle="semiBold">
                {displayForLocale(subtotal_after_tokens)}
              </Subtitle>
            </Flex>
          </Block>
          <Block style={styles.tinySpacing}>
            <Flex flexDirection="row" justifyContent="space-between">
              <Subtitle variants="s2" variantStyle="semiBold">
                Discount:
              </Subtitle>
                <Block>
                    <Subtitle variants="s2" variantStyle="semiBold">
                      {`${total_discount > 0 ? "- ": ""}${displayForLocale(total_discount)}`}
                    </Subtitle>
                </Block>
            </Flex>
          </Block>
          {/* TODO: Turn into reusable component? */}
          <Block style={styles.mediumSpacing}>
            <Flex flexDirection="row" justifyContent="space-between">
              <Subtitle variants="s2" variantStyle="semiBold">
                Tax:
              </Subtitle>
                <Subtitle variants="s2" variantStyle="semiBold">
                  {displayForLocale(total_tax)}
                </Subtitle>
            </Flex>
          </Block>

          {/* TODO: Turn into reusable component? */}
          <Block>
            <Flex flexDirection="row" justifyContent="space-between">
              <Subtitle variants="s1" variantStyle="semiBold">
                Total:
              </Subtitle>
         
                  <Heading variants="h4" variantStyle="bold">
                    {displayForLocale(subtotal_with_tax_and_tip)}
                  </Heading>
            </Flex>
          </Block>
        </Flex>
      ) : (
        <View>
          <Text>You Have Removed All Your Items.</Text>
        </View>
      )}
    </Box>
  );
}
