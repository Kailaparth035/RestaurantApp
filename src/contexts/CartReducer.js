// let modifierPrice = 0;
// export const renderModifierPrice = (item, type) => {
//   console.log("renderModifierPrice ====>", item);
//   if (type === "ADD_MODIFYITEM") {
//     if (item && item.modifiers.length !== 0) {
//       item.modifiers.map((mapItem) => {
//         console.log(
//           "mapItem.additional_price; ====>",
//           mapItem.additional_price
//         );
//         modifierPrice = modifierPrice + mapItem.additional_price;
//       });
//     }
//   } else {
//     return modifierPrice;
//   }
//   console.log("modifierPrice; ====>", modifierPrice);
// };

export const sumItems = (cartItems, type) => {
  // console.log("cartItems ::::", cartItems);
  let total = 0;
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  cartItems.forEach((item) => {
    let itemPrice = item.price;
    if (
      item.isModifier &&
      item.modifier_type !== "" &&
      item.modifiers_update &&
      item.modifiers_update.length > 0
    ) {
      // console.log("item.modifiers ====>", item.modifiers);
      item.modifiers_update.forEach((modifier) => {
        itemPrice += modifier.additional_price;
      });
    }
    itemPrice *= item.quantity;
    total += itemPrice;
  });
  return { itemCount, total };

  // const total = cartItems.reduce(
  //   (totalParam, item) =>
  //     totalParam +
  //     (renderModifierPrice(item, type) + item.price) * item.quantity,
  //   0
  // );
  // return { itemCount, total };

  // const data = state.cartItems;
  // const itemIndex = data.findIndex(
  //   (item) => item.id === action.payload.updatedPayload.id
  // );

  // const data = state.cartItems;
  //         const itemIndex = data.findIndex(
  //           (item) =>
  //             item.modifierKey === action.payload.updatedPayload.modifierKey
  //         );
  //         if (itemIndex !== -1) {
  //           // Increase quantity
  //           data[itemIndex].quantity = action.payload?.updatedPayload.quantity;

  //           // Remove item from its current position
  //           const updatedItem = data.splice(itemIndex, 1)[0];

  //           // Push the updated item to the end of the array
  //           data.push(updatedItem);
  //           state.cartItems = data;
  //         }
};

export const cartReducer = (state, action) => {
  // console.log("action.payload ====>", JSON.stringify(action.payload));
  switch (action.type) {
    case "ADD_ITEM":
      if (action?.payload?.is_variable_price) {
        if (state.cartItems.length > 0) {
          let price =
            state.cartItems[
              state.cartItems.findIndex(
                (item) =>
                  item.variablePriceKey === action.payload.variablePriceKey
              )
            ]?.price;
          if (price === action.payload.price) {
            state.cartItems[
              state.cartItems.findIndex(
                (item) =>
                  item.variablePriceKey === action.payload.variablePriceKey
              )
            ].quantity += 1;
          } else {
            state.cartItems.push({
              ...action.payload,
              quantity: 1,
            });
          }
        } else {
          state.cartItems.push({
            ...action.payload,
            quantity: 1,
          });
        }
        return {
          ...state,
          ...sumItems(state.cartItems),
          cartItems: [...state.cartItems],
        };
      } else {
        if (action?.payload?.isAllModifier) {
          if (!action?.payload?.updatedPayload?.isModofierExist) {
            state.cartItems.push({ ...action.payload.updatedPayload });
          } else {
            state.cartItems[
              state.cartItems.findIndex(
                (item) =>
                  item.modifierKey ===
                  action.payload?.updatedPayload?.modifierKey
              )
            ].quantity = action.payload?.updatedPayload.quantity;
          }
          return {
            ...state,
            ...sumItems(state.cartItems),
            cartItems: [...state.cartItems],
          };
        } else {
          let quantity =
            state.cartItems[
              state.cartItems.findIndex((item) => item.id === action.payload.id)
            ];
          // console.log("quantity ====>", quantity);
          if (state.cartItems.length > 0 && quantity !== undefined) {
            state.cartItems[
              state.cartItems.findIndex((item) => item.id === action.payload.id)
            ].quantity += 1;
          } else {
            state.cartItems.push({
              ...action.payload,
              quantity: 1,
            });
          }
          return {
            ...state,
            ...sumItems(state.cartItems),
            cartItems: [...state.cartItems],
          };
        }
      }

    case "REMOVE_ITEM":
      state.cartItems = action.payload;
      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "INCREMENT":
      if (
        state.cartItems.length > 0 &&
        state.cartItems[
          state.cartItems.findIndex((item) => item.id === action.payload.id)
        ].quantity !== undefined
      ) {
        state.cartItems[
          state.cartItems.findIndex((item) => item.id === action.payload.id)
        ].quantity += 1;
        return {
          ...state,
          ...sumItems(state.cartItems),
          cartItems: [...state.cartItems],
        };
      } else {
        if (!state.cartItems.find((item) => item.id === action.payload.id)) {
          state.cartItems.push({
            ...action.payload,
            quantity: 1,
          });
        }
        return {
          ...state,
          ...sumItems(state.cartItems),
          cartItems: [...state.cartItems],
        };
      }
    case "DECREMENT":
      if (action?.payload?.data?.is_variable_price) {
        let updatedModifierTime =
          state.cartItems[
            state.cartItems.findIndex(
              (item) =>
                item.variablePriceKey === action.payload?.data?.variablePriceKey
            )
          ].modifyTime.pop();
        state.cartItems[
          state.cartItems.findIndex(
            (item) =>
              item.variablePriceKey === action.payload?.data?.variablePriceKey
          )
        ].quantity -= 1;
        state.cartItems[
          state.cartItems.findIndex(
            (item) =>
              item.variablePriceKey === action.payload?.data?.variablePriceKey
          )
        ].modifyTime = action.payload?.modifierTimeArray;
        return {
          ...state,
          ...sumItems(state.cartItems),
          cartItems: [...state.cartItems],
        };
      } else {
        if (action.payload?.data.modifier_type !== "") {
          let updatedModifierTime =
            state.cartItems[
              state.cartItems.findIndex(
                (item) => item.modifierKey === action.payload?.data?.modifierKey
              )
            ].modifyTime.pop();
          state.cartItems[
            state.cartItems.findIndex(
              (item) => item.modifierKey === action.payload?.data?.modifierKey
            )
          ].quantity -= 1;
          state.cartItems[
            state.cartItems.findIndex(
              (item) => item.modifierKey === action.payload?.data?.modifierKey
            )
          ].modifyTime = action.payload?.modifierTimeArray;
        } else {
          state.cartItems[
            state.cartItems.findIndex(
              (item) => item.id === action?.payload?.data?.id
            )
          ].quantity -= 1;
        }
      }

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "CHECKOUT":
      return {
        cartItems: [],
        checkout: true,
        ...sumItems([]),
      };
    case "GET_CART":
      return {
        state,
      };
    case "DELETE_ORDER":
      return {
        cartItems: [],
        ...sumItems([]),
        checkout: false,
      };
    case "RESET":
      return {
        cartItems: [],
        ...sumItems([]),
      };

    case "ADD_MODIFYITEM":
      state.cartItems[
        state.cartItems.findIndex((item) => item.id === action.payload.item.id)
      ].modifiers = action.payload.data;
      return {
        ...state,
        ...sumItems(state.cartItems, "ADD_MODIFYITEM"),
        cartItems: [...state.cartItems],
      };

    default:
      return state;
  }
};
