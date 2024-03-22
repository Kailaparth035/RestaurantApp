import BackgroundTimer from "react-native-background-timer";
import nextFrame from "next-frame";
// import { database } from "../../data/database";
import { getMenuItems } from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";
import { WriteLog } from "../../src/CommonLogFile";

// export const syncMenuItems = async ({ client, eventId, database }) => {
  // let lastSyncTime = BIG_BANG_TIME;
  // if (!withoutSync) {
  //   const lastSync = await getLastSync({ endpoint: "items" });
  //   if (lastSync) {
  //     lastSyncTime = lastSync;
  //   }
  // }
  // WriteLog(" syncMenuItems eventId" + eventId);
  // console.log("syncMenuItems eventId :::", eventId);
  // const menuItems = database.collections.get("menuItems");

  // let res;
  // try {
  //   res = await client.query({
  //     query: getMenuItems,
  //     variables: {
  //       eventId,
  //     },
  //   });
  //   WriteLog(" syncMenuItems res.data.items" + res.data.items);
  //   console.log("res.data.items ::::", JSON.stringify(res.data.items));

  //   if (res.data.items.length > 0) {
  //     try {
  //       await database.write(async () => {
  //         let menuItemsResponse = await database.collections
  //           .get("menuItems")
  //           .query()
  //           .fetch();

  //         const deletedMenuItems = menuItemsResponse.map((comment) =>
  //           comment.prepareDestroyPermanently()
  //         );
  //         database.batch(deletedMenuItems);
  //       });
  //     } catch (error) {
  //       WriteLog(" syncMenuItems delet menuItems tabale error ::" + error);
  //       console.log("delet menuItems tabale error ::", error);
  //     }
  //   }

  //   await setLastSync({ endpoint: "items" });
  //   const batchActions = [];
  //   const menuItemUpdates = res.data.items.map(async (item) => {
  //     // let localmenuItem;
  //     // try {
  //     //   localmenuItem = await menuItems.find(item.id.toString());
  //     // } catch (error) {}

  //     // const existingMenuItem = localmenuItem && localmenuItem?._raw;

  //     // if (existingMenuItem?.id) {
  //     //   batchActions.push(
  //     //     localmenuItem.prepareUpdate((record) => {
  //     //       record.menu_item_id = item.id;
  //     //       record.name = item.name;
  //     //       record.is_active = item.is_active;
  //     //       record.created_at = item.created_at;
  //     //       record.updated_at = item.updated_at;
  //     //       record.price = item.price;
  //     //       record.image = item.image;
  //     //       record.short_name = item?.short_name;
  //     //       record.unique_id = item.unique_id;
  //     //       record.description = item.description;
  //     //       record.redeemable_token_id = item.redeemable_token_id;
  //     //       record.redeemable_token_name = item.redeemable_token_name;
  //     //       record.token_price = item.token_price;
  //     //       record.tax_percentage = item.tax_percentage;
  //     //       record.tax = item.tax;
  //     //     })
  //     //   );
  //     //   return true;
  //     // } else {
  //     batchActions.push(
  //       menuItems.prepareCreate((record) => {
  //         record._raw.id = item.id.toString();
  //         record.menu_item_id = item.id;
  //         record.name = item.name;
  //         record.is_active = item.is_active;
  //         record.created_at = item.created_at;
  //         record.updated_at = item.updated_at;
  //         record.price = item.price;
  //         record.image = item.image;
  //         record.short_name = item?.short_name;
  //         record.unique_id = item.unique_id;
  //         record.description = item.description;
  //         record.redeemable_token_id = item.redeemable_token_id;
  //         record.redeemable_token_name = item.redeemable_token_name;
  //         record.token_price = item.token_price;
  //         record.tax_percentage = item.tax_percentage;
  //         record.tax = item.tax;
  //         record.upc = item.upc;
  //         record.is_favorite = item.is_favorite || false;
  //         record.modifiers = item.modifiers;
  //         record.modifier_type = item.modifier_type;
  //       })
  //     );
  //     return true;
  //     // }
  //   });
  //   await Promise.all(menuItemUpdates);

  //   try {
  //     await database.write(async () => {
  //       try {
  //         await database.batch(batchActions);
  //       } catch (error) {
  //         WriteLog(" syncMenuItems error ::" + error);
  //         console.log("syncmenuItem error:::", { error });
  //       }
  //     });
  //   } catch (error) {
  //     WriteLog(" syncMenuItems error ::" + error);
  //     console.log("Insert menusItems error", error);
  //   }
  // } catch (e) {
  //   WriteLog(" syncMenuItems error ::" + e);
  //   console.log("sync menusItems error", e);
  //   return e;
  // }
// };
