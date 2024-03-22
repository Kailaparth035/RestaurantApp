/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/require-default-props */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable import/prefer-default-export */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable import/newline-after-import */

import PropTypes from "prop-types";
import React from "react";
import StyledParagraph from "./Paragraph.styles";
export const Paragraph = ({ variants, variantStyle, ...props }) => {
  return (
    <StyledParagraph
      variants={variants ? variants : "p1"}
      variantStyle={variantStyle ? variantStyle : "default"}
      {...props}
    >
      {props.children}
    </StyledParagraph>
  );
};

Paragraph.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  variants: PropTypes.oneOf(["p1", "p2"]),
  variantStyle: PropTypes.oneOf(["default", "bold"]),
};
