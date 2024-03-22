/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */

import React from "react";
import { useTheme } from "@ui-kitten/components";
import { useAuth } from "../../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { Label } from "../../atoms/Text";
import { Block, Box } from "../../layouts/Index";
import DropdownSelect from "../../molecules/DropdownSelect/DropdownSelect";

const MenuDropdown = ({ menuData, onSelect, selectedIndex, selectedValue }) => {
  const theme = useTheme();
  const { updateTabletSelections } = useAuth();

  return (
    <Box>
      <Block style={{ marginBottom: NormalisedSizes(16) }}>
        <Label
          variantStyle="uppercaseBold"
          style={{
            fontSize: NormalisedFonts(21),
            lineHeight: NormalisedFonts(21),
            color: theme["color-basic-600"],
          }}
        >
          Menu Name
        </Label>
      </Block>
      <DropdownSelect
        items={menuData}
        onSelectIndex={(index) => onSelect(index)}
        selectedIndex={selectedIndex}
        selectedValue={selectedValue}
      />
    </Box>
  );
};

export default MenuDropdown;
