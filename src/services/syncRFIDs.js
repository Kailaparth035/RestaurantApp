/* eslint-disable no-else-return */
import nextFrame from "next-frame";
import BackgroundTimer from "react-native-background-timer";
// import { database } from "../../data/database";
import {
    GET_EVENT_RFIDS,
    GET_EVENT_RFIDS_AGG,
    GET_EVENT_RFIDS_LIMIT,
    GET_SINGLE_RFID_FOR_SYNC,
} from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";
import {Q} from "@nozbe/watermelondb";
import { WriteLog } from "../../src/CommonLogFile";

let chunksSyncing = false;
// eslint-disable-next-line default-param-last
export const syncInChunks = async (
  client,
  eventId,
  limit = 500,
  offset,
  count,
  database
) => {
  const lastSyncTime = BIG_BANG_TIME;
  const rfid_assets = database.collections.get("rfid_assets");
  let res;

  if (count >= limit * offset) {
    try {
      // if (withoutSync) {

      res = await client.query({
        query: GET_EVENT_RFIDS_LIMIT,
        variables: {
          eventId: Number(eventId),
          lastSyncTime,
          offset: offset * limit,
          limit,
        },
      });

      const batchActions = [];

      await Promise.all(
        res.data.rfid_assets.map(async (asset) => {
          batchActions.push(
            rfid_assets.prepareCreate((record) => {
              record._raw.id = asset.uid;
              record.rfid_id = asset.id;
              record.attendee_id = asset.attendee_id;
              record.uid = asset.uid;
              record.is_active = asset.is_active;
              record.last_four_phone_numbers = asset.last_four_phone_numbers;
              record.tokens_balance = asset.tokens_balance;
              record.cash_balance = asset.cash_balance;
              record.promo_balance = asset.promo_balance;
              record.event_id = Number(eventId);
            })
          );
        })
      );

      await database.write(async () => {
        database.batch(batchActions);
      });

      return true;
    } catch (e) {
      WriteLog(" SyncMenu error :: " + e);
      console.log("SyncMenu  error", e);
      return e;
    }
  } else {
    return [];
  }
};

