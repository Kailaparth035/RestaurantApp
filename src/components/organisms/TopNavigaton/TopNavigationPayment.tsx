/* eslint-disable no-constant-condition */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-warning-comments */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable import/extensions */

import { TopNavigation } from "@ui-kitten/components";
import React, { useContext } from "react";
import { LogBox } from "react-native";
import { RoutesDisplayName } from "../../../constants/Routes";
import { AuthContext } from "../../../contexts/AuthContext";
import { Label, Subtitle } from "../../atoms/Text/index";
import BoxShadowNavigation from "../../molecules/BoxShadowNavigation";
// import { ThemeContext } from "../../particles/ThemeContextProvider";
// import { RightMenuActions } from "./Actions/RightMenuActions";
import { BackAction } from "./Actions/BackAction";
import { WriteLog } from "../../../../src/CommonLogFile";

// https://github.com/akveo/react-native-ui-kitten/issues/1518 which relates to https://stackoverflow.com/questions/69141707/react-native-warning-receiving-warning-from-the-console
LogBox.ignoreLogs(["EventEmitter.removeListener('change', ...)"]);

export function TopNavPayment({ navigation, route }: any) {
  // const { toggleTheme } = useContext(ThemeContext);
  // const [menuVisible, setMenuVisible] = useState(false);
  const {
    organizerUser,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
  } = useContext(AuthContext);

  const locationName = selectedLocation?.name;
  const menuName = selectedMenu.name;
  const eventName = selectedEvent.name;

  // const toggleMenu = () => {
  //   setMenuVisible(!menuVisible);
  // };

  const showAccessoryLeft = (accessoryProps: any) => {
    if (route.name === "TenderedAmountStepCash") {
      return <BackAction {...accessoryProps} />;
    }
    return null;
  };

  const title = () => (
    <Label
      style={{ textAlign: "center" }}
      variants={undefined}
      variantStyle={undefined}
      buttonLabel={undefined}
    >
      {
        // @ts-ignore
        RoutesDisplayName[route.name]
      }
    </Label>
  );

  const subtitle = () => (
    <Subtitle variants="s2" variantStyle={undefined}>
      {eventName ? `${eventName} - ` : ""}
      {`${organizerUser.username ? organizerUser.username : "User"}`}
      {locationName ? " - " : ""} {locationName ?? ""} {menuName ? " - " : ""}
      {menuName ?? ""}
    </Subtitle>
  );
  WriteLog("TopNavigationPayment" + { navigation: navigation, route: route });
  // console.log({ navigation, route });
  return (
    <BoxShadowNavigation level="1">
      <TopNavigation
        alignment="center"
        title={title}
        subtitle={subtitle}
        accessoryLeft={showAccessoryLeft}
        // accessoryRight={
        //   <RightMenuActions
        //     navigation={navigation}
        //     route={route}
        //     menuVisible={menuVisible}
        //     toggleMenu={toggleMenu}
        //     toggleTheme={toggleTheme}
        //   />
        // }
      />
    </BoxShadowNavigation>
  );
}
