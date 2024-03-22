import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import {
  REACT_APP_APPOLLO_CLIENT_TIMOUT,
  REACT_APP_HASURA_GRAPHQL_ENDPOINT,
  REACT_APP_SYNC_DEBUG_FLAG,
  REACT_APP_SYNC_RATE_SECONDS,
} from "@env";
import { Q } from "@nozbe/watermelondb";
import ApolloLinkTimeout from "apollo-link-timeout";
import BackgroundTimer from "react-native-background-timer";
import {
  PUSH_ORDER_CARD,
  PUSH_ORDER_CASH,
  PUSH_ORDER_RFID,
} from "../fragments/resolvers";
import ACModule from "./ACService";
// import { syncDiscounts } from "./syncDiscounts";
// import { syncEvents } from "./syncEvents";
// import { syncLocations } from "./syncLocations";
// import { syncMenus } from "./syncMenus";
// import { syncMenuItems } from "./syncMenuItems";
// import { syncOrders } from "./syncOrders";
// import { syncRFIDs } from "./syncRFIDs";
// eslint-disable-next-line import/no-cycle
// import {
//   syncAttendees,
//   syncPendingAttendeeRfidAssociations,
// } from "./syncAttendees";
import {
  insertOrderCash,
  insertOrderCredit,
  insertOrderRfid,
} from "./utilitiesSync/index";
import { updateRfidAsset } from "./utilitiesSync/updateRfidAsset";
import { WriteLog } from "../../src/CommonLogFile";

const DEBUG_SYNC = REACT_APP_SYNC_DEBUG_FLAG || false;
const SYNC_TIMER_M = REACT_APP_SYNC_RATE_SECONDS * 1000 || 1000 * 15;
const APPOLLO_CLIENT_TIMOUT =
  REACT_APP_APPOLLO_CLIENT_TIMOUT * 1000 || 15 * 1000;

