/* eslint-disable no-warning-comments */
/* eslint-disable import/prefer-default-export */

import { StyleSheet } from "react-native";
import { NormalisedSizes } from "../hooks/Normalized";

// TODO: SEPARATE STYLE SHEETS FOR EACH COMPONENT

export const globalStyles = StyleSheet.create({
  Cart: {
    borderColor: "rgba(158, 150, 150, .135)",
    borderLeftWidth: 1,
    flex: 1,
    justifyContent: "center",
    width: NormalisedSizes(250),
  },
  CartEmpty: {
    padding: 20,
  },
  CartItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  CartItem_Name: {
    flex: 2,
    paddingLeft: 10,
  },
  CartItem_Price: {
    flex: 1,
  },
  CartItems: {
    flexDirection: "column",
  },
  CartSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    // borderWidth: 1,
    // borderColor: 'blue'
  },
  CheckoutItem: {
    alignItems: "center",
    flexDirection: "row",
    // justifyContent: 'space-around',
    marginTop: 10,
  },
  CheckoutMethod: {
    alignItems: "center",
    // borderWidth: 5,
    // borderColor: 'yellow',
    justifyContent: "center",
    marginTop: 100,
  },
  CheckoutPay: {
    alignItems: "center",
    // borderWidth: 5,
    // borderColor: 'red',
    flex: 1,
    marginTop: 50,
  },
  categoryCard: {
    padding: 40,
  },
  categoryContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: "auto",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  menuContainer: {
    flex: 1,
    paddingLeft: NormalisedSizes(32),
    paddingRight: NormalisedSizes(32),
    paddingTop: NormalisedSizes(32),
    width: NormalisedSizes(1031),
  },
  menuItem: {
    alignItems: "center",
    borderWidth: 4,
    height: 150,
    justifyContent: "space-around",
    width: 150,
  },
  menuItem_Drinks: {
    alignItems: "center",
    borderBottomColor: "yellow",
    borderTopColor: "yellow",
    borderWidth: 4,
    height: 150,
    justifyContent: "space-around",
    width: 150,
  },
  menuItemsContainer: {
    flex: 1,
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  modal: {
    // alignItems: "center",
    flex: 1,
    // justifyContent: "space-around",
    // borderWidth: 5,
    // borderColor: 'pink',
    width: "100%",
  },
  modalNav: {
    alignItems: "center",
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
    height: NormalisedSizes(80),
    justifyContent: "center",
  },
  splitMain: {
    flex: 3,
    width: NormalisedSizes(1031),
  },
  splitSide: {
    alignItems: "stretch",
    flex: 2,
    justifyContent: "space-between",
    width: NormalisedSizes(248),
  },
  splitUI: {
    flex: 1,
    flexDirection: "row",
    // alignItems: "stretch",
  },
});
