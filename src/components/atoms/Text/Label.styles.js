/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledLabel = styled(Text).attrs((props) => ({
  category: props?.variants,
  variantStyle: props?.variantStyle,
  buttonLabel: props?.buttonLabel,
}))`
  font-weight: 700;
  font-family: ${(props) => props.eva.style[props.variantStyle].fontFamily};

  text-transform: ${(props) =>
    props.eva.style[props.variantStyle].textTransform};

  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style[props.buttonLabel].fontSize)}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style[props.buttonLabel].lineHeight)}px`};
`;

export default withStyles(StyledLabel, (theme) => ({
  none: {
    fontSize: 20,
    lineHeight: 23,
  },
  LabelGiantBtn: {
    fontSize: 25,
    lineHeight: 27,
  },
  LabelLargeBtn: {
    fontSize: 20,
    lineHeight: 22,
  },

  LabelMediumBtn: {
    fontSize: 14,
    lineHeight: 16,
  },

  LabelTinyBtn: {
    fontSize: 10,
    lineHeight: 12,
  },

  regular: { fontFamily: "OpenSans-Bold", textTransform: "none" },

  uppercaseBold: {
    fontFamily: "OpenSans-Bold",
    textTransform: "uppercase",
  },
  uppercaseNormal: {
    fontFamily: "OpenSans-Regular",
    textTransform: "uppercase",
  },
}));
