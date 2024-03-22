import { withStyles } from "@ui-kitten/components";
import { View } from "react-native";
import styled from "styled-components/native";

const StyledBlock = styled(View).attrs((props) => ({
  newBackgroundColor: props.backgroundColor,
  newWidth: props.width,
  newHeight: props.height,
  newPadding: props.padding,
  newMargin: props.margin,
  newFlexBasis: props.flexBasis,
}))`
  ${(props) => {
    props.newFlexBasis ? `flex:  ${props.newFlexBasis};` : "";
    props.newWidth
      ? `width:  ${props.newWidth};`
      : `width: ${props.eva.style.width.default};`;
    props.newPadding
      ? `padding:  ${props.newPadding};`
      : `padding: ${props.eva.style.padding.default};`;
    props.newMargin ? `margin:  ${props.newMargin};` : "";
    props.newHeight ? `height:  ${props.newHeight};` : "";
    props.newBackgroundColor
      ? `background-color: ${props.newBackgroundColor};`
      : "";
  }};
`;

export default withStyles(StyledBlock, (theme) => ({
  padding: { default: 0 },
  width: { default: "100%" },
}));
