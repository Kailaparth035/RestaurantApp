import { withStyles } from "@ui-kitten/components";
import styled from "styled-components/native";

const StyledTopBarWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: ${(props) => props.eva.style.backgroundColor};
  padding: 31px;
`;
export default withStyles(StyledTopBarWrapper, (theme) => ({
  backgroundColor: theme["color-primary-default"],
}));
