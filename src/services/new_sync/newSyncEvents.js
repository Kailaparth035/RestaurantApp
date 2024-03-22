/* eslint-disable no-else-return */
import { getEventsQuery } from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncEvents = async (client, organizationId, database) => {
  const events = database.collections.get("events");
    try {
    let res = await client.query({
      query: getEventsQuery,
      variables: {
        organizationId,
      },
    });

    if (res.data.events.length > 0) {
      try {
        await database.write(async () => {
          let localEvents = await database.collections.get("events").query().fetch();
          const deleteAllLocalEvents = localEvents.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalEvents);
        });
      } catch (error) {
        console.log("delete local events tabale error :: ", error);
      }
      const batchActions = [];
      const eventsInsert = res.data.events.map(async (event) => {
        batchActions.push(
          events.prepareCreate((record) => {
            record._raw.id = event.id.toString();
            record.eventId = event.id;
            record.configuration = event.configuration;
            record.name = event.name;
            record.currency = event.currency;
            record.timezone = event.timezone;
            record.startDate = event.start_date;
            record.endDate = event.end_date;
            record.paymentTypes = event.payment_types;
            record.availableTokens = event.available_tokens;
            record.organizationId = event.organization_id;
            record.dynamic_descriptor = event.dynamic_descriptor;
            record.digital_surcharge_label = event.digital_surcharge_label;
            record.is_org_logout_protected = event.is_org_logout_protected;
            record.is_clerk_logout_protected = event.is_clerk_logout_protected;
            record.event_passcode = event.event_passcode;
          })
        );
        return true;
      });
      await Promise.all(eventsInsert);
      try {
        await database.write(async () => {
          try {
            await database.batch(batchActions);
            await setCachedItem(KEY_NAME.EVENTS_SYNC, 'true');
              console.log("@@===Event Done ===")           
          } catch (error) {
            console.log({ error });
          }
        });
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (e) {
    console.log("sync events error", e);
    return e;
  }
};
