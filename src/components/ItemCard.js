import { Text } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { DispatchCartContext } from "../contexts/CartContext";
import { formatNumber } from "../helpers/calc";
import { globalStyles } from "../styles/global";

const ItemCard = ({ item, style }) => {
  const { cartItems, addItem, increase } = useContext(DispatchCartContext);
  const isInCart = (itemToCheck) =>
    !!cartItems.find((cartItem) => cartItem.id === itemToCheck.id);
  return (
    <TouchableOpacity
      style={[globalStyles.menuItem, { style }]}
      onPress={isInCart(item) ? () => increase(item) : () => addItem(item)}
    >
      <Text category="h6">{item.name}</Text>
      <Text category="h2">{item.image}</Text>
      <Text category="h6">{formatNumber(item.price)}</Text>
    </TouchableOpacity>
  );
};

ItemCard.propTypes = {
  item: {
    id: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.number,
  }.isRequired,
  style: PropTypes.string.isRequired,
};
export default ItemCard;
