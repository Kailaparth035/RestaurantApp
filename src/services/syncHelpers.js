import { REACT_APP_SYNC_DEBUG_FLAG } from "@env";
import { Q } from "@nozbe/watermelondb";
import { database } from "../../data/database";
import { WriteLog } from "../../src/CommonLogFile";

const syncs = database.collections.get("syncs");

const DEBUG_SYNC = REACT_APP_SYNC_DEBUG_FLAG || false;
export const BIG_BANG_TIME = "2000-01-01T00:00:00+00:00";

export const getLastSync = async ({ endpoint }) => {
  try {
    let lastSyncTime = BIG_BANG_TIME;
    const records = await syncs.query(Q.where("endpoint", endpoint)).fetch();
    if (records[0]) {
      if (records[0].updated_at) {
        lastSyncTime = records[0].updated_at;
      } else {
        lastSyncTime = records[0].updatedAt;
        if (lastSyncTime !== BIG_BANG_TIME) {
          // lastSyncTime.setDate(lastSyncTime.getDate() - 0.2);
          lastSyncTime = lastSyncTime.toISOString();
        }
      }
    }
    if (DEBUG_SYNC) {
      WriteLog("the end point:" + endpoint + "and last sync:" + lastSyncTime);
      console.log(`the end point: ${endpoint} and last sync: ${lastSyncTime}`);
    }

    return lastSyncTime;
  } catch (e) {
    WriteLog("e" + e);
    console.log(e);
  }
};

export const setLastSync = async ({ endpoint, updated_at }) => {
  try {
    const records = await syncs.query(Q.where("endpoint", endpoint)).fetch();
    if (records[0]) {
      await database.write(async () =>
        records[0].update((entry) => {
          const result = entry;

          result.endpoint = endpoint;
          result.updated_at = updated_at;
          return result;
        })
      );
    } else {
      await database.write(async () => {
        await syncs.create((entry) => {
          const result = entry;

          result.endpoint = endpoint;
          result.updated_at = updated_at;
          return result;
        });
      });
    }
  } catch (e) {
    WriteLog("e" + e);
    console.log({ e });
    return e;
  }
};
