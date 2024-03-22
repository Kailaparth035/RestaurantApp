import { Button, Divider, useTheme } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { useDispatch, useTrackedState } from "../contexts/CartContext";
import { formatNumber } from "../helpers/calc";
import { getQuantity } from "../helpers/IsInCart";
import { NormalisedSizes } from "../hooks/Normalized";
import { MinusOutlineIcon, PlusOutlineIcon } from "./atoms/Icons/Icons";
import { Heading, Subtitle } from "./atoms/Text";
import { Block, Box, Flex } from "./layouts/Index";
import { WriteLog } from "../../src/CommonLogFile";
import { View } from "react-native";

const types = ["Code", "Percentage"];

function CartItem({ item }) {
  WriteLog("ApolloClient" + { item: item });
  // console.log("editOrder  item ==>", JSON.stringify(item));
  const dispatch = useDispatch();
  const cartState = useTrackedState();

  const removeItem = (filterItem) => {
    let payload;
    let decreasingOrderData = cartState.cartItems;
    if (filterItem.is_variable_price) {
      payload = decreasingOrderData.filter(
        (deletItem) =>
          deletItem.variablePriceKey !== filterItem.variablePriceKey
      );
    } else {
      if (filterItem.modifier_type !== "") {
        // let decreasingOrderData = cartState.cartItems;
        payload = decreasingOrderData.filter(
          (deletItem) => deletItem.modifierKey !== filterItem.modifierKey
        );
      } else {
        payload = cartState.cartItems.filter(
          (deletItem) => deletItem.id !== filterItem.id
        );
      }
    }
    // console.log("rewmove ::::", JSON.stringify(payload));
    dispatch({ type: "REMOVE_ITEM", payload });
  };

  const decrease = (decreaseItem) => {
    let payload;
    if (decreaseItem.is_variable_price) {
      let modifierTimeArray = [];
      if (decreaseItem.modifyTime.length > 0) {
        decreaseItem.modifyTime.map((mapItem, mapIndex) => {
          if (decreaseItem.modifyTime.length - 1 !== mapIndex) {
            modifierTimeArray.push(mapItem);
          }
        });
      }
      if (decreaseItem.quantity > 1) {
        payload = {
          data: decreaseItem,
          modifierTimeArray: modifierTimeArray,
        };
        dispatch({ type: "DECREMENT", payload });
      }
    } else {
      if (decreaseItem.modifier_type !== "") {
        let modifierTimeArray = [];
        if (decreaseItem.modifyTime.length > 0) {
          decreaseItem.modifyTime.map((mapItem, mapIndex) => {
            if (decreaseItem.modifyTime.length - 1 !== mapIndex) {
              modifierTimeArray.push(mapItem);
            }
          });
        }
        payload = {
          data: decreaseItem,
          modifierTimeArray: modifierTimeArray,
        };
      } else {
        payload = { data: decreaseItem };
      }

      dispatch({ type: "DECREMENT", payload });
    }
  };

  const increase = (increaseItem) => {
    let currentTime = { updatedTime: new Date() };
    let updatedItem = increaseItem;
    let payload;
    if (increaseItem.is_variable_price) {
      updatedItem.modifyTime = [
        ...updatedItem.modifyTime,
        currentTime,
      ];
      payload = { ...updatedItem };
    } else {
      if (updatedItem.modifier_type !== "") {
        let timeArray = updatedItem.modifyTime;
        updatedItem.modifyTime = timeArray;
        updatedItem.quantity = updatedItem.quantity + 1;
        payload = {
          updatedPayload: { ...updatedItem, isModofierExist: true },
          isAllModifier: true,
        };
      } else {
        updatedItem.modifyTime = [currentTime];
        payload = {
          ...updatedItem,
        };
      }
    }

    // console.log("Updatedpayload ===>", JSON.stringify(payload));
    dispatch({ type: "ADD_ITEM", payload });
  };

  const theme = useTheme();

  // TOOD: isInCart helper function to get accurate quantity?

  const [isDiscounted, setIsDiscounted] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const itemCount = useMemo(() => {
    // prevent this computation every render if it is the same
    setQuantity(getQuantity(item, cartState.cartItems));
  }, [cartState.cartItems, item]);

  // useEffect(() => {
  //   // update component state when quantity changes
  //   console.log("quantity changed");
  //   setQuantity(getQuantity(item, cartState.cartItems));
  // }, [itemCount]);

  // useEffect(() => {
  //   // console.log("quantity changed");
  // }, [item.quantity]);
  WriteLog("card item" + quantity);
  // console.log("card item", quantity);

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
    <Box width={NormalisedSizes(950)}>
      <Block>
        <Flex flexDirection="row" alignItems="flex-start">
          <Flex
            width={NormalisedSizes(127)}
            flexDirection="row"
            alignContent="center"
            justifyContent="center"
            style={{ marginRight: NormalisedSizes(32) }}
          >
            <Block
              style={{
                justifyContent: "center",
              }}
            >
              <Button
                accessoryLeft={PlusOutlineIcon}
                status="secondary"
                style={{
                  borderRadius: 50,
                  padding: 0,
                  margin: 0,
                  width: NormalisedSizes(40),
                  height: NormalisedSizes(40),
                }}
                size="small"
                onPress={() => increase(item)}
              />
            </Block>
            <Block
              style={{
                paddingHorizontal: NormalisedSizes(9),
                justifyContent: "center",
              }}
            >
              <Subtitle variants="s2" variantStyle="semiBold">
                {item.quantity}
              </Subtitle>
            </Block>
            <Block
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {quantity >= 1 && (
                <Button
                  accessoryLeft={MinusOutlineIcon}
                  size="small"
                  onPress={() =>
                    item.quantity === 1 ? removeItem(item) : decrease(item)
                  }
                  style={{
                    borderRadius: 50,
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    marginVertical: 0,
                    marginHorizontal: 0,
                    width: NormalisedSizes(40),
                    height: NormalisedSizes(40),
                  }}
                />
              )}
            </Block>
          </Flex>

          <Block
            width={NormalisedSizes(680)}
            style={{ justifyContent: "center" }}
          >
            <Block style={{ justifyContent: "center" }}>
              <Block>
                <Heading
                  variants="h6"
                  style={{ marginTop: item?.modifier_type !== "" ? 4 : 6 }}
                >
                  {item.name}
                </Heading>
              </Block>
              <Block>
                {item?.modifiers_update.length > 0 &&
                  item?.modifier_type !== "" &&
                  item?.modifiers_update.map((mapItem) => {
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          marginVertical: 2,
                        }}
                      >
                        <Subtitle variants="s3" variantStyle={undefined}>
                          - {capitalizeFirstLetter(mapItem.sub_type)} :{" "}
                          {capitalizeFirstLetter(mapItem.name)}{" "}
                          {mapItem.additional_price > 0 &&
                            "(" + formatNumber(mapItem.additional_price) + ")"}
                        </Subtitle>
                      </View>
                    );
                  })}
                {/* <Heading variants="h6">{item.description}</Heading> */}
              </Block>
            </Block>
            {/* <DiscountToggle
              types={types}
              isDiscounted={isDiscounted}
              setIsDiscounted={setIsDiscounted} */}
            {/* /> */}
          </Block>

          <Block
            style={{
              width: NormalisedSizes(70),
              justifyContent: "center",
              alignItems: "flex-end",
              marginRight: NormalisedSizes(40),
              marginTop: item?.modifier_type !== "" ? 0 : 10,
            }}
          >
            <Subtitle
              variants="s3"
              variantStyle="semiBold"
              style={
                isDiscounted && {
                  color: theme["color-basic-400"],

                }
              }
            >
              {formatNumber(item.price + modifierPrice(item))}
            </Subtitle>
            {/* {isDiscounted && (
              <Subtitle variants="s3">{formatNumber(item.price)}</Subtitle>
            )} */}
          </Block>
        </Flex>
        <Divider
          style={{
            marginRight: NormalisedSizes(40),
            marginTop: 10,
            marginBottom: 10,
          }}
        />
      </Block>
    </Box>
  );
}

CartItem.propTypes = {
  item: PropTypes.shape({
    __typename: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    price: PropTypes.number,
    unique_id: PropTypes.string,
    quantity: PropTypes.number,
  }),
};
CartItem.defaultProps = {
  item: {
    price: null,
  },
};

export default CartItem;
