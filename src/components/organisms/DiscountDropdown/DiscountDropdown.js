/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { DiscountContext } from "../../../contexts/DiscountContext";
import { NormalisedSizes } from "../../../hooks/Normalized";
import { Block, Box } from "../../layouts/Index";
import DropdownSelect from "../../molecules/DropdownSelect/DropdownSelect";

const DiscountDropdown = ({ discounts }) => {
  const theme = useTheme();

  const {
    previousIndex,
    selectedDiscount,
    setSelectedDiscount,
    discount,
    isDiscounted,
    setIsDiscounted,
    discountType,
  } = useContext(DiscountContext);

  useEffect(() => {
    if (selectedDiscount) {
      // console.log("Selected Discount", selectedDiscount);
      setIsDiscounted(true);
    }
  }, [selectedDiscount, setIsDiscounted]);

  // FIXME: "option" showing up when discount change. useeffect if discount changed then refresh list or set it back please select

  return (
    <Box>
      <Block style={{ marginBottom: NormalisedSizes(16) }}>
        {/* <Label
          variantStyle="uppercaseNormal"
          style={{
            fontSize: NormalisedFonts(21),
            lineHeight: NormalisedFonts(21),
            color: theme["color-basic-600"],
          }}
        >
          Discount Name
        </Label> */}
      </Block>
      <DropdownSelect
        items={discounts}
        // setContextState={addDiscount}
        setContextState={setSelectedDiscount}
        contextState={selectedDiscount}
      />
    </Box>
  );
};

const enhance = withObservables(["discounts"], ({ database }) => ({
  discounts: database.collections.get("discounts").query().observe(),
}));

export default withDatabase(enhance(DiscountDropdown));
