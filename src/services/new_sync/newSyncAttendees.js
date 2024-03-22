/* eslint-disable no-else-return */
import {
    GET_EVENT_ATTENDEES,
    GET_EVENT_ATTENDEES_AGG,
    GET_EVENT_ATTENDEES_LIMIT, GET_EVENT_ATTENDEES_MAX_UPDATED_AT,
    SEND_RFID_ASSOCIATION_LINK
} from "../../fragments/resolvers";
import {setCachedItem} from "../../helpers/storeData";
import {KEY_NAME} from "../../helpers/constants";
import {BIG_BANG_TIME, getLastSync, setLastSync} from "../syncHelpers";
import {Q} from "@nozbe/watermelondb";
import {WriteLog} from "../../CommonLogFile";
import {updateRFIDAsset} from "../../screens";

const CHUNK_SIZE = 500;
export const NewSyncAttendees = async (client, eventId, database) => {
    const lastSyncTime = BIG_BANG_TIME;
    const attendeesCollection = database.collections.get("attendees");
    try {
        const totalAttendeesCountResponse = await client.query({
            query: GET_EVENT_ATTENDEES_AGG,
            variables: {
                eventId
            },
        });
        const attendeesMaxUpdatedDateResponse = await client.query({
            query: GET_EVENT_ATTENDEES_MAX_UPDATED_AT,
            variables: {
                eventId
            },
        });
        const totalAttendeesCount = totalAttendeesCountResponse.data.attendees_aggregate.aggregate.count;
        const attendeesMaxUpdatedDate = attendeesMaxUpdatedDateResponse.data.attendees_aggregate.aggregate.max.updated_at;
        await setLastSync({
            endpoint: "attendees",
            updated_at: attendeesMaxUpdatedDate
        })
        if (totalAttendeesCount !== undefined) {
            await database.write(async () => {
                let localAttendees = await database.collections.get("attendees").query().fetch();
                const deleteAllLocalAttendees = localAttendees.map((attendee) =>
                    attendee.prepareDestroyPermanently()
                );
                database.batch(deleteAllLocalAttendees);
            });
        }
        let offset = 0;
        while (offset < totalAttendeesCount) {
            const {data: {attendees}} = await client.query({
                query: GET_EVENT_ATTENDEES_LIMIT,
                variables: {
                    eventId,
                    lastSyncTime,
                    offset,
                    limit: CHUNK_SIZE
                },
            });
            if (attendees.length === 0) {
                break;
            }
            await database.write(async () => {
                await Promise.all(attendees.map(async attendee => {
                    await attendeesCollection.create((record) => {
                        record._raw.id = attendee.id.toString();
                        record.is_active = attendee.is_active;
                        record.phone_number = attendee.phone_number;
                        record.promo_balance = attendee.promo_balance;
                        record.promo_balance_rfid_applied = attendee.promo_balance_rfid_applied;
                        record.card_on_files = attendee.card_on_files;
                        record.personnal_pin = attendee.personnal_pin;
                        record.event_id = Number(eventId);
                    });
                }));
            });
            //console.log("ATTENDEES Synced: ", offset + CHUNK_SIZE);
            offset += CHUNK_SIZE;
        }
        console.log("@@===ATTENDEES_SYNC Done ===");
        await setCachedItem(KEY_NAME.ATTENDEES_SYNC, 'true');
    } catch (error) {
        console.log("sync attendees error", error);
        return error;
    }
};

export const NewSyncAttendeesRecursive = async (client, eventId, database) => {
    try {
        const lastSyncTime = await getLastSync({endpoint: "attendees"});
        const res = await client.query({
            query: GET_EVENT_ATTENDEES,
            variables: {
                eventId: Number(eventId),
                lastSyncTime,
            },
        });
        if (res?.data?.attendees?.length > 0) {
            await database.write(async () => {
                const attendeesCollection = database.collections.get("attendees");
                const remoteAttendees = res.data.attendees;
                for (const attendee of remoteAttendees) {
                    console.log({attendee});
                    let existingAttendee;
                    try {
                        existingAttendee = await attendeesCollection.find(attendee.id.toString());
                    } catch (findError) {
                        existingAttendee = null;
                    }
                    if (existingAttendee) {
                        await existingAttendee.update((record) => {
                            record.is_active = attendee.is_active;
                            record.phone_number = attendee.phone_number;
                            record.promo_balance = attendee.promo_balance;
                            record.promo_balance_rfid_applied = attendee.promo_balance_rfid_applied;
                            record.card_on_files = attendee.card_on_files;
                            record.personnal_pin = attendee.personnal_pin;
                        });
                    } else {
                        await attendeesCollection.create((record) => {
                            record._raw.id = attendee.id.toString();
                            record.is_active = attendee.is_active;
                            record.phone_number = attendee.phone_number;
                            record.promo_balance = attendee.promo_balance;
                            record.promo_balance_rfid_applied = attendee.promo_balance_rfid_applied;
                            record.card_on_files = attendee.card_on_files;
                            record.personnal_pin = attendee.personnal_pin;
                            record.event_id = Number(eventId);
                        });
                    }
                }
            });
            await setLastSync({
                endpoint: "attendees",
                updated_at: res.data.attendees[0].updated_at,
            });
        }
        console.log("@@===ATTENDEES_RECURSIVE_SYNC Done ===");
    } catch (error) {
        console.log("NewSyncAttendeesRecursive error", error);
        return error;
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
                                associate_rfid: {message},
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
                            await updateRFIDAsset({...message.rfid_asset, uid}, database);
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
                        console.log({error});
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
        console.log("sync orders", JSON.stringify({error}));
    }
};
