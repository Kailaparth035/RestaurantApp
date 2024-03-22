/* eslint-disable no-unused-vars */
import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledSubtitle = styled(Text).attrs((props) => ({
  category: props.variants,
  variantStyle: props.variantStyle,
}))`
  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style.fontSize[`${props.category}`])}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style.lineHeight[`${props.category}`])}px`};

  font-family: ${(props) => props.eva.style[props.variantStyle].fontFamily};
  font-weight: ${(props) =>
    props.eva.style[`${props.variantStyle}`].fontWeight};
`;

export default withStyles(StyledSubtitle, (theme) => ({
  bold: { fontFamily: "OpenSans-Bold", fontWeight: "600" },
  regular: { fontFamily: "OpenSans-regular", fontWeight: "400" },
  semiBold: { fontFamily: "OpenSans-SemiBold", fontWeight: "600" },

  fontSize: {
    s1: 22,
    s2: 20,
    s3: 18,
  },
  lineHeight: {
    s1: 30,
    s2: 24,
    s3: 20,
  },
}));
