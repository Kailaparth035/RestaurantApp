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
import { useTrackedState } from "../contexts/CartContext";
import { DiscountContext } from "../contexts/DiscountContext";
import { displayForLocale, getSubtotalAfterDiscount } from "../helpers/calc";
import { Caption } from "./atoms/Text";

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

const DiscountSelect = ({ discounts }) => {
  const data = discounts || [];
  return <DiscountSelectChild data={data} />;
};

const DiscountSelectChild = ({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const {
    discount,
    setDiscount,
    setIsDiscounted,
    discountType,
    setDiscountType,
    previousIndex,
    setPreviousIndex,
    setSelectedDiscount,
    selectedDiscount,
  } = useContext(DiscountContext);

  const cartState = useTrackedState();

  const cartItems = cartState?.cartItems;
  const total = cartState?.total;

  const theme = useTheme();

  DiscountSelectChild.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  const onSelect = useCallback(
    (index) => {
      setSelectedIndex(index);
      setIsDiscounted(true);

      // TODO: setSelectedDiscount
      // selected Discount will store data[index]
      // INDEXING CORRECTLY
      // console.log(data[selectedIndex.row])
      // setDiscount(data[selectedIndex.row]?.percent)
      // console.log("DISCOUNT APPLIED", discount)
      // console.log(data[selectedIndex.row]?.percent)
      // setDiscountValue(data[selectedIndex.row]?.percent)
      // console.log("INDEX ROW", index.row)
    },
    [setIsDiscounted]
  );

  // const displayValue = data[selectedIndex.row]?.name;
  // const displayValue = data[selectedIndex]?.percent
  // console.log("DISPLAY VALUE", displayValue)
  const renderOption = (selectData, index) => (
    <SelectItem title={selectData.name} key={index} />
  );
  const selectRef = useRef();
  const handleClear = useCallback(() => {
    // console.log("CURRENT REF", selectRef)
    selectRef.current.clear();
    if (previousIndex) {
      setPreviousIndex(null);
      setSelectedIndex(null);
    }
    setIsDiscounted(false);
    setSelectedDiscount(null);
  }, [previousIndex, setIsDiscounted, setPreviousIndex, setSelectedDiscount]);

  const DiscountHeader = () => (
    <View>
      {discountType !== "percentage" ? (
        <Caption
          category="c2"
          style={{
            color: theme["color-primary-default"],
          }}
        >
          {displayForLocale(data[selectedIndex.row]?.amount)} OFF
        </Caption>
      ) : (
        <Caption
          style={{
            color: theme["color-primary-default"],
          }}
        >
          {data[selectedIndex.row]?.percentage}% OFF
        </Caption>
      )}
    </View>
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      if (data[selectedIndex.row]?.percentage !== null || "") {
        // setDiscount for Percentage
        setDiscount(data[selectedIndex.row]?.percentage);
        setDiscountType("percentage");
      } else {
        // setDiscount for $ Amount
        setDiscount(data[selectedIndex.row]?.amount);
        setDiscountType("amount");
      }
    }
    // console.log("selectedIndex is", selectedIndex)
  }, [data, selectedIndex, setDiscount, setDiscountType]);

  useEffect(() => {
    if (cartItems.length === 0) {
      handleClear();
      // FIXME: handleClear works but not setDisabled?
      // TODO: add useEffect listening to disabled state
      setDisabled(true);
    }
  }, [cartItems.length, handleClear]);

  useEffect(() => {
    if (cartItems.length > 0) {
      setDisabled(false);
    }
  }, [cartItems.length]);

  useEffect(() => {
    // FIXME: get previous discount via ref? Edit Order screen resets on each visit
    if (selectRef.current.props.selectedIndex !== null) {
      setPreviousIndex(selectRef.current.props.selectedIndex);
      // console.log("INDEX STORED: ", previousIndex)
      // setSelectedIndex(selectRef.current.props.selectedIndex)
    }
  }, [selectedIndex, setPreviousIndex]);

  useEffect(() => {
    // if preIndex !==null then setSelectedIndex to preVIndex
    // if (selectRef.current.props.selectedIndex !== null) {
    if (
      selectRef.current.props.selectedIndex === null &&
      previousIndex !== null
    ) {
      // console.log("PREVIOUS DISCOUNT WAS", previousIndex)
      // FIXME: only want this to fire once when screen loads
      onSelect(previousIndex);
      // setSelectedIndex(previousIndex)
      setPreviousIndex(null);
    }
    // cleanup
    // }
  }, [onSelect, previousIndex, selectedIndex, setPreviousIndex]);

  useEffect(() => {
    // TODO: capture discount object for order push mutation
    // FIXME: doesn't always work, saved state seems to always be last previous state
    // setSelectedDiscount(data[selectedIndex])
    if (selectRef.current.props.selectedIndex) {
      // console.log("SELECTED INDEX IS: ", selectedIndex)
      // console.log(data[])
      // setSelectedDiscount(data[selectRef.current.props.selectedIndex.row])
      setSelectedDiscount(data[selectedIndex.row]);
    }
    // console.log("SELECTED DISCOUNT OBJECT", selectedDiscount)
  }, [data, onSelect, selectedIndex, setSelectedDiscount]);

  useEffect(() => {
    // TODO: prevent selection of discount that leads to negative total value
    // FIXME: THIS WORKS to remove discount when selecting from dropdown but does not rerender component
    if (selectRef.current.props.selectedIndex) {
      const value = getSubtotalAfterDiscount(discount, total, discountType);

      if (value < 0) {
        alert("You cannot apply this discount to the current order.");
        handleClear();
      }
    }
  }, [discount, discountType, handleClear, selectedDiscount, total]);

  useEffect(() => {
    if (selectedDiscount) {
      // if selceted discount is true,
      const value = getSubtotalAfterDiscount(discount, total, discountType);
      if (value < 0) {
        alert("You cannot apply this discount to the current order.");
        handleClear();
      }
    }
    // when cartitems changes
  }, [cartItems, discount, discountType, handleClear, selectedDiscount, total]);

  // console.log("ON START, PREVIOUSINDEX IS", previousIndex)
  return (
    <Layout style={styles.layout} level="1">
      {selectedIndex !== null && <DiscountHeader />}
      <View style={styles.outerView}>
        <View style={styles.selectView}>
          <Select
            // label="Code"
            placeholder="Select Discount"
            selectedIndex={selectedIndex}
            value={
              selectedIndex === undefined || selectedIndex == null
                ? data[selectedIndex]?.code
                : data[selectedIndex.row]?.code
            }
            onSelect={onSelect}
            ref={selectRef}
            disabled={disabled}
          >
            {data && data.map(renderOption)}
          </Select>
        </View>
        <View style={styles.clearButton}>
          <Button
            title="Remove"
            onPress={handleClear}
            style={{ marginLeft: 10 }}
          >
            REMOVE
          </Button>
        </View>
      </View>
    </Layout>
  );
};

const enhance = withObservables(["discounts"], ({ database }) => ({
  discounts: database.collections.get("discounts").query().observe(),
}));

export default withDatabase(enhance(DiscountSelect));
