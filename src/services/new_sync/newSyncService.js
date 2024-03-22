import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { REACT_APP_APPOLLO_CLIENT_TIMOUT, REACT_APP_HASURA_GRAPHQL_ENDPOINT, HASURA_ADMIN_SECRET } from "@env";
import ApolloLinkTimeout from "apollo-link-timeout";
import { NewSyncEvents } from "./newSyncEvents";
import { NewSyncDiscounts } from "./newSyncDiscounts";
import { NewSyncLocations } from "./newSyncLocations";
import { NewSyncMenus } from "./newSyncMenus";
import { NewSyncMenuItems } from "./newSyncMenuItems";
import { NewSyncUsers } from "./newSyncUsers";
import { NewSyncAttendees, NewSyncAttendeesRecursive } from "./newSyncAttendees";
import { NewSyncRFID, NewSyncRFIDRecursive, NewSyncRfidRecord } from "./newSyncRFID";
import { NewSyncOrders } from "./newSyncOrders";
import { syncPendingAttendeeRfidAssociations } from "./newSyncAttendees";
import { insertOrderCash, insertOrderCredit, insertOrderRfid, insertOrderQRCode } from "../utilitiesSync";
import { WriteLog } from "../../CommonLogFile";
import { updateRfidAsset } from "../utilitiesSync/updateRfidAsset";
import { PUSH_ORDER_CARD, PUSH_ORDER_CASH, PUSH_ORDER_QRCODE, PUSH_ORDER_RFID } from "../../fragments/resolvers";
import { Q } from "@nozbe/watermelondb";


const APPOLLO_CLIENT_TIMOUT =
  REACT_APP_APPOLLO_CLIENT_TIMOUT * 1000 || 15 * 1000;

export default class NewSyncService {
  constructor({
    database,
    organizationId,
    eventId
  }) {
    this.db = database;
    this.organizationId = Number(organizationId);
    this.eventId = Number(eventId);

    const httpLink = createHttpLink({
      uri: REACT_APP_HASURA_GRAPHQL_ENDPOINT,
      headers: {
        'x-hasura-admin-secret': `${HASURA_ADMIN_SECRET}`,
      },
    });
    const timeoutLink = new ApolloLinkTimeout(APPOLLO_CLIENT_TIMOUT);
    const timeoutHttpLink = timeoutLink.concat(httpLink);

    this.gqlClient = new ApolloClient({
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
        },
      },
      link: timeoutHttpLink,
    });
  }

  async newUserEventDiscountSync(isUserSync, isEventSync, isDiscountSync) {
    if (this.organizationId) {
      if (isUserSync) {
        await this.newUsersSync();
      }
      if (isEventSync) {
        await this.newEventsSync();
      }
      if (isDiscountSync) {
        await this.newDiscountsSync();
      }
    }
  }

  async newUsersSync() {
    if (this.organizationId) {
      await NewSyncUsers(
        this.gqlClient,
        this.organizationId,
        this.db,
      );
    }
  }

  async newEventsSync() {
    if (this.organizationId) {
      await NewSyncEvents(
        this.gqlClient,
        this.organizationId,
        this.db,
      );
    }
  }

  async newDiscountsSync() {
    if (this.organizationId) {
      await NewSyncDiscounts(
        this.gqlClient,
        this.organizationId,
        this.db,
      );
    }
  }

  async newLocationsMenuMenuItemsSync(isAttendeesRFIDSync, isDiscountSync) {
    if (this.eventId !== 0) {
      await this.newLocationsSync();
      await this.newMenusSync();
      await this.newMenuItemsSync();
    }

    if (isAttendeesRFIDSync) {
      await this.newAttendeesSync();
      await this.newRFIDSync();
    }

    if (isDiscountSync) {
      await this.newDiscountsSync();
    }
  }

  async newLocationsSync() {
    if (this.eventId !== 0) {
      await NewSyncLocations(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }


  async newMenusSync() {
    if (this.eventId !== 0) {
      await NewSyncMenus(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }

  async newMenuItemsSync() {
    if (this.eventId !== 0) {
      await NewSyncMenuItems(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }

  async newAttendeesSync() {
    if (this.eventId !== 0) {
      await NewSyncAttendees(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }

  async newAttendeesSyncRecursive() {
    if (this.eventId !== 0) {
      await NewSyncAttendeesRecursive(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }
  async newSyncAssociations() {
    await syncPendingAttendeeRfidAssociations(this.gqlClient, this.db);
  }

  async newRFIDSync() {
    if (this.eventId !== 0) {
      await NewSyncRFID(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }

  async newRFIDSyncRecursive() {
    if (this.eventId !== 0) {
      await NewSyncRFIDRecursive(
        this.gqlClient,
        this.eventId,
        this.db,
      );
    }
  }
  async newOrderSync() {
    try {
      await NewSyncOrders(
        this.gqlClient,
        this.db
      );
      return true;
    } catch (error) {
      console.log("sync orders error");
      return { error: JSON.stringify(error) };
    }
  }

  async newRfidRecordSync() {
    console.log("@@===newRfidRecordSync===")
    try {
      await NewSyncRfidRecord(
        this.gqlClient,
        this.db,
      );
      return true;
    } catch (error) {
      console.log("sync orders error");
      return { error: JSON.stringify(error) };
    }
  }

  async newOrderPush(
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

          case "qr_code":
            await insertOrderQRCode(
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
      if (type === "qr_code") {
        return PUSH_ORDER_QRCODE;
      }
      if (type === "credit") {
        return PUSH_ORDER_CARD;
      }
      return PUSH_ORDER_CASH;
    };
    const mutationInput = (type) => {
      if (type === "rfid" || type === "qr_code") {
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
      console.log("create orders::::",type);
      const res = await this.gqlClient.mutate({
        mutation: orderMutation(type),
        variables: mutationInput(type),
      });
      WriteLog("update rfid");
      console.log("update rfid");
      WriteLog("update res" + res);
      console.log("Res : ", JSON.stringify(res));
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
            case "qr_code":
              await insertOrderQRCode(
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
        if (type === "rfid" || type === "qr_code") {
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




