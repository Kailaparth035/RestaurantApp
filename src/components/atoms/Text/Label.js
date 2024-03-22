import PropTypes from "prop-types";
import React from "react";
import StyledLabel from "./Label.styles";

export const Label = ({ variants, variantStyle, buttonLabel, ...props }) => {
  return (
    <StyledLabel
      variants={variants ? variants : "label"}
      buttonLabel={buttonLabel ? buttonLabel : "none"}
      variantStyle={variantStyle ? variantStyle : "uppercaseBold"}
      {...props}
    >
      {props.children}
    </StyledLabel>
  );
};

Label.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  buttonLabel: PropTypes.oneOf([
    "none",
    "LabelTinyBtn",
    "LabelMediumBtn",
    "LabelGiantBtn",
    "LabelLargeBtn",
  ]),
  variants: PropTypes.oneOf(["label"]),
  variantStyle: PropTypes.oneOf([
    "regular",
    "uppercaseBold",
    "uppercaseNormal",
  ]),
};
