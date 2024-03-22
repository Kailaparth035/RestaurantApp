import PropTypes from "prop-types";
import React from "react";
import StyledBlock from "./Block.styles";

export const Block = ({
  padding,
  backgroundColor,
  width,
  height,
  flexBasis,
  margin,
  ...props
}) => {
  return (
    <StyledBlock
      padding={padding}
      backgroundColor={backgroundColor}
      width={width}
      height={height}
      flexBasis={flexBasis}
      margin={margin}
      {...props}
    >
      {props.children}
    </StyledBlock>
  );
};

Block.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.array,
    PropTypes.any,
  ]),
  padding: PropTypes.number,
  flexBasis: PropTypes.number,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backgroundColor: PropTypes.string,
};
