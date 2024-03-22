import { Q } from "@nozbe/watermelondb";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { useTheme } from "@ui-kitten/components";
import React, { useContext, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { Label } from "../../atoms/Text";
import { Block, Box } from "../../layouts/Index";
import DropdownSelect from "../../molecules/DropdownSelect/DropdownSelect";
import { WriteLog } from "../../../../src/CommonLogFile";

const TaxDropDown = ({ taxType, setSelectedTextype, selectedTaxType }) => {
  const theme = useTheme();
  return (
    <Box>
      <Block style={{ paddingBottom: NormalisedSizes(16) }}>
        <Label
          variantStyle="uppercaseBold"
          style={{
            fontSize: NormalisedFonts(21),
            lineHeight: NormalisedFonts(22),
            color: theme["color-basic-600"],
          }}
        >
          Include Tax
        </Label>
      </Block>
      <DropdownSelect
        items={taxType}
        onSelectIndex={(taxType) => {
          WriteLog("TaxDropDown taxType." + taxType);
          console.log("taxType :::", taxType), setSelectedTextype(taxType);
        }}
        selectedValue={selectedTaxType}
      />
    </Box>
  );
};

export default TaxDropDown;
