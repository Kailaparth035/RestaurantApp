/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unused-prop-types */

import { Button } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";
import { CartIcon, MinusIcon } from "../../atoms/Icons/Icons";
// TODO: workaround for synthetic events

const Icons = {
  cart: CartIcon,
  minus: MinusIcon,
};

const KittenButton = ({ onPress, status, title, children, iconName }) => {
  if (iconName) {
    const getButtonIcon = (iconName) => {
      if (Icons[iconName] === undefined) {
        return null;
      }
      const Icon = Icons[iconName];
      return Icon;
    };
    return (
      <Button
        onPress={onPress}
        status={status}
        title={title}
        accessoryLeft={getButtonIcon(iconName)}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button onPress={onPress} status={status} title={title}>
      {children}
    </Button>
  );
};

KittenButton.defaultProps = {
  children: null,
  onPress: () => {},
  status: "primary",
  title: null,
  accessoryLeft: null,
};

KittenButton.propTypes = {
  children: PropTypes.node,
  onPress: PropTypes.func,
  status: PropTypes.string,
  title: PropTypes.string,
  accessoryLeft: PropTypes.func,
};

export default KittenButton;
