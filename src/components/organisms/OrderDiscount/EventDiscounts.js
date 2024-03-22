import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import {
  Button,
  Layout,
  Select,
  SelectItem,
  useTheme,
} from "@ui-kitten/components";
import PropTypes from "prop-types";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { useTrackedState } from "../../../contexts/CartContext";
import { DiscountContext } from "../../../contexts/DiscountContext";
import { displayForLocale, getSubtotalAfterDiscount } from "../../../helpers/calc";
import { Caption } from "../../atoms/Text";

const styles = StyleSheet.create({
  clearButton: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
  outerView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectView: {
    flex: 3,
  },
});


export const EventDiscounts = ({ discounts, selectDiscount }) => {

  const renderOption = (selectData, index) => (
    <SelectItem title={selectData.name} key={index} />
  );
  const [selectedDiscount, setSelectedDiscount] = React.useState(null);
  const onSelect = ({row}) => {
    setSelectedDiscount(discounts[row]);
  }
  const onSelectDiscount = () => {
    selectDiscount(selectedDiscount);
  }
  
  return (
    <Layout style={styles.layout} level="1">
      {/* <DiscountHeader /> */}
      <View style={styles.outerView}>
        <View style={styles.selectView}>
          <Select
            placeholder="Select Discount"
            value={selectedDiscount?.code || null}
            onSelect={onSelect}
          >
            {discounts && discounts.map(renderOption)}
          </Select>
        </View>
        <View style={styles.clearButton}>
          <Button
            title="APPLY"
            onPress={onSelectDiscount}
            size="small"
            style={{ marginLeft: 10 }}
          >
            APPLY
          </Button>
        </View>
      </View>
    </Layout>
  );
};

const enhance = withObservables(["discounts"], ({ database }) => ({
  discounts: database.collections.get("discounts").query().observe(),
}));

export default withDatabase(enhance(EventDiscounts));
