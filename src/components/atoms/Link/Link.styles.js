/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import { Text, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";
import { NormalisedFonts } from "../../../hooks/Normalized";

const StyledLink = styled(Text).attrs((props) => ({
  category: "p1",
  variants: props.variants,
  variantStyle: props.variantStyle,
}))`
  font-size: ${(props) =>
    `${NormalisedFonts(props.eva.style[props.variants].fontSize)}px`};
  line-height: ${(props) =>
    `${NormalisedFonts(props.eva.style[props.variants].lineHeight)}px`};
  color: ${(props) => props.eva.style[props.variants].color};
  font-weight: ${(props) => props.eva.style[props.variants].fontWeight};
  font-family: ${(props) => props.eva.style[props.variants].fontFamily};

  ${(props) =>
    props?.variantStyle
      ? `border-bottom-width:  ${NormalisedFonts(
          props.eva.style[props.variantStyle].borderBottomWidth
        )}px; 
        border-style:  ${props.eva.style[props.variantStyle].borderStyle};
        border-color:  ${props.eva.style[props.variantStyle].borderColor};
    `
      : ""};
`;

export default withStyles(StyledLink, (theme) => ({
  primary: {
    fontSize: 18,
    lineHeight: 20,
    color: theme["color-primary-500"],
    fontWeight: "700",
    fontFamily: "OpenSans-Bold",
  },

  underline: {
    borderBottomWidth: 2,
    borderStyle: "solid",

    borderColor: theme["color-primary-500"],
  },

  regular: { textDecorationLine: "none" },
}));

// line-height:  ${NormalisedFonts(
//     props.eva.style[props.variants].lineHeight
//   )};
//   color:
//     ${props.eva.style[props.variants].color}
//   ;`
