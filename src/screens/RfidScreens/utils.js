import {Q} from "@nozbe/watermelondb";

export const getRfidLocal = async (db, uid) => {
  try {
    const rfid_assets = db.collections.get("rfid_assets");
    const results = await rfid_assets.query(Q.where('uid', uid)).fetch();

    if (results.length > 0) {
      const foundAsset = results[0];

      return foundAsset;
    } else {
      console.log("No asset found for uid:", uid);
      return {};
    }

  } catch (error) {
    console.error("Error fetching asset for uid:", uid, error);
    return {};
  }
};
