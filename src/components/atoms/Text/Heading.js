import PropTypes from "prop-types";
import React from "react";
import StyledHeading from "./Heading.styles";

export const Heading = ({ variants, variantStyle, ...props }) => (
  <StyledHeading
    variants={variants || "h1"}
    variantStyle={variantStyle || "default"}
    {...props}
  >
    {props.children}
  </StyledHeading>
);

Heading.propTypes = {
  // children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  variants: PropTypes.oneOf(["h1", "h2", "h3", "h4", "h5", "h6"]),
  variantStyle: PropTypes.oneOf(["default", "bold"]),
};
