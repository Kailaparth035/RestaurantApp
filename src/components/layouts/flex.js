import PropTypes from "prop-types";
import React from "react";
import StyledFlex from "./Flex.styles";

export const Flex = ({
  flexDirection,
  flexWrap,
  alignContent,
  alignItems,
  justifyContent,
  cells,
  ...props
}) => {
  return (
    <StyledFlex
      flexDirection={flexDirection}
      flexWrap={flexWrap}
      alignContent={alignContent}
      alignItems={alignItems}
      justifyContent={justifyContent}
      cells={cells}
      {...props}
    >
      {props.children}
    </StyledFlex>
  );
};

Flex.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  alignContent: PropTypes.string,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
  cells: PropTypes.number,
};
