import BackgroundTimer from "react-native-background-timer";
import nextFrame from "next-frame";
import { getMenusQuery } from "../fragments/resolvers";
import { setLastSync } from "./syncHelpers";
import { WriteLog } from "../../src/CommonLogFile";

// export const syncMenus = async ({
//   client,
//   eventId,
//   database,
//   showLoading,
//   updateSelectedMenu,
//   setMenuChunksToSync,
//   onMenuChunkSync,
// }) => {
  // // let lastSyncTime = BIG_BANG_TIME;
  // // if (!withoutSync) {
  // //   const lastSync = await getLastSync({ endpoint: "menus" });
  // //   if (lastSync) {
  // //     lastSyncTime = lastSync;
  // //   }
  // // }
  // WriteLog(" SyncMenu eventId ::" + eventId);
  // console.log("eventId :::", eventId);
  // const menus = database.collections.get("menus");

  // let res;

  // try {
  //   res = await client.query({
  //     query: getMenusQuery,
  //     variables: {
  //       eventId,
  //     },
  //   });

  //   if (res.data.menus.length > 0) {
  //     try {
  //       await database.write(async () => {
  //         let menuResponse = await database.collections
  //           .get("menus")
  //           .query()
  //           .fetch();
  //         const deletedMenus = menuResponse.map((comment) =>
  //           comment.prepareDestroyPermanently()
  //         );
  //         database.batch(deletedMenus);
  //       });
  //     } catch (error) {
  //       WriteLog(" SyncMenu delet location tabale error :: " + error);
  //       console.log("delet location tabale error :: ", error);
  //     }
  //   }

  //   await setLastSync({ endpoint: "menus" });

  //   const chunkedUpdates = [];
  //   const remote_menus = res.data.menus;

  //   remote_menus.forEach((x, i) => {
  //     const chunkedIndex = Math.ceil(i / 50);

  //     if (!chunkedUpdates[chunkedIndex]) {
  //       chunkedUpdates[chunkedIndex] = [];
  //       chunkedUpdates[chunkedIndex].push(x);
  //     } else {
  //       chunkedUpdates[chunkedIndex].push(x);
  //     }
  //   });
  //   setMenuChunksToSync(chunkedUpdates.length);
  //   chunkedUpdates.forEach((x, i) => {
  //     BackgroundTimer.setTimeout(async () => {
  //       const batchActions = [];

  //       const menuUpdates = x.map(async (menu) => {
  //         let localMenu;
  //         try {
  //           await nextFrame();
  //           localMenu = await menus.find(menu.id.toString());
  //         } catch (error) {
  //           WriteLog(" SyncMenu error :: " + error);
  //           console.log({ error });
  //         }

  //         const existingMenu = localMenu && localMenu?._raw;

  //         if (existingMenu?.id) {
  //           batchActions.push(
  //             localMenu.prepareUpdate((record) => {
  //               record.menuId = menu.id;
  //               record.updated_at = menu.updated_at;
  //               record.eventId = menu.event_id;
  //               record.name = menu.name;
  //               record.isActive = menu.is_active;
  //               record.items = menu.menu_items;
  //               record.locationMenus = menu.location_menus;
  //               record.location_id =
  //                 menu?.locations_menus &&
  //                 menu?.locations_menus[0]?.location_id;
  //               record.tax_type = menu.tax_type;
  //               record.is_cash = menu.is_cash;
  //               record.is_credit = menu.is_credit;
  //               record.is_rfid = menu.is_rfid;
  //               record.is_qr = menu.is_qr;
  //               record.is_tips = menu.is_tips;
  //               record.tip_percentage_1 = menu.tip_percentage_1;
  //               record.tip_percentage_2 = menu.tip_percentage_2;
  //               record.tip_percentage_3 = menu.tip_percentage_3;
  //               record.is_custom_item = menu.is_custom_item;
  //               record.category = menu.category;
  //               record.is_discount = menu.is_discount;
  //               record.is_discount_protected = menu.is_discount_protected;
  //               record.is_cash_not_taxed = menu.is_cash_not_taxed;
  //             })
  //           );

  //           return true;
  //         }
  //         batchActions.push(
  //           menus.prepareCreate((record) => {
  //             record._raw.id = menu.id.toString();
  //             record.menuId = menu.id;
  //             record.eventId = menu.event_id;
  //             record.name = menu.name;
  //             record.isActive = menu.is_active;
  //             record.items = menu.menu_items;
  //             record.locationMenus = menu?.location_menus;
  //             record.location_id =
  //               menu?.locations_menus && menu?.locations_menus[0]?.location_id;
  //             record.tax_type = menu.tax_type;
  //             record.is_cash = menu.is_cash;
  //             record.is_credit = menu.is_credit;
  //             record.is_rfid = menu.is_rfid;
  //             record.is_qr = menu.is_qr;
  //             record.is_tips = menu.is_tips;
  //             record.tip_percentage_1 = menu.tip_percentage_1;
  //             record.tip_percentage_2 = menu.tip_percentage_2;
  //             record.tip_percentage_3 = menu.tip_percentage_3;
  //             record.is_custom_item = menu.is_custom_item;
  //             record.category = menu.category;
  //             record.is_discount = menu.is_discount;
  //             record.is_discount_protected = menu.is_discount_protected;
  //             record.is_cash_not_taxed = menu.is_cash_not_taxed;
  //           })
  //         );

  //         return true;
  //       });

  //       await Promise.all(menuUpdates);
  //       await nextFrame();
  //       await database.write(async () => {
  //         try {
  //           // await nextFrame()
  //           database.batch(batchActions);
  //         } catch (error) {
  //           WriteLog(" SyncMenu error :: " + error);
  //           console.log({ error });
  //         }
  //       });
  //       onMenuChunkSync(x);
  //     }, (i + 1) * 5000);
  //   });

  //   // const menuUpdates = res.data.menus.map(async (menu) => {
  //   //   let localMenu;
  //   //   try
  //   //     await nextFrame()
  //   //     localMenu = await menus.find(menu.id.toString());
  //   //   } catch (error) {
  //   //     console.log({ error });
  //   //   }

  //   //   const existingMenu = localMenu && localMenu?._raw;

  //   //   if (existingMenu?.id) {
  //   //     batchActions.push(
  //   //       localMenu.prepareUpdate((record) => {
  //   //         record.menuId = menu.id;
  //   //         record.eventId = menu.event_id;
  //   //         record.name = menu.name;
  //   //         record.isActive = menu.is_active;
  //   //         record.items = menu.menu_items;
  //   //         record.locationMenus = menu.location_menus;
  //   //         record.location_id =
  //   //           menu?.locations_menus && menu?.locations_menus[0]?.location_id;
  //   //       })
  //   //     );
  //   //     return true;
  //   //   }
  //   //   batchActions.push(
  //   //     menus.prepareCreate((record) => {
  //   //       record._raw.id = menu.id.toString();
  //   //       record.menuId = menu.id;
  //   //       record.eventId = menu.event_id;
  //   //       record.name = menu.name;
  //   //       record.isActive = menu.is_active;
  //   //       record.items = menu.menu_items;
  //   //       record.locationMenus = menu?.location_menus;
  //   //       record.location_id =
  //   //         menu?.locations_menus && menu?.locations_menus[0]?.location_id;
  //   //     })
  //   //   );
  //   //   return true;
  //   // })
  //   // await nextFrame()
  //   // await Promise.all(menuUpdates);
  //   // await nextFrame()
  //   // await database.write(async () => {
  //   //   database.batch(batchActions);
  //   // });
  //   if (updateSelectedMenu !== undefined) {
  //     updateSelectedMenu(res.data.menus);
  //   }

  //   if (showLoading !== undefined) {
  //     setTimeout(() => {
  //       showLoading(false);
  //     }, 5000);
  //   }
  // } catch (e) {
  //   if (showLoading !== undefined) {
  //     setTimeout(() => {
  //       showLoading(false);
  //     }, 5000);
  //   }
  //   WriteLog(" SyncMenu error :: " + e);
  //   console.log("sync menus error", e);
  //   return e;
  // }
// };
