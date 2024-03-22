import { Q } from "@nozbe/watermelondb";
import moment from "moment";
import { orderCardSchema } from "../../components/types/orderCard.type";
import { orderCashSchema } from "../../components/types/orderCash.type";
import { orderRfidSchema } from "../../components/types/orderRfid.type";
import { orderQRCodeSchema } from "../../components/types/orderQRCode.type";
import {
    PUSH_ORDER_CARD,
    PUSH_ORDER_CASH,
    PUSH_ORDER_QRCODE,
    PUSH_ORDER_RFID,
} from "../../fragments/resolvers";
import { WriteLog } from "../../CommonLogFile";

const pushOrderForSync = async (order, client, database) => {
    try {
        if (order.payment_method === "rfid" || order.payment_method === "qr_code") {
            const orderServiceInputRfid = {
                status: "pending",
                items: order.items,
                reference_id: order.reference_id,
                subtotal: order.subtotal,
                tax: order?.tax ? order.tax : 0,
                tip: parseInt(order.tip, 10),
                transaction_at: order.transaction_time,
                transaction_time: order.transaction_time,
                user_id: parseInt(order.user_id, 10),
                location_id: order.location_id,
                event_id: order.event_id,
                uid: order.uid,
                device_app_id: order.device_app_id ? order.device_app_id : "null",
                digital_surcharge_percentage: order.digital_surcharge_percentage,
                digital_surcharge: order.digital_surcharge_amount,
                phone_number: order.phone_number,
                discount: order.discount,
                tokens_redeemed: order.tokens_redeemed,
                vendor_id: order.vendor_id,
                menu_id: order.menu_id,
            };

            try {
                const validateSchema = orderRfidSchema.validate(orderServiceInputRfid);
                if (validateSchema.error) {
                    throw new Error(validateSchema.error);
                }
            } catch (error) {
                console.error("Invalid payload", error);
            }
            try {
                const res = await client.mutate({
                    mutation: PUSH_ORDER_RFID,
                    variables: { orderServiceInputRfid },
                });
                if (
                    res?.order_service_rfid?.message ===
                    "Order already exists, it's rejected to avoid duplicated data"
                ) {
                    await database.write(async () => {
                        const orders = await database
                            .get("orders")
                            .query(
                                Q.where("reference_id", orderServiceInputRfid.reference_id)
                            )
                            .fetch();
                        await orders[0].markAsDeleted();
                        await orders[0].destroyPermanently();
                    });
                } else if (res) {
                    await database.write(async () => {
                        const orders = await database
                            .get("orders")
                            .query(
                                Q.where("reference_id", orderServiceInputRfid.reference_id)
                            )
                            .fetch();
                        await orders[0].update((order) => {
                            order.is_pushed = true;
                            order.status = "processed";
                        });
                    });
                }
            } catch (e) {
                WriteLog("syncOrder PUSH ORDER RFID FAILED" + e);
                console.log("PUSH ORDER RFID FAILED", e);
            }
        }

        if (order.payment_method === "qr_code") {
            const orderServiceInputRfid = {
                status: "pending",
                items: order.items,
                reference_id: order.reference_id,
                subtotal: order.subtotal,
                tax: order?.tax ? order.tax : 0,
                tip: parseInt(order.tip, 10),
                transaction_at: order.transaction_time,
                transaction_time: order.transaction_time,
                user_id: parseInt(order.user_id, 10),
                location_id: order.location_id,
                event_id: order.event_id,
                uid: order.uid,
                device_app_id: order.device_app_id ? order.device_app_id : "null",
                digital_surcharge_percentage: order.digital_surcharge_percentage,
                digital_surcharge: order.digital_surcharge_amount,
                phone_number: order.phone_number,
                discount: order.discount,
                tokens_redeemed: order.tokens_redeemed,
                vendor_id: order.vendor_id,
                menu_id: order.menu_id,
            };

            try {
                const validateSchema = orderQRCodeSchema.validate(orderServiceInputRfid);
                if (validateSchema.error) {
                    throw new Error(validateSchema.error);
                }
            } catch (error) {
                console.error("Invalid payload", error);
            }
            try {
                const res = await client.mutate({
                    mutation: PUSH_ORDER_QRCODE,
                    variables: { orderServiceInputRfid },
                });
                if (
                    res?.order_service_rfid?.message ===
                    "Order already exists, it's rejected to avoid duplicated data"
                ) {
                    await database.write(async () => {
                        const orders = await database
                            .get("orders")
                            .query(
                                Q.where("reference_id", orderServiceInputRfid.reference_id)
                            )
                            .fetch();
                        await orders[0].markAsDeleted();
                        await orders[0].destroyPermanently();
                    });
                } else if (res) {
                    await database.write(async () => {
                        const orders = await database
                            .get("orders")
                            .query(
                                Q.where("reference_id", orderServiceInputRfid.reference_id)
                            )
                            .fetch();
                        await orders[0].update((order) => {
                            order.is_pushed = true;
                            order.status = "processed";
                        });
                    });
                }
            } catch (e) {
                WriteLog("syncOrder PUSH ORDER RFID FAILED" + e);
                console.log("PUSH ORDER RFID FAILED", e);
            }
        }

        if (order.payment_method === "credit") {
            const currentTime = moment(
                moment(new Date().toUTCString(), "DD MMM YYYY HH:mm:ss").format(
                    "YYYY-MM-DDTHH:mm:ss"
                )
            );
            WriteLog(
                "syncOrder currentTime" +
                currentTime +
                moment(order.transaction_time) +
                moment(order.transaction_time).diff(currentTime)
            );
            const duration = moment.duration(
                moment(currentTime).diff(order.transaction_time)
            );
            const minutesDiff = duration.asMinutes();
            if (order.phone_number !== null || minutesDiff > 2) {
                const orderServiceInputCard = {
                    status: "processed",
                    items: order.items,
                    reference_id: order.reference_id,
                    subtotal: order.subtotal,
                    tax: order.tax ? order.tax : 0,
                    tip: parseInt(order.tip, 10),
                    transaction_at: order.transaction_time,
                    transaction_time: order.transaction_time,
                    user_id: parseInt(order.user_id, 10),
                    payments: order.payments,
                    location_id: order.location_id,
                    event_id: order.event_id,
                    device_app_id: order.device_app_id ? order.device_app_id : "null",
                    phone_number: order.phone_number,
                    discount: order.discount,
                    digital_surcharge: order.digital_surcharge_amount
                        ? order.digital_surcharge_amount
                        : 0,
                    vendor_id: order.vendor_id,
                    menu_id: order.menu_id,
                };

                try {
                    const validateSchema = orderCardSchema.validate(
                        orderServiceInputCard
                    );
                    if (validateSchema.error) {
                        WriteLog("syncOrder validateSchema" + validateSchema);
                        console.log({ validateSchema });
                        throw new Error(validateSchema.error);
                    }
                } catch (error) {
                    console.error("Invalid payload", error);
                }

                try {
                    const res = await client.mutate({
                        mutation: PUSH_ORDER_CARD,
                        variables: { orderServiceInputCard },
                    });
                    if (res) {
                        await database.write(async () => {
                            const orders = await database
                                .get("orders")
                                .query(
                                    Q.where("reference_id", orderServiceInputCard.reference_id)
                                )
                                .fetch();
                            await orders[0].update((order) => {
                                order.is_pushed = true;
                                order.status = "processed";
                            });
                        });
                    }
                } catch (e) {
                    WriteLog("syncOrder PUSH ORDER CARD FAILED" + e);
                    console.log("PUSH ORDER CARD FAILED", e);
                }
            }
        }

        if (order.payment_method === "cash") {
            const currentTime = moment(
                moment(new Date().toUTCString(), "DD MMM YYYY HH:mm:ss").format(
                    "YYYY-MM-DDTHH:mm:ss"
                )
            );
            WriteLog(
                "syncOrder currentTime" +
                currentTime +
                moment(order.transaction_time) +
                moment(order.transaction_time).diff(currentTime)
            );
            const duration = moment.duration(
                moment(currentTime).diff(order.transaction_time)
            );
            const minutesDiff = duration.asMinutes();
            if (order.phone_number !== null || minutesDiff > 2) {
                const orderServiceInputCash = {
                    status: "processed",
                    items: order.items,
                    reference_id: order.reference_id,
                    subtotal: order.subtotal,
                    tax: order.tax ? order.tax : 0,
                    tip: order.tip ? parseInt(order.tip, 10) : 0,
                    transaction_at: order.transaction_time,
                    transaction_time: order.transaction_time,
                    user_id: parseInt(order.user_id, 10),
                    payments: order.payments,
                    location_id: order.location_id,
                    event_id: order.event_id,
                    device_app_id: order.device_app_id ? order.device_app_id : "null",
                    phone_number: order.phone_number,
                    discount: order.discount,
                    vendor_id: order.vendor_id,
                    menu_id: order.menu_id,
                };

                try {
                    const validateSchema = orderCashSchema.validate(
                        orderServiceInputCash
                    );
                    if (validateSchema.error) {
                        throw new Error(validateSchema.error);
                    }
                } catch (error) {
                    console.error("Invalid payload", error);
                }

                try {
                    WriteLog(
                        "syncOrder [pushOrderForSync] ready to push" + orderServiceInputCash
                    );
                    console.log(
                        `[pushOrderForSync] ready to push`,
                        orderServiceInputCash
                    );
                    const res = await client.mutate({
                        mutation: PUSH_ORDER_CASH,
                        variables: { orderServiceInputCash },
                    });
                    WriteLog("syncOrder mutation succesful" + res.data);
                    console.log("mutation succesful", res.data);

                    if (res) {
                        WriteLog("syncOrder Order Mutation Successful");
                        console.log("[pushOrderForSync] Order Mutation Successful !");
                        await database.write(async () => {
                            const orders = await database
                                .get("orders")
                                .query(
                                    Q.where("reference_id", orderServiceInputCash.reference_id)
                                )
                                .fetch();
                            WriteLog("syncOrder ORDER FOUND" + order);
                            console.log("ORDER FOUND", order);
                            await orders[0].update((order) => {
                                order.is_pushed = true;
                                order.status = "processed";
                            });
                        });
                    }
                } catch (e) {
                    WriteLog("syncOrder PUSH ORDER CASH FAILED" + e);
                    console.log("PUSH ORDER CASH FAILED", e);
                }
            }
        }
    } catch (e) {
        WriteLog("syncOrder PUSH ORDER CASH FAILED" + e);
        console.log("PUSH ORDER FAILED", e);
    }
};

