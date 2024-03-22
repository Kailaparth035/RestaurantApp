/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import { Icon } from "@ui-kitten/components";
import React from "react";
import { StyleSheet } from "react-native";
import { NormalisedSizes } from "../../../hooks/Normalized";
// Menu / Store Icons
export const CartIcon = ({ props, style }) => (
  <Icon
    style={{
      tintColor: style.tintColor,
      width: NormalisedSizes(style.width),
      height: NormalisedSizes(style.height),
      marginTop: NormalisedSizes(-6),
    }}
    name="shopping-cart"
    {...props}
  />
);

export const MinusIcon = (props) => <Icon name="minus-outline" {...props} />;

export const FavoriteIcon = (props) => <Icon name="star" {...props} />;

export const UnFavoriteIcon = (props) => (
  <Icon name="star-outline" {...props} />
);

// Top Nav Icons
export const BackIcon = (props) => (
  <Icon name="arrow-back" fill={props.color ?? "black"} {...props} />
);

export const MenuIcon = (props) => <Icon name="more-vertical" {...props} />;

export const LogoutIcon = (props) => <Icon name="log-out" {...props} />;

export const ThemeIcon = (props) => <Icon name="moon-outline" {...props} />;

export const RefreshMenuItem = (props) => (
  <Icon name="cloud-download-outline" {...props} />
);

export const PendingSyncItem = (props) => (
  <Icon name="cloud-upload-outline" {...props} />
);

export const CardReaderDetails = (props) => (
  <Icon name="credit-card-outline" {...props} />
);

export const OfflineIcon = (props) => (
  <Icon name="cloud-upload-outline" {...props} />
);

export const InfoIcon = (props) => <Icon name="info-outline" {...props} />;

export const AlertIcon = (props) => <Icon name="alert-circle-outline" {...props} />;

export const BatteryIcon = (props) => (
  <Icon name="charging-outline" {...props} />
);

export const CardReaderIcon = (props) => (
  <Icon name="flash-outline" {...props} />
);

export const RFIDDetails = (props) => <Icon name="cast-outline" {...props} />;

export const ConnectReaderIcon = (props) => (
  <Icon name="cast-outline" {...props} />
);

export const OrderHistoryIcon = (props) => (
  <Icon name="credit-card-outline" {...props} />
);

// Authentication Icons
export const EyeIcon = (props) => <Icon {...props} name="eye" />;
export const EyeOffIcon = (props) => <Icon {...props} name="eye-off" />;
export const UsernameIcon = (props) => (
  <Icon {...props} name="person-outline" />
);

export const SettingsIcon = ({ props, style }) => (
  <Icon
    {...props}
    name="settings-2-outline"
    style={{
      tintColor: style.tintColor,
      width: NormalisedSizes(style.width),
      height: NormalisedSizes(style.height),
      marginTop: NormalisedSizes(-6),
    }}
  />
);

// Order History Icons
export const PrinterIcon = (props) => (
  <Icon {...props} name="printer-outline" />
);
export const KeypadIcon = (props) => <Icon {...props} name="keypad-outline" />;

// Edit Order Icons
export const PlusOutlineIcon = ({ props, style }) => (
  <Icon
    style={{
      tintColor: style.tintColor,
      width: NormalisedSizes(style.width),
      height: NormalisedSizes(style.height),
    }}
    name="plus-outline"
    {...props}
  />
);

export const MinusOutlineIcon = ({ props, style }) => (
  <Icon
    style={{
      tintColor: style.tintColor,
      width: NormalisedSizes(style.width),
      height: NormalisedSizes(style.height),
    }}
    name="minus-outline"
    {...props}
  />
);

// Payment
export const CheckmarkCircleIcon = (props) => (
  <Icon {...props} name="checkmark-circle-2-outline" />
);

export const CloseXCircleIcon = (props) => (
  <Icon name="close-circle-outline" {...props} />
);

export const CardIcon = (props) => (
  <Icon {...props} name="credit-card-outline" />
);

export const RightArrow = (props) => (
  <Icon {...props} name="arrowhead-right-outline" animation="pulse" />
);
// Design icon for fun
export const DesignIcon = (props) => (
  <Icon {...props} name="color-palette-outline" />
);

// Dialogue/Confirmation
export const CloseIcon = (props) => <Icon {...props} name="close" />;

// FIXME: pass props to external stylesheet?
const styles = StyleSheet.create({
  buttonAccessory: {
    height: NormalisedSizes(24),
    marginTop: NormalisedSizes(-6),
    width: NormalisedSizes(24),
  },
});
