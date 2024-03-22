/* eslint-disable no-else-return */
import { Q } from "@nozbe/watermelondb";
import { getEventsQuery } from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";
import { WriteLog } from "../../src/CommonLogFile";

// export const syncEvents = async (
//   client,
//   organizationId,
//   database,
//   showLoading
// ) => {
//   // const lastSyncTime = BIG_BANG_TIME;
//   WriteLog("eventSyncFile call");
//   console.log("eventSyncFile call ::::");
//   const events = database.collections.get("events");
//   let res;
//   try {
//     res = await client.query({
//       query: getEventsQuery,
//       variables: {
//         organizationId,
//       },
//     });

//     // if (res.data.events.length > 0) {
//     //   try {
//     //     await database.write(async () => {
//     //       let eventResponse = await database.collections
//     //         .get("events")
//     //         .query()
//     //         .fetch();

//     //       const deletedEvents = eventResponse.map((comment) =>
//     //         comment.prepareDestroyPermanently()
//     //       );
//     //       database.batch(deletedEvents);
//     //     });
//     //   } catch (error) {
//     //     WriteLog("eventSyncFile delet events tabale error :: " + error);
//     //     console.log("delet events tabale error :: ", error);
//     //   }
//     // }
//     WriteLog("eventSyncFile Event Response ::: " + res);
//     console.log("Event Response :::", JSON.stringify(res));
//     const batchActions = [];
//     const eventsUpdates = res.data.events.map(async (event) => {
//       let localevent;

//       try {
//         localevent = await events.find(event.id.toString());
//       } catch (error) {}

//       const existingevent = localevent && localevent?._raw;

//       if (existingevent?.id) {
//         batchActions.push(
//           localevent.prepareUpdate((record) => {
//             record.eventId = event.id;
//             record.configuration = event.configuration;
//             record.name = event.name;
//             record.currency = event.currency;
//             record.timezone = event.timezone;
//             record.startDate = event.start_date;
//             record.endDate = event.end_date;
//             record.paymentTypes = event.payment_types;
//             record.availableTokens = event.available_tokens;
//             record.organizationId = event.organization_id;
//             record.dynamic_descriptor = event.dynamic_descriptor;
//             record.digital_surcharge_label = event.digital_surcharge_label;
//             record.is_org_logout_protected = event.is_org_logout_protected;
//             record.is_clerk_logout_protected = event.is_clerk_logout_protected;            
//             record.event_passcode = event.event_passcode;
//           })
//         );
//         return true;
//       } else {
//         batchActions.push(
//           events.prepareCreate((record) => {
//             record._raw.id = event.id.toString();
//             record.eventId = event.id;
//             record.configuration = event.configuration;
//             record.name = event.name;
//             record.currency = event.currency;
//             record.timezone = event.timezone;
//             record.startDate = event.start_date;
//             record.endDate = event.end_date;
//             record.paymentTypes = event.payment_types;
//             record.availableTokens = event.available_tokens;
//             record.organizationId = event.organization_id;
//             record.dynamic_descriptor = event.dynamic_descriptor;
//             record.digital_surcharge_label = event.digital_surcharge_label;
//             record.is_org_logout_protected = event.is_org_logout_protected;
//             record.is_clerk_logout_protected = event.is_clerk_logout_protected;
//             record.event_passcode = event.event_passcode;
//           })
//         );
//         return true;
//       }
//     });
//     await Promise.all(eventsUpdates);

//     try {
//       await database.write(async () => {
//         try {
//           await database.batch(batchActions);
//         } catch (error) {
//           WriteLog("eventSyncFile error " + error);
//           console.log({ error });
//         }
//       });
//     } catch (error) {
//       WriteLog("eventSyncFile error " + error);
//       console.log({ error });
//     }

//     if (showLoading !== undefined) {
//       setTimeout(() => {
//         showLoading(false);
//       }, 5000);
//     }

//     return await setLastSync({ endpoint: "events" });
//   } catch (e) {
//     if (showLoading !== undefined) {
//       setTimeout(() => {
//         showLoading(false);
//       }, 5000);
//     }
//     WriteLog("eventSyncFile error " + e);
//     console.log("sync events error", e);
//     return e;
//   }
// };
