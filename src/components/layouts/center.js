import PropTypes from "prop-types";
import React from "react";
import StyledCenter from "./Center.styles";

export const Center = ({ padding, margin, ...props }) => {
  return (
    <StyledCenter padding={padding} margin={margin} {...props}>
      {props.children}
    </StyledCenter>
  );
};

Center.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  padding: PropTypes.number,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
