import BackgroundTimer from "react-native-background-timer";
import nextFrame from "next-frame";
// import { database } from "../../data/database";
import { getDiscountsQuery } from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";


// export const syncDiscounts = async ({
//   client,
//   organizationId,
//   withoutSync,
//   database,
//   setChunksToSync,
//   onChunkSync,
// }) => {
  // const discounts = database.collections.get("discounts");
  // let res;
  // try {
  //   res = await client.query({
  //     query: getDiscountsQuery,
  //     variables: {
  //       organizationId,
  //     },
  //   });

  //   if (res !== undefined && res !== null) {
  //     try {
  //       await database.write(async () => {
  //         let discountsResponse = await database.collections
  //           .get("discounts")
  //           .query()
  //           .fetch();
  //         const deletedDiscount = discountsResponse.map((comment) =>
  //           comment.prepareDestroyPermanently()
  //         );
  //         database.batch(deletedDiscount);
  //       });
  //     } catch (error) {
  //       WriteLog("SyncDiscount delet events tabale error" + error);
  //       console.log("delet events tabale error :: ", error);
  //     }
  //   }

  //   await setLastSync({ endpoint: "menus" });
  //   const chunkedUpdates = [];
  //   const remoteDiscounts = res.data.discount;

  //   remoteDiscounts.forEach((x, i) => {
  //     const chunkedIndex = Math.floor(i / 50);
  //     if (!chunkedUpdates[chunkedIndex]) {
  //       chunkedUpdates[chunkedIndex] = [];
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
  //       const discountsUpdate = remoteDiscounts.map(async (discount) => {
  //         let localDiscount;
  //         try {
  //           await nextFrame();
  //           localDiscount = await discounts.find(discount.id.toString());
  //         } catch (error) {}

  //         const existingDiscount = localDiscount && localDiscount?._raw;

  //         if (existingDiscount?.id) {
  //           batchActions.push(
  //             localDiscount.prepareUpdate((record) => {
  //               record.amount = discount.amount;
  //               record.code = discount.code;
  //               record.name = discount.name;
  //               record.description = discount.description;
  //               record.discountType = discount.discount_type;
  //               record.percentage = discount.percentage;
  //             })
  //           );
  //           return true;
  //         }
  //         batchActions.push(
  //           discounts.prepareCreate((record) => {
  //             record._raw.id = discount.id.toString();
  //             record.amount = discount.amount;
  //             record.code = discount.code;
  //             record.name = discount.name;
  //             record.description = discount.description;
  //             record.discountType = discount.discount_type;
  //             record.percentage = discount.percentage;
  //           })
  //         );
  //         return true;
  //       });
  //       await Promise.all(discountsUpdate);

  //       await database.write(async () => {
  //         database.batch(batchActions);
  //       });
  //       onChunkSync(x);
  //       WriteLog("SyncDiscount Discount updated");
  //       console.log("Discount updated");
  //     }, (i + 1) * 5000);
  //   });
  // } catch (e) {
  //   WriteLog("SyncDiscount Discounts error" + e);
  //   console.log("sync Discounts error", e);
  //   return e;
  // }
// };
