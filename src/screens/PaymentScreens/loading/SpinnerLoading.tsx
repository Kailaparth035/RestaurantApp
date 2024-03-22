import { useNavigation } from "@react-navigation/native";
import { Button, Spinner } from "@ui-kitten/components";
import React from "react";
import { Heading } from "../../../components/atoms/Text";

export const SpinnerAndCancel: React.FC = () => {
  const navigation = useNavigation();

  const handleCancel = () => {
    // @ts-ignore
    navigation.pop();
  };

  return (
    <>
      <Heading variants="h2" variantStyle="default">
        Please wait...
      </Heading>
      <Spinner />
      <Button onPress={handleCancel}>Cancel</Button>
    </>
  );
};
