/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-raw-text */

import { useTheme, Button, Divider } from "@ui-kitten/components";
import { Text, View } from "react-native";
import React, { useState } from "react";
import { NormalisedSizes } from "../../../hooks/Normalized";
import { Heading } from "../../atoms/Text";
import DiscountSelect from "../../DiscountSelect";
import { CustomDiscount } from "./CustomDiscount";
import EventDiscounts from './EventDiscounts';
import { Box } from "../../layouts/BoxContainer";
import { DiscountToggle } from "../DiscountToggle";
import { useDiscountContext } from "../../../contexts/DiscountContext";
import { useTransactionContext } from "../../../contexts/TransactionContext";
import { ButtonGroup } from "../../molecules/ButtonGroup/ButtonGroup";
import { displayForLocale } from "../../../helpers/calc";

const formatPercentageDiscountTotal = ({discount, total}) => {

  return displayForLocale((discount / 100) * (total));
}
export const OrderDiscount = () => {
  const types = ["amount", "percentage", "code"];
  const [selectedDiscountType, setSelectedDiscountType] = useState(types[0]);
  const { selectedDiscounts, addSelectedDiscount,removeSelectedDiscount } = useDiscountContext();
  const {subtotal_after_tokens, applied_discounts} = useTransactionContext().orderTotals;
  const theme = useTheme();

  return (
    <Box width="100%" style={{marginBottom: 20}}>
      <Heading
        variants="h4"
        style={{
          marginBottom: NormalisedSizes(32),
          color: theme["color-basic-700"],
        }}
      >
        Order Discount
      </Heading>
      <View
        style={{
          marginTop: -15,
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: 'center'
        }}
      >
        <View style={{ with: "40%" }}>
          <ButtonGroup
            active={selectedDiscountType}
            setActive={(type) => {
              setSelectedDiscountType(type);
            }}
            types={types}
            displayType={(type) => type}
          />
        </View>
        <View style={{ width: "60%", marginLeft: 5 }}>
          {selectedDiscountType === "code" && <EventDiscounts  selectDiscount={addSelectedDiscount}/>}
          {selectedDiscountType !== "code" && (
            <CustomDiscount
              active={selectedDiscountType}
              selectDiscount={addSelectedDiscount}
            />
          )}
        </View>
      </View>
      <Divider style={{ marginRight: 0, marginTop: 20, marginBottom: 20 }} />
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Applied Discounts</Text>
      {(applied_discounts || []).map((x) => {
        let discountDisplayValue = displayForLocale(x.amount);
        let discountAmount = displayForLocale(x.applied_discount);
        if ( x.percentage > 0 ) {
          discountDisplayValue = `${x.percentage}%`;
        }
        return (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              alignItems: "center",
              marginTop: 4,
              
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "70%"
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "400" }}>
                {`${
                  x?.discount_type == "custom-amount" ||
                  x?.discount_type == "custom-percentage"
                    ? x?.name
                    : x?._raw?.name
                }`}
              </Text>

            </View>
            <View style={{ display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "30%",
                justifyContent: 'flex-end'
              }}>
              <Text style={{ fontSize: 14, fontWeight: "400", marginRight: 5 }}>
                {discountAmount}
              </Text>
              <Button
                status="primary"
                style={{ marginLeft: 10 }}
                onPress={() => removeSelectedDiscount(x)}
                size="small"
              >
                REMOVE
              </Button>
            </View>
            
          </View>
        );
      })}
    </Box>
  );
};
