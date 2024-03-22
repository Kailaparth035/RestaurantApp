/* eslint-disable no-unused-vars */
import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledHeading = styled(Text).attrs((props) => ({
  category: props.variants,
  variantStyle: props.variantStyle,
}))`
  font-family: "OpenSans-Bold";
  font-weight: 700;
  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style.fontSize[`${props.category}`])}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style.lineHeight[`${props.category}`])}px`};
`;

export default withStyles(StyledHeading, (theme) => ({
  fontSize: {
    h1: 58,
    h2: 37,
    h3: 26,
    h4: 22,
    h5: 20,
    h6: 19,
  },
  lineHeight: {
    h1: 72.5,
    h2: 46.25,
    h3: 32.5,
    h4: 27.5,
    h5: 25,
    h6: 23.75,
  },
}));
