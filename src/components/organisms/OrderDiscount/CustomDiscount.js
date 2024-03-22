/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */

import { Button, Input, Layout, useTheme } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import uuid from "react-native-uuid";
import { View } from "react-native";
import { Caption } from "../../atoms/Text";
import { ButtonGroup } from "../../molecules/ButtonGroup/ButtonGroup";

export const CustomDiscount = ({ 
    types, isDiscounted, setIsDiscounted, active, selectDiscount, removeDiscount }) => {
  const [value, setValue] = useState(null);
  const [unit, setUnit] = useState("$");

  const theme = useTheme();
  const apply = () => {
    const customDiscount = {
      name:  `Custom ${active}`,
      discount_type: `custom-${active}`,
      code: `custom-${active}-${uuid.v4()}`
    };
    if (active === "percentage") {
      customDiscount.percentage = Number(value);
    } else {
      customDiscount.amount = (Number(value)* 100);
    }
    selectDiscount(customDiscount)
  };

  return (
    <Layout>
      <View
        style={{
          flexDirection: "row",
          marginVertical: 10,
        }}
      >
          <View
            style={{
              flexDirection:   "row" ,
              justifyContent:   "flex-start",
              alignItems: "flex-start",
              flex: 1,
              marginVertical: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Input
                placeholder={`${active}`}
                value={value}
                onChangeText={(nextValue) => setValue(nextValue)}
                size="large"
                style={{ width:   '70%' }}
                keyboardType="decimal-pad"
              />
              <Button style={{ marginLeft: 10 }} onPress={apply} disabled={active == "percentage" && value > 100}>
                APPLY
              </Button>
      
            </View>
          </View>
      </View>
    </Layout>
  );
};
