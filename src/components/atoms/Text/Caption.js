import PropTypes from "prop-types";
import React from "react";
import StyledCaption from "./Caption.styles";

export const Caption = ({ variants, variantStyle, ...props }) => {
  return (
    <StyledCaption
      variants={variants ? variants : "c1"}
      variantStyle={variantStyle ? variantStyle : "default"}
      {...props}
    >
      {props.children}
    </StyledCaption>
  );
};

Caption.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  variants: PropTypes.oneOf(["c1", "c2"]),
  variantStyle: PropTypes.oneOf(["default"]),
};
