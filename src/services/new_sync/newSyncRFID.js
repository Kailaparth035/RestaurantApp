/* eslint-disable no-else-return */
import {
  GET_EVENT_RFIDS,
  GET_EVENT_RFIDS_AGG,
  GET_EVENT_RFIDS_LIMIT,
  GET_EVENT_RFIDS_MAX_UPDATED_AT,
  GET_SINGLE_RFID_FOR_SYNC,
  UPDATE_TOKEN_BALANCE,
} from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";
import { BIG_BANG_TIME, getLastSync, setLastSync } from "../syncHelpers";
import { Q } from "@nozbe/watermelondb";

const CHUNK_SIZE = 500;

export const NewSyncRFID = async (client, eventId, database) => {
  const lastSyncTime = BIG_BANG_TIME;
  const rfid_assets = database.collections.get("rfid_assets");
  try {
    const totalRFIDAssetsCountResponse = await client.query({
      query: GET_EVENT_RFIDS_AGG,
      variables: {
        eventId
      },
    });
    const rfidsMaxUpdatedDateResponse = await client.query({
      query: GET_EVENT_RFIDS_MAX_UPDATED_AT,
      variables: {
        eventId
      },
    });
    const totalRFIDAssetsCount = totalRFIDAssetsCountResponse.data.rfid_assets_aggregate.aggregate.count;
    const rfidsMaxUpdatedDate = rfidsMaxUpdatedDateResponse.data.rfid_assets_aggregate.aggregate.max.updated_at;
    await setLastSync({
      endpoint: "rfid_assets",
      updated_at: rfidsMaxUpdatedDate
    })
    if (totalRFIDAssetsCount !== undefined) {
      await database.write(async () => {
        let localRFIDAssets = await database.collections.get("rfid_assets").query().fetch();
        const deleteAllLocalRFIDAssets = localRFIDAssets.map((rfidAsset) =>
          rfidAsset.prepareDestroyPermanently()
        );
        database.batch(deleteAllLocalRFIDAssets);
      });
    }
    let offset = 0;
    console.log({ totalRFIDAssetsCount })
    while (offset < totalRFIDAssetsCount) {
      const { data: { rfid_assets: assetsChunk } } = await client.query({
        query: GET_EVENT_RFIDS_LIMIT,
        variables: {
          eventId,
          lastSyncTime,
          offset,
          limit: CHUNK_SIZE
        },
      });

      if (assetsChunk.length === 0) {
        break;
      }
      await database.write(async () => {
        await Promise.all(assetsChunk.map(async (asset) => {
            await rfid_assets.create((record) => {
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
              record.is_sync = true;
            });
          }));
      });
      console.log("RFID Assets Synced: ", offset + CHUNK_SIZE);
      offset += CHUNK_SIZE;
    }
    console.log("@@===RFID_SYNC Done ===");
    await setCachedItem(KEY_NAME.RFID_SYNC, 'true');
  } catch (error) {
    console.log("sync rfid_assets error", error);
    return error;
  }
};

export const NewSyncRFIDRecursive = async (client, eventId, database) => {
  try {
    const lastSyncTime = await getLastSync({ endpoint: "rfid_assets" });
    const res = await client.query({
      query: GET_EVENT_RFIDS,
      variables: {
        eventId: Number(eventId),
        lastSyncTime,
      },
    });
    if (res?.data?.rfid_assets?.length > 0) {
      await setLastSync({
        endpoint: "rfid_assets",
        updated_at: res.data.rfid_assets[0].updated_at,
      });

      await database.write(async () => {
        const rfidsCollection = database.collections.get("rfid_assets");
        const remoteRfids = res.data.rfid_assets;
        for (const rfid of remoteRfids) {
          let existingRfids;
          try {
            existingRfids = await rfidsCollection.find(rfid.uid);
          } catch (findError) {
            existingRfids = null;
          }
          if (existingRfids) {
            await existingRfids.update((record) => {
              record.rfid_id = rfid.id;
              record.attendee_id = rfid.attendee_id;
              record.is_active = rfid.is_active;
              record.last_four_phone_numbers = rfid.last_four_phone_numbers;
              record.tokens_balance = rfid.tokens_balance;
              record.cash_balance = rfid.cash_balance;
              record.promo_balance = rfid.promo_balance;
            });
          } else {
            await rfidsCollection.create((record) => {
              record.rfid_id = rfid.id;
              record.attendee_id = rfid.attendee_id;
              record.uid = rfid.uid;
              record.is_active = rfid.is_active;
              record.last_four_phone_numbers = rfid.last_four_phone_numbers;
              record.tokens_balance = rfid.tokens_balance;
              record.cash_balance = rfid.cash_balance;
              record.promo_balance = rfid.promo_balance;
              record.event_id = Number(eventId);
              record.is_sync = true;
            });
          }
        }
      });
    }
    console.log("@@===RFIDS_RECURSIVE_SYNC Done ===");
  } catch (error) {
    console.log("NewSyncRFIDsRecursive error", error);
    return error;
  }
};
export const NewSyncSingleRfid = async (client, eventId, uid, database) => {
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
    if (!asset) throw new Error('No RFID asset found with provided UID');

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
          record.is_sync = true;
        });
      }
    });
    console.log(`Synced single RFID asset with UID: ${uid}`);
  } catch (e) {
    console.error("Error syncing single rfid asset", e);
  }
};

export const NewSyncRfidRecord = async (client, database) => {
  console.log("@@===NewSyncRfidRecord===");
  try {
    const rfidRecordToSync = await database
      .get("rfid_assets")
      .query(Q.where("is_sync", false));

    console.log("rfidRecordToSync:::", rfidRecordToSync);
    if (rfidRecordToSync.length === 0) {
    } else {
      const syncingRfidRecord = rfidRecordToSync.map(async (order) => {
        await client.mutate({
          mutation: UPDATE_TOKEN_BALANCE,
          variables: {
            event_id: order?._raw?.event_id,
            uid: order?._raw?.uid,
            input: { tokens_balance: JSON.parse(order?._raw?.tokens_balance) },
          },
        });
        console.log("Update tokens_balance===")
        try {
          let record = await database.collections
            .get("rfid_assets")
            .query(Q.where("uid", order?._raw?.uid))
            .fetch();
          await database.action(async () => {
            await record[0].update((record) => {
              record.is_sync = true;
            });
          });
          console.log("success===")
        } catch (error) {
          console.log("error rfid_assets:::", error);
        }
      });
      await Promise.all(rfidRecordToSync);
    }
  } catch (error) {
    WriteLog("SyncOrder error" + error);
    console.log(
      "sync orders23",
      JSON.stringify({
        message: error.message,
        stack: error.stack,
      })
    );
  }
};
