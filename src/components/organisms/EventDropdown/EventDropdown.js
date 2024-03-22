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

function EventDropdown({
  eventData,
  setSelectedEvent,
  selectedValue,
  onSelectEvent,
}) {
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
          Event/Venue Name
        </Label>
      </Block>
      <DropdownSelect
        items={eventData}
        selectedValue={selectedValue}
        onSelectIndex={(index) => onSelectEvent(index)}
      />
    </Box>
  );
}

// const enhance = withObservables(["events"], ({ database, organisationId }) => ({
//   events: database.collections
//     .get("events")
//     .query(Q.where("organization_id", Q.eq(organisationId)))
//     .observe(),
// }));

// export default withDatabase(enhance(EventDropdown));

export default EventDropdown;
