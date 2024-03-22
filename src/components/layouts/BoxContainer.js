import PropTypes from "prop-types";
import React from "react";
import StyledBox from "./BoxContainer.styles";

export const Box = ({
  padding,
  margin,
  backgroundColor,
  width,
  height,
  flexBasis,
  ...props
}) => {
  return (
    <StyledBox
      margin={margin}
      width={width}
      height={height}
      flexBasis={flexBasis}
      padding={padding}
      {...props}
    >
      {props.children}
    </StyledBox>
  );
};

Box.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  flexBasis: PropTypes.number,
};
