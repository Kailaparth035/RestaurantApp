/* eslint-disable arrow-body-style */

/* eslint-disable import/prefer-default-export */
export const isInCart = (product, cartItems) => {
  return cartItems.find((item) => item.id === product.id);
};

// check quantity
export const getQuantity = (product, cartItems) => {
  return cartItems.find((item) => item.id === product.id)?.quantity;
};

export const getModifierKey = (modifierKey, cartItems) => {
  let data = cartItems;
  return data.find((item) => item?.modifierKey === modifierKey);
};

export const getModifierPrice = (modifierPriceKey, cartItems) => {
  let data = cartItems;
  return data.find((item) => item?.variablePriceKey === modifierPriceKey);
};

export const DecreasingOrderData = (cartItems) => {
  // console.log("a.modifyTime ===>", cartItems[0].modifyTime[0]);
  const sortedData = cartItems.sort((a, b) => {
    if (
      a?.hasOwnProperty("modifyTime") &&
      b?.hasOwnProperty("modifyTime")
    ) {
    const timeA = new Date(
      a.modifyTime[a.modifyTime.length - 1]?.updatedTime
    ).getTime();
    const timeB = new Date(
      b.modifyTime[b.modifyTime.length - 1]?.updatedTime
    ).getTime();
    return timeB - timeA; // Sorting in decreasing order based on modifyTime
    }
  });
  return sortedData;
};