export const NewSyncOrders = async (client, database) => {
    try {
        const ordersToSync = await database
            .get("orders")
            .query(Q.where("is_pushed", false));


        if (ordersToSync.length === 0) {
        } else {
            const syncingOrders = ordersToSync.map(async (order) => {
                // WriteLog("syncOrder syncOrders" + order);
                // console.log("[syncOrders]", order);
                const unsyncedAttendee = await database
                    .get("attendees")
                    .query(Q.where("unsynced_rfid_uid", order.uid));
                WriteLog(
                    "syncOrder unsyncedAttendee, order" + unsyncedAttendee + order
                );
                console.log({ unsyncedAttendee, order });
                if (unsyncedAttendee?.length > 0) {
                    WriteLog("wait to sync order until attendee association");
                    console.log("wait to sync order until attendee association");
                } else if (!order?.order_id || !order.reference_id) {
                    await database.write(async () => {
                        await order.markAsDeleted();
                        await order.destroyPermanently();
                    });
                } else {
                    await pushOrderForSync(order, client, database);
                }
            });
            await Promise.all(syncingOrders);
        }
    } catch (error) {
        WriteLog("SyncOrder error" + error);
        console.log("sync orders23", JSON.stringify({
            message: error.message,
            stack: error.stack
        }));
    }
};
