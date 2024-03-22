/* eslint-disable no-unused-vars */
import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledParagraph = styled(Text).attrs((props) => ({
  category: props.variants,
  variantStyle: props.variantStyle,
}))`
  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style.fontSize[`${props.category}`])}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style.lineHeight[`${props.category}`])}px`};
`;

export default withStyles(StyledParagraph, (theme) => ({
  fontSize: {
    p1: 21,
    p2: 18,
  },
  lineHeight: {
    p1: 30,
    p2: 26,
  },
}));
