/* eslint-disable react-native/no-raw-text */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-inline-styles */
import { useTheme } from "@ui-kitten/components";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { formatCentsForUiDisplay } from "../../helpers/calc";
import { NormalisedSizes } from "../../hooks/Normalized";
import { Caption, Subtitle } from "../atoms/Text";
import { Block } from "../layouts/block";
import { Box } from "../layouts/BoxContainer";
import { Flex } from "../layouts/flex";

const ItemSummaryLine = ({ item }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    quantity: {
      marginRight: NormalisedSizes(35),
      backgroundColor: `${theme["background-basic-color-2"]}`,
    },
    flex: {
      marginRight: NormalisedSizes(35),
      paddingTop: NormalisedSizes(35),
      backgroundColor: `${theme["background-basic-color-2"]}`,
      flexDirection: "row",
      width: "100%",
    },
    price: {
      marginRight: 0,
      backgroundColor: `${theme["background-basic-color-2"]}`,
    },
    caption: {
      backgroundColor: `${theme["background-basic-color-2"]}`,
      paddingLeft: NormalisedSizes(46),
      paddingTop: NormalisedSizes(16),
    },
    name: {
      width: NormalisedSizes(180),
      marginRight: NormalisedSizes(35),
      backgroundColor: `${theme["background-basic-color-2"]}`,
    },
  });

  const modifierPrice = (item) => {
    let price = 0;
    if (item.modifier_type !== "") {
      if (item.modifiers_update.length > 0) {
        item.modifiers_update.map((mapItem) => {
          price = price + mapItem.additional_price;
        });
      }
    }
    return price;
  };

  const renderItem = ({ item, index }) => {
    return (
      <Block
        style={[
          styles.caption,
          {
            flexDirection: "row",
            paddingTop: NormalisedSizes(10),
            paddingLeft: NormalisedSizes(46),
          },
        ]}
      >
        <Subtitle variants="s2" variantStyle="semiBold">
          -
        </Subtitle>
        <Subtitle
          variants="s2"
          variantStyle="semiBold"
          style={{ marginHorizontal: 10 }}
        >
          {item.sub_type} : {item.name}
        </Subtitle>
        <Subtitle variants="s2" variantStyle="semiBold">
          {item.additional_price !== 0 &&
            "($" + formatCentsForUiDisplay(item.additional_price) + ")"}
        </Subtitle>
      </Block>
    );
  };

  return (
    <Box>
      <Flex style={styles.flex}>
        <Block style={styles.quantity}>
          <Subtitle variants="s2" variantStyle="semiBold">
            {item.quantity}
          </Subtitle>
        </Block>
        <Block style={styles.name}>
          <Subtitle variants="s2" variantStyle="semiBold">
            {item.name}
          </Subtitle>
        </Block>
        <Block style={styles.price}>
          <Subtitle variants="s2" variantStyle="semiBold">
            $
            {formatCentsForUiDisplay(
              (item.price + modifierPrice(item)) * item.quantity
            )}
          </Subtitle>
        </Block>
      </Flex>

      {/* <Block style={styles.caption}> */}
      {item?.modifier_type !== "" && item.modifiers_update.length !== 0 && (
        <FlatList
          data={item?.modifiers_update}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* <Caption variants="c2">REG PRICE</Caption> */}
      {/* </Block> */}
    </Box>
  );
};

export default ItemSummaryLine;
