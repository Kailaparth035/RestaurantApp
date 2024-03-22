import { useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@ui-kitten/components";
import React from "react";

const goBackIcon: React.FC<any> = (props) => (
  <Icon {...props} name="arrow-back-outline" />
);
export const ButtonGoBack: React.FC<any> = ({ linkRef }) => {
  const navigation = useNavigation();
  return (
    <Button
      accessoryLeft={goBackIcon}
      appearance="ghost"
      onPress={() => navigation.navigate({ key: linkRef })}
    >
      {"Go back"}
    </Button>
  );
};
