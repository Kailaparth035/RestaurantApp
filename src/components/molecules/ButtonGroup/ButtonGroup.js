/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
/* eslint-disable import/prefer-default-export */
import React from "react";
import { View } from "react-native";
import ButtonToggle from "./ButtonGroup.styles";

// const displayType = (type) => {
//   if (type === "Amount") {
//     return `${type} $`;
//   }
//   if (type === "Percentage") {
//     return `${type} %`;
//   }
//   return type;

// };

export const ButtonGroup = ({ types, setActive = () => {}, active, displayType }) => (
  <View>
    <View style={{ flexDirection: "row", width: '100%' }}>
      {types.map((type) => (
        <ButtonToggle
          key={type}
          active={active === type}
          onPress={
            () => setActive(type)
          }
          status="combined"
          style={{ margin: 10 }}
        >
          {displayType(type)}
        </ButtonToggle>
      ))}
    </View>
    {/* <View style={{ flexDirection: "row", width: '100%', borderWidth: 1 }}>
      {types.map(
        (type, index) =>
          index >= 2 && (
            <ButtonToggle
              key={type}
              active={active === type}
              onPress={
                active === type ? () => setActive(null) : () => setActive(type)
              }
              status="combined"
            >
              {displayType(type)}
            </ButtonToggle>
          )
      )}
    </View> */}
  </View>
);