export const syncRFIDs = async (client, eventId, withoutSync, database) => {
  let lastSyncTime = BIG_BANG_TIME;

  let res;
  if (withoutSync) {
    chunksSyncing = true;
    const {
      data: {
        rfid_assets_aggregate: {
          aggregate: { count },
        },
      },
    } = await client.query({
      query: GET_EVENT_RFIDS_AGG,
      variables: {
        eventId: Number(eventId),
      },
    });

    const totalCountArr = Array.from(Array(Math.ceil(count / 500)).keys());
    if (totalCountArr.length === 0) {
      totalCountArr.push(0);
    }

    // const syncedChunks = totalCountArr.map((offset, index) =>
    //   syncInChunks(client, eventId, 500, index, count, database)
    // );

    const chunked = await Promise.all(syncedChunks);
    await setLastSync({ endpoint: "rfid_assets" });
    return true;
  } else {
    const lastSync = await getLastSync({ endpoint: "rfid_assets" });
    if (lastSync) {
      lastSyncTime = lastSync;
    }
    try {
      res = await client.query({
        query: GET_EVENT_RFIDS,
        variables: {
          eventId: Number(eventId),
          lastSyncTime,
        },
      });
      await setLastSync({ endpoint: "rfid_assets" });
      const rfid_assets = database.collections.get("rfid_assets");

      const chunkedUpdates = [];

      const remote_rfid_assets = res.data.rfid_assets;
      remote_rfid_assets.forEach((x, i) => {
        const chunkedIndex = Math.floor(i / 50);
        if (!chunkedUpdates[chunkedIndex]) {
          chunkedUpdates[chunkedIndex] = [];
          chunkedUpdates[chunkedIndex].push(x);
        } else {
          chunkedUpdates[chunkedIndex].push(x);
        }
      });

      chunkedUpdates.forEach((x, i) => {
        BackgroundTimer.setTimeout(async () => {
          const batchActions = [];

          const updatedRFIDS = await x.map(async (asset) => {
            let localrfid_asset = "";
            try {
              await nextFrame();
              localrfid_asset = await rfid_assets.find(asset.uid);
            } catch (error) {
              WriteLog(" SyncMenu error :: " + error);
              console.log("rfid sync error", error);
            }
            if (localrfid_asset) {
              batchActions.push(
                localrfid_asset.prepareUpdate((record) => {
                  record.rfid_id = asset.id;
                  record.attendee_id = asset.attendee_id;
                  record.uid = asset.uid;
                  record.is_active = asset.is_active;
                  record.last_four_phone_numbers =
                    asset.last_four_phone_numbers;
                  record.tokens_balance = asset.tokens_balance;
                  record.cash_balance = asset.cash_balance;
                  record.promo_balance = asset.promo_balance;
                  record.event_id = Number(eventId);
                })
              );
              return true;
            }
            batchActions.push(
              rfid_assets.prepareCreate((record) => {
                record._raw.id = asset.uid;
                record.rfid_id = asset.id;
                record.attendee_id = asset.attendee_id;
                record.uid = asset.uid;
                record.is_active = asset.is_active;
                record.last_four_phone_numbers = asset.last_four_phone_numbers;
                record.tokens_balance = asset.tokens_balance;
                record.cash_balance = asset.cash_balance;
                record.promo_balance = asset.promo_balance;
                record.event_id = Number(eventId);
              })
            );
            return true;
          });

          await Promise.all(updatedRFIDS);

          await nextFrame();
          await database.write(async () => {
            try {
              // await nextFrame()
              database.batch(batchActions);
            } catch (error) {
              WriteLog(" SyncMenu error :: " + error);
              console.log({ error });
            }
          });
        }, (i + 1) * 10000);
      });
    } catch (error) {
      WriteLog(" SyncMenu error :: " + error);
      console.log({ error });
      chunksSyncing = false;
    }
  }
};

export const syncSingleRfid = async (client, eventId, uid, database) => {
    try {

        const res = await client.query({
            query: GET_SINGLE_RFID_FOR_SYNC,
            variables: {
                eventId: Number(eventId),
                uid,
            },
        });

        const rfid_assets = database.collections.get("rfid_assets");
        const asset = res.data.rfid_assets[0];
        if(!asset) throw new Error('No RFID asset found with provided UID');

        let localrfid_asset = null;

        try {
            const results = await rfid_assets.query(Q.where('uid', uid)).fetch();

            if (results.length > 0) {
                localrfid_asset = results[0];
                console.log("Found rfid_asset", { localrfid_asset });
            } else {
                console.log("No asset found for uid:", uid);
            }
        } catch (error) {
            console.log("Error finding local rfid asset", error);
        }
        await database.write(async () => {
            if (localrfid_asset) {
                await localrfid_asset.update(record => {
                    record.rfid_id = asset.id;
                    record.attendee_id = asset.attendee_id;
                    record.is_active = asset.is_active;
                    record.last_four_phone_numbers = asset.last_four_phone_numbers;
                    record.tokens_balance = asset.tokens_balance;
                    record.cash_balance = asset.cash_balance;
                    record.promo_balance = asset.promo_balance;
                });
            } else {
                await rfid_assets.create(record => {
                    record.uid = asset.uid;
                    record.rfid_id = asset.id;
                    record.attendee_id = asset.attendee_id;
                    record.is_active = asset.is_active;
                    record.last_four_phone_numbers = asset.last_four_phone_numbers;
                    record.tokens_balance = asset.tokens_balance;
                    record.cash_balance = asset.cash_balance;
                    record.promo_balance = asset.promo_balance;
                    record.event_id = Number(eventId);
                });
            }
        });
        console.log(`Synced single RFID asset with UID: ${uid}`);
    } catch (e) {
        console.error("Error syncing single rfid asset", e);
    }
};
