import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import discounts from "./discounts";
import events from "./events";
import locations from "./locations";
import menus from "./menus";
import orders from "./orders";
import rfid_assets from "./rfidAssets";
import schema from "./schema";
import syncs from "./syncs";
import users from "./users";
import attendees from "./attendees";
import menuItems from "./menuItems";
import { WriteLog } from "../src/CommonLogFile";

const adapter = new SQLiteAdapter({
  schema,
});

export const database = new Database({
  adapter,
  modelClasses: [
    orders,
    syncs,
    menus,
    locations,
    users,
    discounts,
    events,
    rfid_assets,
    attendees,
    menuItems,
  ],
});

export const resetDatabase = async () => {
  try {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  } catch (e) {
    console.log(e);
    WriteLog(e);
  }
};
