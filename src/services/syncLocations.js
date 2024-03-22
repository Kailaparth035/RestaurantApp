import BackgroundTimer from "react-native-background-timer";
import nextFrame from "next-frame";
// import { database } from "../../data/database";
import { getLocationsQueryWithoutSync } from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";
import { WriteLog } from "../../src/CommonLogFile";

// export const syncLocations = async ({
//   client,
//   eventId,
//   withoutSync,
//   database,
//   setChunksToSync,
//   onChunkSync,
// }) => {
  // let lastSyncTime = BIG_BANG_TIME;
  // const locations = database.collections.get("locations");
  // if (!withoutSync) {
  //   const lastSync = await getLastSync({ endpoint: "locations" });
  //   if (lastSync) {
  //     lastSyncTime = lastSync;
  //   }
  // }

  // let res;

  // try {
  //   res = await client.query({
  //     query: getLocationsQueryWithoutSync,
  //     variables: {
  //       eventId,
  //     },
  //   });

  //   if (res.data.locations.length > 0) {
  //     try {
  //       await database.write(async () => {
  //         let locationResponse = await database.collections
  //           .get("locations")
  //           .query()
  //           .fetch();

  //         const deletedLocations = locationResponse.map((comment) =>
  //           comment.prepareDestroyPermanently()
  //         );
  //         database.batch(deletedLocations);
  //       });
  //     } catch (error) {
  //       WriteLog("delet location tabale error :: " + error);
  //       console.log("delet location tabale error :: ", error);
  //     }
  //   }
  //   await setLastSync({ endpoint: "locations" });
  //   const batchActions = [];
  //   const chunkedUpdates = [];
  //   const remoteLocations = res.data.locations;
  //   remoteLocations.forEach((x, i) => {
  //     const chunkedIndex = Math.ceil(i / 50);
  //     if (!chunkedUpdates[chunkedIndex]) {
  //       chunkedUpdates[chunkedIndex] = [x];
  //       chunkedUpdates[chunkedIndex].push(x);
  //     } else {
  //       chunkedUpdates[chunkedIndex].push(x);
  //     }
  //   });
  //   setChunksToSync(chunkedUpdates.length);
  //   chunkedUpdates.forEach((x, i) => {
  //     BackgroundTimer.setTimeout(async () => {
  //       const batchActions = [];
  //       console.log({ i, x });
  //       const locationsUpdates = remoteLocations.map(async (location) => {
  //         // let locallocation;

  //         // try {
  //         //   await nextFrame();
  //         //   locallocation = await locations.find(location.id.toString());
  //         // } catch (error) {}

  //         // const existinglocation = locallocation && locallocation?._raw;

  //         // if (existinglocation?.id) {
  //         //   batchActions.push(
  //         //     locallocation.prepareUpdate((record) => {
  //         //       record.locationId = location.id;
  //         //       record.vendor_id = location.vendor_id;
  //         //       record.dynamic_descriptor = location.dynamic_descriptor;
  //         //       record.eventId = location.event_id;
  //         //       record.name = location.name;
  //         //       record.isActive = location.is_active;
  //         //       record.locationMenus = location.location_menus;
  //         //       record.paymentProcessorConfig =
  //         //         location?.payment_processor_config?.config;
  //         //       record.paymentProcessor =
  //         //         location?.payment_processor_config?.payment_processor;
  //         //       record.digital_surcharge_percentage =
  //         //         location.digital_surcharge_percentage;
  //         //     })
  //         //   );
  //         //   return true;
  //         // }

  //         batchActions.push(
  //           locations.prepareCreate((record) => {
  //             record._raw.id = location.id.toString();
  //             record.locationId = location.id;
  //             record.vendor_id = location.vendor_id;
  //             record.dynamic_descriptor = location.dynamic_descriptor;
  //             record.eventId = location.event_id;
  //             record.name = location.name;
  //             record.isActive = location.is_active;
  //             record.locationMenus = location.location_menus;
  //             record.paymentProcessorConfig =
  //               location?.payment_processor_config?.config;
  //             record.paymentProcessor =
  //               location?.payment_processor_config?.payment_processor;
  //             record.digital_surcharge_percentage =
  //               location.digital_surcharge_percentage;
  //           })
  //         );
  //         return true;
  //       });
  //       await Promise.all(locationsUpdates);
  //       try {
  //         await nextFrame();
  //         await database.write(async () => {
  //           try {
  //             await database.batch(batchActions);
  //           } catch (error) {
  //             WriteLog(" Sunc location error" + error);
  //             console.log({ error });
  //           }
  //         });
  //         onChunkSync(i);
  //       } catch (error) {
  //         WriteLog(" Sunc location error" + error);
  //         console.log({ error });
  //       }
  //     }, (i + 1) * 5000);
  //   });
  // } catch (e) {
  //   WriteLog(" Sunc location error" + e);
  //   console.log("sync locations error", e);
  //   return e;
  // }
// };