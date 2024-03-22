import { Layout, withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";

const StyledBox = styled(Layout).attrs((props) => {
  ({
    newFlexBasis: props?.flexBasis,
    newWidth: props.width,
    newHeight: props?.height,
    newMargin: props?.margin,
    newPadding: props?.padding,
  });
})`
  position: relative;
  ${(props) => {
    props.newFlexBasis ? `flex: ${props.newFlexBasis};` : "";
    props.newWidth ? `width: ${props.newWidth};` : "";
    props.newHeight ? `height: ${props.newHeight};` : "";
    props.newMargin ? `margin: ${props.newMargin};` : "";
    props.newPadding ? `padding: ${props.newPadding};` : "";
  }};
`;

export default withStyles(StyledBox, (theme) => ({
  padding: { default: 16 },
}));
