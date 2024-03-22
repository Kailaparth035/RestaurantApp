import { useTheme } from "@ui-kitten/components";
import React, { useMemo, useState } from "react";
import { useTracked } from "../../../contexts/CartContext";
import { formatNumber } from "../../../helpers/calc";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { Label } from "../../atoms/Text";
import { View, TouchableOpacity, Image } from "react-native";
import Images from "../../../Images";

function MenuItem({ item, ...props }) {
  const theme = useTheme();

  const [quantity, setQuantity] = useState(0);

  const [cartState, dispatch] = useTracked();

  const addItem = (payload) => {
    dispatch({ type: "ADD_ITEM", payload });
  };

  const removeItem = (payload) => {
    dispatch({ type: "REMOVE_ITEM", payload });
  };

  const increase = (payload) => {
    dispatch({ type: "INCREMENT", payload });
  };

  const decrease = (payload) => {
    dispatch({ type: "DECREMENT", payload });
  };

  const itemCount = useMemo(() => {
    // const latestQuantity = getQuantity(item, cartState.cartItems);
    let latestQuantity = 0;

    if (cartState.cartItems.length > 0) {
      cartState.cartItems.map((mapItem) => {
        if (mapItem.id === item.id) {
          latestQuantity = latestQuantity + mapItem.quantity;
        }
      });
    }

    setQuantity(latestQuantity);

    return latestQuantity;
  }, [cartState.itemCount]);

  const handlePress = () => {
    if (item?.is_variable_price) {
      props.openVariablePriceModal();
    } else {
      if (item?.modifier_type !== "" && item?.modifier_type) {
        props.openModificationModal();
      } else {
        let payload = {
          ...item,
          modifier_type: "",
          modifiers_update: [],
          modifyTime: [{ updatedTime: new Date() }],
        };
        addItem(payload);
      }
    }
  };

  const handleDecrease = () => {
    // let delet = false;
    const data = cartState.cartItems;

    let payload;
    if(item?.is_variable_price){
      props.decresPriceModifierItem();
    }else{
      if (item.modifier_type !== "") {
        props.decresModifierItem();
      } else {
        if (quantity > 1) {
          if (data.length > 0) {
            data.map((mapItem, mapIndex) => {
              if (mapItem.id === item.id) {
                payload = { data: mapItem };
              }
            });
          }
          decrease(payload);
        } else {
          payload = data.filter((deletItem) => deletItem.id !== item.id);
          removeItem(payload);
        }
        console.log("payload ::::", JSON.stringify(payload));
      }
    }    
  };
  // console.log('menu item props', {item, props})
  const displayPrice =
    props.tax_type === "inclusive"
      ? item.price + item.price * item.tax_percentage
      : item.price;
  return (
    <TouchableOpacity
      onPress={() => {
        handlePress();
      }}
      style={{
        backgroundColor: theme["background-basic-color-2"],
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme["color-basic-200"],
        width: NormalisedSizes(320),
        height: NormalisedSizes(100),
        paddingHorizontal: NormalisedSizes(6.5),
        paddingVertical: NormalisedSizes(12),
        borderStyle: "solid",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginVertical: NormalisedSizes(5),
        marginHorizontal: NormalisedSizes(5),
        marginLeft: NormalisedSizes(10),
      }}
      onLongPress={() => props.longPressToOpenModal()}
    >
      {item.unique_id == 0 && (
        <View style={{ position: "absolute", top: -5, left: -5 }}>
          <TouchableOpacity
            style={{ alignItems: "flex-start", padding: NormalisedSizes(10) }}
            onPress={() => props.handleFavoritePress()}
          >
            <Image
              source={item.is_favorite ? Images.favourite : Images.unFavourite}
              style={{
                height: NormalisedSizes(25),
                width: NormalisedSizes(25),
                tintColor: "red",
              }}
            />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {quantity > 0 && (
          <View style={{ padding: 10, justifyContent: "flex-start" }}>
            <Label
              style={{
                fontWeight: "700",
                fontSize: NormalisedFonts(24),
                lineHeight: NormalisedFonts(28),
              }}
              status="danger"
            >
              {quantity}
            </Label>
          </View>
        )}

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 0.8,
          }}
        >
          <Label
            variantStyle="regular"
            buttonLabel="LabelLargeBtn"
            style={{
              textAlign: "center",
              marginBottom: NormalisedSizes(10),
              width: "100%",
            }}
          >
            {item?.name}
          </Label>
          <Label
            variantStyle="regular"
            buttonLabel="LabelLargeBtn"
            appearance="hint"
            style={{ color: theme["color-basic-500"] }}
          >
            {displayPrice ? formatNumber(displayPrice) : null}
          </Label>
        </View>
        {quantity > 0 && (
          <TouchableOpacity
            style={{ padding: 10, justifyContent: "flex-start" }}
            onPress={() => handleDecrease()}
          >
            <Image
              source={Images.minuse}
              style={{
                height: NormalisedSizes(25),
                width: NormalisedSizes(25),
                tintColor: "red",
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 3,
          left: 1,
          padding: 3,
          flexDirection: "row",
        }}
      >
        {item.tax === "taxed" && (
          <Image
            source={Images.tax}
            style={{
              height: NormalisedSizes(22),
              width: NormalisedSizes(22),
              marginRight: 1,
            }}
          />
        )}
        {item.modifier_type !== "" && (
          <Image
            source={Images.pencilSquare}
            style={{
              height: NormalisedSizes(22),
              width: NormalisedSizes(22),
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default MenuItem;
