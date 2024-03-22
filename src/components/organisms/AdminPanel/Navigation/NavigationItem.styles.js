/* eslint-disable no-unused-vars */
import { withStyles } from "@ui-kitten/components";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { NormalisedSizes } from "../../../../hooks/Normalized";

const StyledNavigationItem = styled(TouchableOpacity).attrs((props) => ({
  variantState: props.variants,
}))`
  ${(props) =>
    props?.variantState === "focused"
      ? `color: ${props.eva.style.focused.color};
      background-color: ${props.eva.style.focused.backgroundColor};
      border-color: ${props.eva.style.focused.borderColor};
      border-left-width: ${props.eva.style.focused.borderLeftWidth};
      margin-left: ${props.eva.style.focused.marginLeft};
      `
      : ""}

  ${(props) =>
    props?.variantState === "default"
      ? `margin-left: ${props.eva.style.default.marginLeft};
      border-bottom-width: ${NormalisedSizes(2)}px;
      border-color: ${props.eva.style.default.borderColor};
      `
      : ""}
`;

export default withStyles(StyledNavigationItem, (theme) => ({
  focused: {
    color: theme["color-primary-500"],
    backgroundColor: "#fbcccb",
    borderColor: theme["color-primary-500"],
    borderLeftWidth: NormalisedSizes(4),
    marginLeft: 0,
  },

  default: {
    marginLeft: NormalisedSizes(4),
    borderColor: theme["color-basic-25"],
  },
}));
