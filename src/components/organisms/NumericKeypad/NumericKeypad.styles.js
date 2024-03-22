/* eslint-disable no-unused-vars */

import { withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedSizes } from "../../../hooks/Normalized";
import { Block } from "../../layouts/Index";

const StyledKeypad = styled(Block).attrs((props) => ({
  variants: props.variants,
  variantStyle: props.variantStyle,
  newWidth: props.width,
}))`
  width: ${(props) => NormalisedSizes(props.newWidth)}px;
`;

export default withStyles(StyledKeypad, (theme) => ({}));
