/* eslint-disable no-constant-condition */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-warning-comments */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable import/extensions */

import { TopNavigation } from "@ui-kitten/components";
import React, { useContext, useState } from "react";
import { LogBox } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { Label, Subtitle } from "../../atoms/Text/index";
import BoxShadowNavigation from "../../molecules/BoxShadowNavigation";
import { ThemeContext } from "../../particles/ThemeContextProvider";
import { BackAction } from "./Actions/BackAction";
import { RightMenuActions } from "./Actions/RightMenuActions";
// https://github.com/akveo/react-native-ui-kitten/issues/1518 which relates to https://stackoverflow.com/questions/69141707/react-native-warning-receiving-warning-from-the-console
LogBox.ignoreLogs(["EventEmitter.removeListener('change', ...)"]);

export function TopNav({ navigation, route }: any) {
  const { toggleTheme } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    employeeUser,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
  } = useAuth();

  const locationName = selectedLocation?.name;
  const menuName = selectedMenu?.name;
  const eventName = selectedEvent?.name;
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const title = () => (
    <Label
      style={{ textAlign: "center" }}
      variants={undefined}
      variantStyle={undefined}
      buttonLabel={undefined}
    >
      {
          eventName || ''
        // @ts-ignore
        // RoutesDisplayName[route.name]
      }
    </Label>
  );

  const subtitle = () => (
    <>
      <Subtitle variants="s2" variantStyle={undefined}>
        {/* {eventName ? `${eventName} - ` : ""} */}
        {locationName ?? ""} {menuName ? ":  " : ""}
        {menuName ?? ""}
      </Subtitle>
      <Subtitle variants="s2" variantStyle={undefined}>{`${
        employeeUser?.username ? employeeUser.username : "User"
      }`}</Subtitle>
    </>
  );

  return (
    <BoxShadowNavigation level="1">
      <TopNavigation
        alignment="center"
        title={title}
        subtitle={subtitle}
        accessoryLeft={BackAction}
        accessoryRight={
          <RightMenuActions
            navigation={navigation}
            route={route}
            menuVisible={menuVisible}
            toggleMenu={toggleMenu}
            toggleTheme={toggleTheme}
          />
        }
      />
    </BoxShadowNavigation>
  );
}
