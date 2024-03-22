/* eslint-disable react/prop-types */

import { Layout } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";

export default function LayoutContainer({ children }) {
  return <Layout>{children}</Layout>;
}

Layout.defaultProps = {
  children: null,
  level: null,
};

Layout.propTypes = {
  children: PropTypes.node,
  level: PropTypes.string,
};
