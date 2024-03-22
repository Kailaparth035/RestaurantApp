// consider alternative: https://akveo.github.io/react-native-ui-kitten/docs/design-system/custom-component-mapping#create-a-custom-component-mapping
// FIXME: ToucheableHighlight doesn't offer borderColor option... need to consider Pressable or do component mapping

import { withStyles } from "@ui-kitten/components";
import { TouchableHighlight } from "react-native";
import styled from "styled-components/native";
import { NormalisedSizes } from "../../../hooks/Normalized";

const StyledMenuItem = styled(TouchableHighlight).attrs((props) => ({
  underlayColor: props.eva.style.pressedBackgroundColor,
}))`
  background-color: ${(props) => props.eva.style.backgroundColor};
  width: ${NormalisedSizes(309)}px;
  height: ${NormalisedSizes(100)}px;
  padding-right: ${NormalisedSizes(6.5)}px;
  padding-left: ${NormalisedSizes(6.5)}px;
  padding-top: ${NormalisedSizes(12)}px;
  padding-bottom: ${NormalisedSizes(12)}px;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
  border-color: ${(props) =>
    props.inCart
      ? props.eva.style.pressedBorderColor
      : props.eva.style.borderColor};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  margin-top: 5px;
  margin-bottom: 5px;
`;

export default withStyles(StyledMenuItem, (theme) => ({
  backgroundColor: theme["background-basic-color-2"],
  borderColor: theme["color-basic-200"],
  pressedBackgroundColor: theme["color-primary-100"],
  pressedBorderColor: theme["color-primary-500"],
}));
