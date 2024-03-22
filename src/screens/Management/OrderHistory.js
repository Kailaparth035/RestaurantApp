import { Q } from "@nozbe/watermelondb";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import React, { useEffect, useState } from "react";
import { Box, Flex } from "../../components/layouts/Index";
import { ContentViewAdmin } from "../../components/organisms/AdminPanel/ContentViewAdmin";
import NavigationAdminProvider from "../../components/organisms/AdminPanel/Navigation/NavigationAdminContext";
import { getCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

const OrderHistory = () => {
  // const eventIds = events.map((event) => event._raw.event_id);
  const [organizationId, setOrganizationId] = useState("");
  const [eventId, setEventId] = useState("");
  const getData = async () => {
    const OrganizerId = await getCachedItem(KEY_NAME.ORG_ID);
    const EventId = await getCachedItem(KEY_NAME.EVENT_ID);
    setOrganizationId(OrganizerId);
    setEventId(EventId);
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <Box>
      <NavigationAdminProvider>
        <Flex flexDirection="row" width="100%" height="100%">
          <ContentViewAdmin
            organizationId={organizationId}
            eventIds={eventId ? [eventId] : []}
            variants="orderHistory"
          />
        </Flex>
      </NavigationAdminProvider>
    </Box>
  );
};

// OrderHistory.displayName = "OrderHistory";

// const enhance = withObservables(["events"], ({ database, organizationId }) => ({
//   events: database.collections
//     .get("events")
//     .query(Q.where("organization_id", Q.eq(organizationId)))
//     .observe(),
// }));

// export default withDatabase(enhance(OrderHistory));
export default OrderHistory;
