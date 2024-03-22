/* eslint-disable no-else-return */
import nextFrame from "next-frame";
import BackgroundTimer from "react-native-background-timer";
import { Q } from "@nozbe/watermelondb";
import {
  GET_EVENT_ATTENDEES,
  GET_EVENT_ATTENDEES_AGG,
  GET_EVENT_ATTENDEES_LIMIT,
  SEND_RFID_ASSOCIATION_LINK,
} from "../fragments/resolvers";
import { getLastSync, setLastSync, BIG_BANG_TIME } from "./syncHelpers";
// eslint-disable-next-line import/no-cycle
import { updateRFIDAsset } from "../screens/RfidScreens/RFIDPrompts";
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
  const attendees = database.collections.get("attendees");
  let res;
  if (count >= limit * offset) {
    try {
      // if (withoutSync) {

      res = await client.query({
        query: GET_EVENT_ATTENDEES_LIMIT,
        variables: {
          eventId: Number(eventId),
          lastSyncTime,
          offset: offset * limit,
          limit,
        },
      });
      const batchActions = [];

      if (offset == 0 && res?.data?.attendees?.length > 0) {
        await setLastSync({
          endpoint: "attendees",
          updated_at: res?.data?.attendees[0].updated_at,
        });
      }
      await Promise.all(
        res.data.attendees.map(async (attendee) => {
          batchActions.push(
            attendees.prepareCreate((record) => {
              record._raw.id = attendee.id.toString();
              record.is_active = attendee.is_active;
              record.phone_number = attendee.phone_number;
              record.promo_balance = attendee.promo_balance;
              record.promo_balance_rfid_applied =
                attendee.promo_balance_rfid_applied;
              record.card_on_files = attendee.card_on_files;
              record.personnal_pin = attendee.personnal_pin;
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
      WriteLog("sync attendees error" + e);
      console.log("sync attendees error", e);
      return e;
    }
  } else {
    return [];
  }
};

export const syncAttendees = async ({
  client,
  eventId,
  withoutSync,
  database,
  showLoading,
  setChunksToSync,
  onChunkSync,
}) => {
  let lastSyncTime = BIG_BANG_TIME;

  let res;
  if (withoutSync) {
    chunksSyncing = true;
    const {
      data: {
        attendees_aggregate: {
          aggregate: { count },
        },
      },
    } = await client.query({
      query: GET_EVENT_ATTENDEES_AGG,
      variables: {
        eventId: Number(eventId),
      },
    });
    setChunksToSync(0);

    const totalCountArr = Array.from(Array(Math.ceil(count / 500)).keys());
    if (totalCountArr.length === 0) {
      totalCountArr.push(0);
    }
    // const syncedChunks = totalCountArr.map((offset, index) =>
    //   syncInChunks(client, eventId, 500, index, count, database)
    // );

    const chunked = await Promise.all(syncedChunks);
    onChunkSync(0);
    return true;
  } else {
    const lastSync = await getLastSync({ endpoint: "attendees" });
    if (lastSync) {
      lastSyncTime = lastSync;
    }

    try {
      res = await client.query({
        query: GET_EVENT_ATTENDEES,
        variables: {
          eventId: Number(eventId),
          lastSyncTime,
        },
      });
      if (res?.data?.attendees?.length > 0) {
        await setLastSync({
          endpoint: "attendees",
          updated_at: res?.data?.attendees[0].updated_at,
        });
      }

      const attendees = database.collections.get("attendees");
      const remote_attendees = res.data.attendees;
      const chunkedUpdates = [];

      remote_attendees.forEach((x, i) => {
        const chunkedIndex = Math.floor(i / 50);
        if (!chunkedUpdates[chunkedIndex]) {
          chunkedUpdates[chunkedIndex] = [];
          chunkedUpdates[chunkedIndex].push(x);
        } else {
          chunkedUpdates[chunkedIndex].push(x);
        }
      });
      setChunksToSync(chunkedUpdates.length);
      chunkedUpdates.forEach((x, i) => {
        BackgroundTimer.setTimeout(async () => {
          const batchActions = [];

          const updatedRFIDS = await x.map(async (attendee) => {
            let localrfid_attendee = "";
            try {
              await nextFrame();
              localrfid_attendee = await attendees.find(attendee.id.toString());
            } catch (error) {}
            if (localrfid_attendee) {
              batchActions.push(
                localrfid_attendee.prepareUpdate((record) => {
                  record._raw.id = attendee.id.toString();
                  record.is_active = attendee.is_active;
                  record.phone_number = attendee.phone_number;
                  record.promo_balance = attendee.promo_balance;
                  record.promo_balance_rfid_applied =
                    attendee.promo_balance_rfid_applied;
                  record.card_on_files = attendee.card_on_files;
                  record.personnal_pin = attendee.personnal_pin;
                  record.event_id = Number(eventId);
                })
              );
              return true;
            }
            batchActions.push(
              attendees.prepareCreate((record) => {
                record._raw.id = attendee.id.toString();
                record.is_active = attendee.is_active;
                record.phone_number = attendee.phone_number;
                record.promo_balance = attendee.promo_balance;
                record.promo_balance_rfid_applied =
                  attendee.promo_balance_rfid_applied;
                record.card_on_files = attendee.card_on_files;
                record.personnal_pin = attendee.personnal_pin;
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
              WriteLog("sync attendees error" + error);
              console.log({ error });
            }
          });
          onChunkSync(x);
        }, (i + 1) * 10000);
      });
      if (showLoading !== undefined) {
        setTimeout(() => {
          showLoading(false);
        }, 5000);
      }
    } catch (error) {
      WriteLog("sync attendees error" + error);
      console.log({ error });
      chunksSyncing = false;
      if (showLoading !== undefined) {
        setTimeout(() => {
          showLoading(false);
        }, 5000);
      }
    }
  }
};

export const syncPendingAttendeeRfidAssociations = async (client, database) => {
  try {
    const associationsToSync = await database
      .get("attendees")
      .query(Q.where("status", Q.oneOf(["pending", "failed-association"])));
    // console.log({ associationsToSync });
    const attendeesTest = await database.get("attendees").query().fetch();
    // console.log({ attendeesTest });
    if (associationsToSync.length === 0) {
      // console.log("NO ASSOCIATIONS TO SYNC");
    } else {
      const syncingAssociations = associationsToSync.map(
        async (association) => {
          try {
            const {
              phone_number: phoneNumber,
              event_id: eventId,
              unsynced_rfid_uid: uid,
              personnal_pin,
            } = association;
            const {
              data: {
                associate_rfid: { message },
              },
            } = await client.mutate({
              mutation: SEND_RFID_ASSOCIATION_LINK,
              variables: {
                AssociationInput: {
                  phoneNumber,
                  eventId,
                  uid,
                  personnal_pin,
                },
              },
            });
            WriteLog("sync attendees message" + message);
            console.log("sync attendees", message);
            if (message?.rfid_asset?.id) {
              await updateRFIDAsset({ ...message.rfid_asset, uid }, database);
            }
            await database.write(async () => {
              await association.update((record) => {
                record.is_pushed = true;
                record.status = "associated";
                record.unsynced_rfid_uid = "";
              });
            });
          } catch (error) {
            WriteLog("sync attendees error" + error);
            console.log({ error });
            await database.write(async () => {
              await association.update((record) => {
                record.is_pushed = false;
                record.status = "failed-association";
              });
            });
          }
        }
      );
      await Promise.all(syncingAssociations);
    }
  } catch (error) {
    WriteLog("sync attendees sync orders" + error);
    console.log("sync orders", JSON.stringify({ error }));
  }
};
