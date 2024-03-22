import { withStyles } from "@ui-kitten/components";
import { View } from "react-native";
import styled from "styled-components/native";

const StyledCenter = styled(View).attrs((props) => ({
  margin: props.margin,
  padding: props.padding,
}))`
  width: 100%;
  position: "relative";

  ${(props) => {
    props.padding
      ? `padding: ${props.padding};`
      : `padding:  ${props.eva.style.padding.default};`;
    props.margin
      ? `margin: ${props.margin};`
      : `margin:  ${props.eva.style.margin.default};`;
  }};
`;

export default withStyles(StyledCenter, (theme) => ({
  margin: { default: "0 auto" },
  padding: { default: 0 },
}));
