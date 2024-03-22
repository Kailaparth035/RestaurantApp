/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */

import { Button, Input, Layout, useTheme } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Caption } from "../atoms/Text";
import { ButtonGroup } from "../molecules/ButtonGroup/ButtonGroup";

export const DiscountToggle = ({ types, isDiscounted, setIsDiscounted }) => {
  const [value, setValue] = useState(null);
  const [active, setActive] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [unit, setUnit] = useState("$");

  const displayType = (type) => {
    if (type === "Amount") {
      // FIXME: not fully operational
      setUnit("$");
      return `${type} $`;
    }
    if (type === "Percentage") {
      setUnit("%");
      return `${type} %`;
    }
    return type;
  };

  const theme = useTheme();

  const remove = () => {
    setDiscount(null);
    setValue(null);
    setIsDiscounted(false);
  };

  const apply = () => {
    setDiscount(value);
    setIsDiscounted(true);
  };

  useEffect(() => {
    if (!active) {
      setValue(null);
    }
  }, [active]);

  return (
    <Layout>
      <View style={{ marginVertical: 10 }}>
        {discount && (
          <Caption
            category="c2"
            style={{
              marginTop: types.length > 2 ? 0 : 10,
              color:
                types.length > 2
                  ? theme["color-primary-default"]
                  : theme["color-basic-700"],
            }}
          >
            {discount} {unit} OFF
          </Caption>
        )}
        {!discount && types.length <= 2 && (
          <Caption
            category="c2"
            style={{
              marginTop: 10,
              color:
                types.length > 2
                  ? theme["color-primary-default"]
                  : theme["color-basic-700"],
            }}
          >
            REG PRICE
          </Caption>
        )}
      </View>

      <View
        style={{
          flexDirection: types.length > 2 ? "row" : "column",
          marginVertical: 10,
        }}
      >
        <ButtonGroup
          active={active}
          setActive={setActive}
          types={types}
          value={setValue}
          setValue={setValue}
          displayType={displayType}
        />
        {active && (
          <View
            style={{
              flexDirection: types.length > 2 ? "row" : "column",
              justifyContent: types.length > 2 ? "flex-end" : "flex-start",
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
                style={{ width: types.length > 2 ? 211 : 202 }}
              />
              <Button style={{ marginLeft: 10 }} onPress={() => apply()}>
                APPLY
              </Button>
              <Button
                status="secondary"
                style={{ marginLeft: 10 }}
                onPress={() => remove()}
              >
                REMOVE
              </Button>
            </View>
          </View>
        )}
      </View>
    </Layout>
  );
};
