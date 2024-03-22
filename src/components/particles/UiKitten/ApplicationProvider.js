/* eslint-disable no-unused-vars */
/* eslint-disable import/no-named-default */
/* eslint-disable import/prefer-default-export */

import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import React from "react";
import { default as customMapping } from "../../../styles/custommapping.json";
import { default as lightTheme } from "../../../styles/light-theme.json";
import EvaIcons from "./IconRegistry";
import UiKittenProvider from "./UiKittenContext";

export const EvaDesignWrapper = (getStory) => (
  <UiKittenProvider>
    <EvaIcons />
    <ApplicationProvider
      {...eva}
      theme={lightTheme}
      customMapping={customMapping}
    >
      {getStory()}
    </ApplicationProvider>
  </UiKittenProvider>
);
