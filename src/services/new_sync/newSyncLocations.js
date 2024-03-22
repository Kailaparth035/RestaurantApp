/* eslint-disable no-else-return */
import { getLocationsQueryWithoutSync } from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncLocations = async (client, eventId, database) => {
  const locations = database.collections.get("locations");
  try {
    let res = await client.query({
      query: getLocationsQueryWithoutSync,
      variables: {
        eventId,
      },
    });

    if (res.data.locations.length > 0) {
      try {
        await database.write(async () => {
          let localLocations = await database.collections.get("locations").query().fetch();
          const deleteAllLocalLocations = localLocations.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalLocations);
        });
      } catch (error) {
        console.log("delete local locations tabale error :: ", error);
      }
      const batchActions = [];
      const locationsInsert = res.data.locations.map(async (location) => {
        batchActions.push(
          locations.prepareCreate((record) => {
            record._raw.id = location.id.toString();
            record.locationId = location.id;
            record.vendor_id = location.vendor_id;
            record.dynamic_descriptor = location.dynamic_descriptor;
            record.eventId = location.event_id;
            record.name = location.name;
            record.isActive = location.is_active;
            record.locationMenus = location.location_menus;
            record.paymentProcessorConfig =
              location?.payment_processor_config?.config;
            record.paymentProcessor =
              location?.payment_processor_config?.payment_processor;
            record.digital_surcharge_percentage =
              location.digital_surcharge_percentage;
            record.redeemableTokens =
              location.redeemable_tokens;
          })
        );
        return true;
      });
      await Promise.all(locationsInsert);
      try {
        await database.write(async () => {
          try {
            await database.batch(batchActions);
            console.log("@@===Location Done=========")
            await setCachedItem(KEY_NAME.LOCATIONS_SYNC, 'true');
          } catch (error) {
            console.log({ error });
          }
        });
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (e) {
    console.log("sync locations error", e);
    return e;
  }
};
