import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { GetBackTitle } from "../../../../helpers/GetRouteStrings";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { BackIcon } from "../../../atoms/Icons/Icons";
import { Label } from "../../../atoms/Text";
import { Box, Flex } from "../../../layouts/Index";
import { ConfirmationModal } from "../../ConfirmationModal";
import { View } from "react-native";
import { NormalisedSizes } from "../../../../hooks/Normalized";

export function BackAction() {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const handleBackButton = () => {
    if (
      (route && route.name === "OrderHistory") ||
      route?.name == "TenderedAmountStepCash" ||
      route?.name == "EditOrder" ||
      route.name === "CreateCustomItem"
    ) {
      // @ts-ignore
      navigation.navigate("Menu");
    } else if (route?.name === "AdminPanel") {
      // @ts-ignore
      navigation.navigate("PosConfig");
    } else {
      setVisible(true);
    }
  };

  return (
    <Box
      padding={undefined}
      margin={undefined}
      backgroundColor={undefined}
      width={undefined}
      height={undefined}
      flexBasis={undefined}
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection={undefined}
        flexWrap={undefined}
        alignContent={undefined}
        cells={undefined}
      >
        <View
          style={{
            marginLeft: 10,
            width: NormalisedSizes(180),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ButtonExtended
            variants="default"
            // @ts-ignore
            appearance="ghost"
            accessoryLeft={BackIcon}
            status="basic"
            size="large"
            onPress={() => handleBackButton()}
          >
            <Label
              buttonLabel="LabelLargeBtn"
              variants="label"
              variantStyle="uppercaseBold"
            >
              {route ? GetBackTitle(route) : "Back"}
            </Label>
          </ButtonExtended>
        </View>
        <ConfirmationModal
          visible={visible}
          setVisible={setVisible}
          fromOverflow={false}
        />
      </Flex>
    </Box>
  );
}
