import PropTypes from "prop-types";
import React from "react";
import StyledSubtitle from "./Subtitle.styles";

export const Subtitle = ({ variants, variantStyle, ...props }) => {
  return (
    <StyledSubtitle
      variants={variants ? variants : "s1"}
      variantStyle={variantStyle ? variantStyle : "regular"}
      {...props}
    >
      {props.children}
    </StyledSubtitle>
  );
};

Subtitle.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  variants: PropTypes.oneOf(["s1", "s2", "s3"]),
  variantStyle: PropTypes.oneOf(["regular", "semiBold", "bold"]),
};
