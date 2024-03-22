import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { CloseXCircleIcon } from "../../components/atoms/Icons/Icons";
import { Heading, Label } from "../../components/atoms/Text";
import Row from "../../components/particles/Row";
import ACModule from "../../services/ACService";
import { useAuth } from "../../contexts/AuthContext";

export const TransactionDeclinedCredit = ({
  message,
  isTimedOut,
  setIsTimedOut,
  errorMessage,
  setIsTransacting,
  setReaderEvent,
  handleRestart,
  refId
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {allowBatchMode} = useAuth();
  const handleCancel = () => {
    ACModule.cancelTransaction(refId);
    navigation.pop();
  };

  if (!allowBatchMode) {
    errorMessage = "Offline Orders are Not Permitted, Check Internet Connectivity"
  }

 
  return (
    <>
      <CloseXCircleIcon
        width={100}
        height={100}
        fill={`${theme["color-primary-500"]}`}
        style={styles.marginVertical}
      />
      <Heading variants="h2">
        {errorMessage ? errorMessage : `Something Went Wrong...`}
      </Heading>
      <Heading variants="h3" style={{ color: `${theme["color-basic-700"]}` }}>
        Transaction {message ? message : "failed"}
      </Heading>
      <Heading variants="h4" style={{ color: `${theme["color-basic-700"]}` }}>
        Please flip back to cashier
      </Heading>
      <Row style={styles.marginVertical}>
        {/* TODO: Button Pair could be a component */}
        <View style={styles.sameWidth}>
          <ButtonExtended
            style={styles.button}
            title="Try Again"
            onPress={handleRestart}
            status="primary"
            size="giant"
          >
            <Label
              buttonLabel="none"
              variants="label"
              variantStyle="uppercaseBold"
            >
              Try Again
            </Label>
          </ButtonExtended>
        </View>
        <View style={styles.sameWidth}>
          <ButtonExtended
            style={styles.button}
            onPress={handleCancel}
            status="secondary"
            size="giant"
          >
            <Label
              buttonLabel="none"
              variants="label"
              variantStyle="uppercaseBold"
            >
              Cancel
            </Label>
          </ButtonExtended>
        </View>
      </Row>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  marginVertical: {
    marginVertical: 10,
  },
  sameWidth: {
    flex: 1,
  },
});
