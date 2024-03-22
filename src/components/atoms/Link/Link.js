import PropTypes from "prop-types";
import React from "react";
import { Linking } from "react-native";
import StyledLink from "./Link.styles";

export const Link = ({ variants, variantStyle, url, ...props }) => {
  return (
    <StyledLink
      variants={variants ? variants : "primary"}
      variantStyle={variantStyle ? variantStyle : "underline"}
      onPress={() => Linking.openURL(url)}
      {...props}
    >
      {props.children}
    </StyledLink>
  );
};

Link.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  url: PropTypes.string,
  variants: PropTypes.oneOf(["primary", "secondary"]),
  variantStyle: PropTypes.oneOf(["regular", "underline"]),
};
