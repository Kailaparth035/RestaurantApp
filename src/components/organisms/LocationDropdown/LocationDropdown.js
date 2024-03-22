/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
import { Q } from "@nozbe/watermelondb";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { useTheme } from "@ui-kitten/components";
import React, { useContext } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../../hooks/Normalized";
import { Label } from "../../atoms/Text";
import { Block, Box } from "../../layouts/Index";
import DropdownSelect from "../../molecules/DropdownSelect/DropdownSelect";
import ACModule from "../../../services/ACService";

const handleConnect = async ({ localLocation }) => {
  ACModule.setMerchantCredentials(
    localLocation.consumerKey,
    localLocation.secretKey,
    localLocation.merchantId
  );
};

function LocationDropdown({
  locationData,
  selectedEventId,
  onSelectIndex,
  selectedIndex,
  selectedValue,
}) {
  const { updateTabletSelections } = useAuth();

  const theme = useTheme();
  const onSelect = async (e) => {
    handleConnect({
      localLocation: JSON.parse(
        locationData[e.row]._raw.payment_processor_config
      ),
    });
  };
  return (
    <Box>
      <Block style={{ marginBottom: NormalisedSizes(16) }}>
        <Label
          variantStyle="uppercaseBold"
          style={{
            fontSize: NormalisedFonts(21),
            lineHeight: NormalisedFonts(22),
            color: theme["color-basic-600"],
          }}
        >
          Location
        </Label>
      </Block>
      <DropdownSelect
        items={locationData}
        onSelectIndex={(index) => {
          onSelectIndex(index);
          onSelect(index);
        }}
        selectedIndex={selectedIndex}
        selectedValue={selectedValue}
      />
    </Box>
  );
}

// const enhance = withObservables(
//   ["locations", "selectedEventId"],
//   ({ database, selectedEventId }) => {
//     return ({
//       locations: database.collections
//         .get("locations")
//         .query(Q.where("event_id", Q.eq(selectedEventId)), Q.sortBy('name', Q.asc))
//         .observe(),
//     })
//   }
// );

// export default withDatabase(enhance(LocationDropdown));
export default LocationDropdown;