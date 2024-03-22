import { useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet } from "react-native";
import MemoArrowIcon from "../atoms/Icons/ArrowIcon";
import { CardIcon, ConnectReaderIcon } from "../atoms/Icons/Icons";
import Row from "../particles/Row";

const PaymentMethodIcon = (props) => {
  const { paymentType } = props;
  if (paymentType === "RFID") {
    return <ConnectReaderIcon {...props} />;
  }
  return <CardIcon {...props} />;
};

export const PaymentAction = ({ paymentType }) => {
  const theme = useTheme();

  return (
    <Row style={styles.cardArrowRow}>
      <PaymentMethodIcon
        paymentType={paymentType}
        width={100}
        height={100}
        fill={`${theme["color-basic-700"]}`}
        style={styles.cardIcon}
      />
      <MemoArrowIcon width={100} height={100} />
    </Row>
  );
};

const styles = StyleSheet.create({
  cardArrowRow: {
    alignItems: "center",
    flexWrap: "nowrap",
    justifyContent: "space-around",
  },
  cardIcon: {
    marginRight: 33,
  },
});
