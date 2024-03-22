/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable import/extensions */
/* eslint-disable react/no-unstable-nested-components */
import { DdRumReactNavigationTracking } from "@datadog/mobile-react-navigation";
import { NavigationContainer } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React from "react";
import CalculatorContextProvider from "./contexts/CalculatorContextProvider";
import { CartProvider } from "./contexts/CartContext";
import { CustomItemsProvider } from "./contexts/CustomItemsProvider";
import DiscountContextProvider from "./contexts/DiscountContext";
import TransactionContextProvider from "./contexts/TransactionContext";
import CardReaderContextProvider from "./contexts/CardReaderContext";
import NavigationScreen from "./Navigation";

// const RootStack = createStackNavigator();

export function Main() {

  const theme = useTheme();
  const navigationRef = React.useRef(null);
  return (
    <DiscountContextProvider>
      <CartProvider>
        <CustomItemsProvider>
          <TransactionContextProvider>
            <CalculatorContextProvider>
              <CardReaderContextProvider>
                <NavigationContainer
                  theme={{
                    // @ts-ignore
                    colors: { background: theme["background-basic-color-1"] },
                  }}
                  ref={navigationRef}
                  onReady={() => {
                    DdRumReactNavigationTracking.startTrackingViews(
                      navigationRef.current
                    );
                  }}
                >

                  <NavigationScreen />


                </NavigationContainer>
              </CardReaderContextProvider>
            </CalculatorContextProvider>
          </TransactionContextProvider>
        </CustomItemsProvider>
      </CartProvider>
    </DiscountContextProvider>
  );
}
