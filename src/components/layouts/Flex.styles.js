import { withStyles } from "@ui-kitten/components";
import { View } from "react-native";
import styled from "styled-components/native";

const StyledFlex = styled(View).attrs((props) => ({
  newFlexDirection: props?.flexDirection,
  newFlexWrap: props?.flexWrap,
  newAlignContent: props?.alignContent,
  newAlignItems: props?.alignItems,
  newJustifyContent: props?.justifyContent,
  newCells: props?.cells,
}))`
  ${(props) => {
    props?.newFlexDirection
      ? `flex-direction: ${props.newFlexDirection};`
      : `flex-direction:  ${props.eva.style.flex.flexDirection};`;
    props?.newFlexWrap
      ? `flex-wrap: ${props.newFlexWrap};`
      : `flex-wrap:  ${props.eva.style.flex.flexWrap};`;
    props?.newAlignContent
      ? `align-content: ${props.newAlignContent};`
      : `align-content:  ${props.eva.style.flex.alignContent};`;
    props?.newAlignItems
      ? `align-items: ${props.newAlignItems};`
      : `align-items:  ${props.eva.style.flex.alignItems};`;
    props?.newJustifyContent
      ? `justify-content: ${props.newJustifyContent};`
      : `justify-content:  ${props.eva.style.flex.justifyContent};`;
    props?.cells
      ? `flex: ${props.cells};`
      : `flex:  ${props.eva.style.flex.cells};`;
  }};
`;

export default withStyles(StyledFlex, (theme) => ({
  flex: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    cells: 1,
  },
}));
