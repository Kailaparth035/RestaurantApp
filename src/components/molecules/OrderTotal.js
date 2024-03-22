import { useTheme } from "@ui-kitten/components";
import React, { useContext } from "react";
import { TransactionContext } from "../../contexts/TransactionContext";
import { formatCentsForUiDisplay, displayForLocale } from "../../helpers/calc";
import { Heading } from "../atoms/Text";

export function OrderTotal() {
  const { orderTotals } = useContext(TransactionContext);
  const {total_paid} = orderTotals
  const theme = useTheme();

  return (
    <>
      <Heading variants="h4" style={{ color: `${theme["color-basic-700"]}` }}>
        Order Total
      </Heading>
      <Heading variants="h1">{displayForLocale(total_paid)}</Heading>
    </>
  );
}
