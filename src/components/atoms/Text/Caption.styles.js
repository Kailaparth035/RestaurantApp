/* eslint-disable no-unused-vars */

import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledCaption = styled(Text).attrs((props) => ({
  category: props.variants,
  variantStyle: props.variantStyle,
}))`
  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style.fontSize[`${props.category}`])}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style.lineHeight[`${props.category}`])}px`};
`;

export default withStyles(StyledCaption, (theme) => ({
  fontSize: {
    c1: 20,
    c2: 18,
  },
  lineHeight: {
    c1: 23,
    c2: 21,
  },
}));
