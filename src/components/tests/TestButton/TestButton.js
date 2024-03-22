import React from "react";
import PropTypes from "prop-types";
import { TouchableHighlight } from "react-native";

export default function TestButton({ onPress, children }) {
  return (
    <TouchableHighlight title="primary" onPress={onPress}>
      {children}
    </TouchableHighlight>
  );
}

TestButton.defaultProps = {
  children: null,
  onPress: () => {},
};

TestButton.propTypes = {
  children: PropTypes.node,
  onPress: PropTypes.func,
};
