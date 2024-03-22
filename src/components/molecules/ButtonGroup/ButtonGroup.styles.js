import { Button, withStyles } from "@ui-kitten/components";
import { LogBox } from "react-native";
import styled from "styled-components";

// FIXME: find an alternate approach?
LogBox.ignoreLogs(["Node of type rule not supported as an inline style"]);

const ButtonToggle = styled(Button)`
  margin: 0 5px 5px 0;
  border-radius: 25px;
  padding-horizontal: 5px;
  padding-vertical: 0px;
  ${({ active }) =>
    active &&
    `
    backgroundColor: ${(props) => props.eva.style.backgroundColor};
    borderColor: ${(props) => props.eva.style.borderColor};
  `}
`;

export default withStyles(ButtonToggle, (theme) => ({
  backgroundColor: theme["color-primary-default"],
  borderColor: theme["color-primary-default-border"],
}));