export default class SyncService {
  constructor({
    database,
    accessToken,
    organizationId,
    eventId,
    locationId,
    showLoading,
    addSyncLogs = () => {},
  }) {
    this.db = database;
    this.showLoading = showLoading;
    this.accessToken = accessToken;
    this.locationId = locationId;
    this.eventId = Number(eventId) || null;
    this.organizationId = Number(organizationId);
    this.newMenuId = null;
    this.rfidAssetsInitialSync = false;
    this.offlineMode = false;
    this.isTimerRunning = false;
    this.organizerConfigSyncing = false;
    this.menuChunksSyncing = 0;
    this.syncedMenuChunks = [];
    this.locationChunksSyncing = 0;
    this.syncedLocationChunks = [];
    this.discountChunksSyncing = 0;
    this.syncedDiscountChunks = [];
    this.attendeeChunksSyncing = 0;
    this.syncedAttendeeChunks = [];
    this.locationSynced = false;
    this.syncingRfids = false;
    this.eventSynced = false;
    this.addSyncLogs = addSyncLogs;
    const httpLink = createHttpLink({
      uri: REACT_APP_HASURA_GRAPHQL_ENDPOINT,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });


    const timeoutLink = new ApolloLinkTimeout(APPOLLO_CLIENT_TIMOUT);
    const timeoutHttpLink = timeoutLink.concat(httpLink);
    WriteLog("SyncService [SYNC Service] first time");
    console.log(`[SYNC Service] first time`);

    this.gqlClient = new ApolloClient({
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
        },
      },
      link: timeoutHttpLink,
    });

    this.locations = this.db.collections.get("locations");
    this.menus = this.db.collections.get("menus");
    this.syncs = this.db.collections.get("syncs");
    this.discounts = this.db.collections.get("discounts");
    this.events = this.db.collections.get("events");
    this.rfidAssets = this.db.collections.get("rfid_assets");
    this.menuItem = this.db.collections.get("menuItems");
    this.networkState = false;
    // first RUN
    // this.syncSpin();
  }

  // async setOfflineMode(mode) {
  //   this.offlineMode = mode;
  //   console.log("OfflineMode Set from Sync Service: ", this.offlineMode)
  //   await this.stop();
  //   await this.start()
  // }
  now() {
    const d = new Date();
    return d.toISOString();
  }

  async syncSpin(withoutSync, organizationId) {
    // if (this.organizationId !== organizationId && organizationId) {
    //   this.organizationId = Number(organizationId);
    // }
    // if (DEBUG_SYNC) {
    //   console.log(
    //     `[SyncService] Tick`,
    //     withoutSync,
    //     this.locationId,
    //     this.eventId
    //   );
    // }
    //
    // if (withoutSync) {
    //   // await syncEvents(this.gqlClient, this.organizationId, this.db);
    //   if (this.eventId) {
    //     // this.syncMenus(this.eventId, undefined);
    //     // this.syncLocations(this.eventId, undefined);
    //     // this.syncMenuItems(this.eventId);
    //
    //     await syncRFIDs(this.gqlClient, this.eventId, withoutSync, this.db);
    //     if (this.attendeeChunksSyncing === 0) {
    //       await syncAttendees({
    //         client: this.gqlClient,
    //         eventId: this.eventId,
    //         database: this.db,
    //         withoutSync,
    //         setChunksToSync: (total) => {
    //           this.attendeeChunksSyncing = total;
    //         },
    //         onChunkSync: (index) => {
    //           if (
    //             this.syncedAttendeeChunks.length + 1 ===
    //             this.attendeeChunksSyncing
    //           ) {
    //             this.attendeeChunksSyncing = 0;
    //             this.syncedAttendeeChunks = [];
    //           } else {
    //             this.syncedAttendeeChunks.push(index);
    //           }
    //         },
    //       });
    //     }
    //     console.log("syncSpin OfflineMode: ", this.offlineMode)
    //     // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //     await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
    //   }
    //
    //   this.organizerConfigSyncing = false;
    //   this.locationSynced = true;
    //   this.eventSynced = true;
    //   this.syncingRfids = true;
    // } else if (this.eventId && this.organizationId) {
    //   // this.syncLocations(this.eventId, undefined);
    //   // this.syncMenus(this.eventId, undefined);
    //   // this.syncMenuItems(this.eventId);
    //   if (this.discountChunksSyncing === 0) {
    //     // this.syncDiscounts(this.eventId);
    //   }
    //
    //   // await syncEvents(this.gqlClient, this.organizationId, this.db);
    //   await syncRFIDs(this.gqlClient, this.eventId, null, this.db);
    //   if (this.attendeeChunksSyncing === 0) {
    //     await syncAttendees({
    //       client: this.gqlClient,
    //       eventId: this.eventId,
    //       database: this.db,
    //       setChunksToSync: (total) => {
    //         this.attendeeChunksSyncing = total;
    //       },
    //       onChunkSync: (index) => {
    //         if (
    //           this.syncedAttendeeChunks.length + 1 ===
    //           this.attendeeChunksSyncing
    //         ) {
    //           this.attendeeChunksSyncing = 0;
    //           this.syncedAttendeeChunks = [];
    //         } else {
    //           this.syncedAttendeeChunks.push(index);
    //         }
    //       },
    //     });
    //   }
    //   console.log("syncSpin OfflineMode: ", this.offlineMode)
    //   // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //   await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
    // } else {
    //   if (this.organizationId) {
    //     // await syncEvents(this.gqlClient, this.organizationId, this.db);
    //     // this.syncLocations(this.eventId, undefined);
    //   }
    //   if (this.eventId) {
    //     // this.syncMenuItems(this.eventId);
    //   }
    //
    //   console.log("syncSpin OfflineMode: ", this.offlineMode)
    //   // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //   await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
    // }
  }

  async syncContinueSpin() {
    // if (this.eventId && this.organizationId) {
    //   await syncRFIDs(this.gqlClient, this.eventId, null, this.db);
    //   if (this.attendeeChunksSyncing === 0) {
    //     await syncAttendees({
    //       client: this.gqlClient,
    //       eventId: this.eventId,
    //       database: this.db,
    //       setChunksToSync: (total) => {
    //         this.attendeeChunksSyncing = total;
    //       },
    //       onChunkSync: (index) => {
    //         if (
    //           this.syncedAttendeeChunks.length + 1 ===
    //           this.attendeeChunksSyncing
    //         ) {
    //           this.attendeeChunksSyncing = 0;
    //           this.syncedAttendeeChunks = [];
    //         } else {
    //           this.syncedAttendeeChunks.push(index);
    //         }
    //       },
    //     });
    //   }
    //   console.log("syncContinueSpin OfflineMode: ", this.offlineMode)
    //   // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //   await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
    // } else {
    //   console.log("syncContinueSpin OfflineMode: ", this.offlineMode)
    //   // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //   await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
    // }
  }

  async eventSync() {
    // await syncEvents(
    //   this.gqlClient,
    //   this.organizationId,
    //   this.db,
    //   this.showLoading
    // );
  }

  async syncMenuItems(eventId) {
    // WriteLog("SyncService syncMenuItems :::" + eventId);
    // console.log("syncMenuItems :::", eventId);
    // await syncMenuItems({
    //   client: this.gqlClient,
    //   eventId: eventId,
    //   database: this.db,
    // });
  }

  async syncLocations(eventId, showLoading) {
    // await syncLocations({
    //   client: this.gqlClient,
    //   eventId: this.eventId,
    //   database: this.db,
    //   setChunksToSync: (total) => {
    //     this.locationChunksSyncing = total;
    //   },
    //   onChunkSync: (index) => {
    //     if (
    //       this.syncedLocationChunks.length + 1 ===
    //       this.locationChunksSyncing
    //     ) {
    //       this.locationChunksSyncing = 0;
    //       this.syncedLocationChunks = [];
    //     } else {
    //       this.syncedLocationChunks.push(index);
    //     }
    //   },
    // });
  }

  async syncMenus(eventId, showLoading, updateSelectedMenu) {
    // await syncMenus({
    //   // setSyncLogs: this.setSyncLogs,
    //   client: this.gqlClient,
    //   eventId: this.eventId,
    //   database: this.db,
    //   showLoading: showLoading,
    //   updateSelectedMenu: updateSelectedMenu,
    //   setMenuChunksToSync: (total) => {
    //     this.menuChunksSyncing = total;
    //   },
    //   onMenuChunkSync: (index) => {
    //     WriteLog("SyncService on menu chunk sync");
    //     console.log("on menu chunk sync");
    //     if (this.syncedMenuChunks.length + 1 === this.menuChunksSyncing) {
    //       this.menuChunksSyncing = 0;
    //       this.syncedMenuChunks = [];
    //     } else {
    //       this.syncedMenuChunks.push(index);
    //     }
    //   },
    // });
  }
  async syncDiscounts() {
    // await syncDiscounts({
    //   client: this.gqlClient,
    //   organizationId: this.organizationId,
    //   database: this.db,
    //   setChunksToSync: (total) => {
    //     this.discountChunksSyncing = total;
    //   },
    //   onChunkSync: (index) => {
    //     if (
    //       this.syncedDiscountChunks.length + 1 ===
    //       this.discountChunksSyncing
    //     ) {
    //       this.discountChunksSyncing = 0;
    //       this.syncedDiscountChunks = [];
    //     } else {
    //       this.syncedDiscountChunks.push(index);
    //     }
    //   },
    // });
  }

  async refreshLocation(eventId, showLoading, updateSelectedMenu) {
    // this.syncLocations(eventId, showLoading);
    // this.syncMenus(eventId, showLoading, updateSelectedMenu);
    // this.syncDiscounts();
    // this.syncMenuItems(eventId);
  }

  async refreshRfidAndAttendee(showLoading) {
    // await syncRFIDs(this.gqlClient, this.eventId, null, this.db);
    // await syncAttendees({
    //   client: this.gqlClient,
    //   eventId: this.eventId,
    //   database: this.db,
    //   showLoading: showLoading,
    //   setChunksToSync: (total) => {
    //     this.attendeeChunksSyncing = total;
    //   },
    //   onChunkSync: (index) => {
    //     if (
    //       this.syncedAttendeeChunks.length + 1 ===
    //       this.attendeeChunksSyncing
    //     ) {
    //       this.attendeeChunksSyncing = 0;
    //       this.syncedAttendeeChunks = [];
    //     } else {
    //       this.syncedAttendeeChunks.push(index);
    //     }
    //   },
    // });
    // await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
  }

  async orderSync() {
    // try {
    //   console.log("orderSync OfflineMode: ", this.offlineMode);
    //   // await syncOrders(this.gqlClient, this.db, this.offlineMode);
    //   return true;
    // } catch (error) {
    //   WriteLog("SyncService sync orders error");
    //   console.log("sync orders error");
    //   return { error: JSON.stringify(error) };
    // }
  }

  // async start() {
    // if (!this.isTimerRunning) {
    //   BackgroundTimer.runBackgroundTimer(async () => {
    //     ACModule.processOfflineTransactions();
    //     this.syncContinueSpin();
    //   }, SYNC_TIMER_M);
    //   this.isTimerRunning = true;
    // }
  // }

  // syncEventRelatedData(eventId) {
  //   // this.eventId = Number(eventId);
  //   // this.organizerConfigSyncing = true;
  //   // this.syncSpin(true);
  // }

  // syncAfterSelectingMenu(newEventId, newLocationId, withoutSync) {
    // if (newEventId && newEventId !== this.eventId) {
    //   this.eventId = newEventId;
    // }
    // this.locationId = newLocationId;
    // if (withoutSync) {
    //   this.organizerConfigSyncing = true;
    // }
    // this.syncSpin(withoutSync);
  // }

  // clearSyncState() {
    // this.syncedMenuChunks = [];
    // this.menuChunksSyncing = 0;
    // this.locationSynced = false;
    // this.eventSynced = false;
    // this.syncedMenuChunks = [];
    // this.locationChunksSyncing = 0;
    // this.syncedLocationChunks = [];
    // this.discountChunksSyncing = 0;
    // this.syncedDiscountChunks = [];
    // this.syncedEventChunks = [];
    // this.eventChunkingsSyncing = 0;
  // }

  // clearPosConfig() {
  //   this.newLocationId = null;
  //   this.newMenuId = null;
  // }

  // async stop() {
    // if(this.isTimerRunning) {
    //   BackgroundTimer.stopBackgroundTimer();
    //   this.isTimerRunning = false;
    // }
  // }

  // async syncAssociations() {
  //   await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
  // }

  async orderPush(
    orderServiceInput,
    extraPayload,
    type,    
    offlineMode
  ) {
    const offlineOrderPush = async () => {
      let response;
      await this.db.write(async () => {
        switch (type) {
          case "rfid":
            await insertOrderRfid(
              orderServiceInput,
              extraPayload,
              this.db,
              false
            );
            break;

          case "credit":
            await insertOrderCredit(
              orderServiceInput,
              extraPayload,
              this.db,
              false
            );
            break;
          default:
            await insertOrderCash(
              orderServiceInput,
              extraPayload,
              this.db,
              false
            );
            break;
        }
      });
      WriteLog("SyncService updated rfid asset");
      console.log("updated rfid asset");
      if (type === "rfid") {
        response = await updateRfidAsset(
          { ...orderServiceInput, ...extraPayload },
          this.db
        );
      }
      return {
        data: {
          order_service_rfid: {
            message: response,
          },
        },
      };
    };
    const orderMutation = (type) => {
      if (type === "rfid") {
        return PUSH_ORDER_RFID;
      }
      if (type === "credit") {
        return PUSH_ORDER_CARD;
      }
      return PUSH_ORDER_CASH;
    };
    const mutationInput = (type) => {
      if (type === "rfid") {
        const orderServiceInputRfid = orderServiceInput;
        WriteLog("SyncService orderServiceInput" + orderServiceInput);
        console.log({ orderServiceInput });
        return { orderServiceInputRfid };
      }
      if (type === "credit") {
        const orderServiceInputCard = orderServiceInput;
        return { orderServiceInputCard };
      }
      const orderServiceInputCash = orderServiceInput;
      return { orderServiceInputCash };
    };

    try {
      WriteLog("SyncService this.db.collections" + this.db.collections);
      console.log("this db", this.db.collections);
      let unsyncedAttendee = "";
      try {
        unsyncedAttendee = await this.db.collections
          .get("attendees")
          .query(Q.where("unsynced_rfid_uid", orderServiceInput.uid));
      } catch (error) {
        WriteLog("SyncService error" + error);
        console.log({ error });
      }

      if (
        offlineMode ||
        unsyncedAttendee?.length > 0 ||
        type === "credit"
      ) {
        return await offlineOrderPush();
      }
      WriteLog("create orders");
      console.log("create orders");
      const res = await this.gqlClient.mutate({
        mutation: orderMutation(type),
        variables: mutationInput(type),
      });
      WriteLog("update rfid");
      console.log("update rfid");
      WriteLog("update res" + res);
      console.log("Res : ", res);
      if (res) {
      await this.db.write(async () => {
        switch (type) {
          case "rfid":
            await insertOrderRfid(
              orderServiceInput,
              extraPayload,
              this.db,
              true
            );
            break;
          case "credit":
            await insertOrderCredit(
              orderServiceInput,
              extraPayload,
              this.db,
              true
            );
            break;
          default:
            await insertOrderCash(
              orderServiceInput,
              extraPayload,
              this.db,
              true
            );
            break;
        }
      });
      if (type === "rfid") {
        try {
          const current_rfid_asset = await this.db
            .get("rfid_assets")
            .find(orderServiceInput.uid);
          await updateRfidAsset(
            { ...orderServiceInput, ...extraPayload },
            this.db
          );
          WriteLog("update current_rfid_asset" + current_rfid_asset + res);
          console.log({ current_rfid_asset, res });
          const batchActions = [
            current_rfid_asset.prepareUpdate((record) => {
              record.cash_balance =
                res?.data?.order_service_rfid?.message?.cash_balance;
              record.promo_balance =
                res?.data?.order_service_rfid?.message?.promo_balance;
              record.tokens_balance =
                res?.data?.order_service_rfid?.message?.tokens_balance;
            }),
          ];
          await this.db.write(async () => {
            try {
              this.db.batch(batchActions);
              WriteLog("updateRfid batched");
              console.log(`updateRfid batched`);
            } catch (error) {
              WriteLog("updateRfid batched error" + error);
              console.log(`updateRfid batched error`);
              console.log({ error });
            }
          });

        } catch (error) {
          WriteLog("updateRfid batched error" + error);
          console.log({ error });
        }
      }
      return res;
      }
      throw "Cannot process order at this time";
    } catch (err) {
      WriteLog("updateRfid batched error" + err);
      console.log({ err });
      if (err.networkError) {
        WriteLog("updateRfid batched error" + err.networkError);
        console.log("NETWORK", err.networkError);
        return await offlineOrderPush();
      }
      if (err?.graphQLErrors[0]?.extensions?.name === "no card on file") {
        WriteLog("No card on file");
        console.log("No card on file");
        // eslint-disable-next-line no-throw-literal
        throw "No Card On File";
      } else if (err?.graphQLErrors[0]?.message?.error) {
        
        throw err?.graphQLErrors[0]?.message?.error?.message;
      } else {
        WriteLog("WTF " + err);
        console.log("WTF", JSON.stringify({ err }));
        throw err;
      }
    }
  }
}
