import { WriteLog } from "../../CommonLogFile";

/**
 *
 * @param {*} orderInputs Object
 * @param {*} extraPayload Object
 * @param {*} database Function
 * @param {*} is_online Boolean
 * @returns
 */
export async function insertOrderQRCode(
  orderInputs,
  extraPayload,
  database,
  is_online
) {
  try {
    const randomOrderId = Math.floor(100000 + Math.random() * 900000);

    const newOrders = await database.get("orders");
    WriteLog("insertOrderQRCode rfid order tax" + orderInputs);
    console.log("QRCode order tax", orderInputs);
    return await newOrders.create((order) => {
      order.order_id = randomOrderId;
      order.reference_id = orderInputs.reference_id;
      order.device_id = orderInputs.device_id ? orderInputs.device_id : 0;
      order.items = orderInputs.items;
      order.discount = orderInputs.discount ? orderInputs.discount : null;
      order.subtotal = orderInputs.subtotal;
      order.tip = orderInputs.tip;
      order.device_app_id = orderInputs.device_app_id
        ? orderInputs.device_app_id
        : "null";
      order.status = is_online ? orderInputs.status : "pending";
      order.transaction_time = orderInputs.transaction_time;
      order.transaction_at = orderInputs.transaction_time;
      order.user_id = orderInputs.user_id;
      order.location_id = orderInputs.location_id;
      order.event_id = orderInputs.event_id;
      order.payment_method = "qr_code";
      order.payments = null;
      order.digital_surcharge_percentage =
        extraPayload.digital_surcharge_percentage;
      order.digital_surcharge_label = extraPayload.digital_surcharge_label;
      order.digital_surcharge_amount = orderInputs.digital_surcharge
        ? orderInputs.digital_surcharge
        : 0;
      order.uid = orderInputs.uid ? orderInputs.uid : null;
      order.is_pushed = is_online;
      order.tokens_redeemed = orderInputs.tokens_redeemed;
      order.tax = orderInputs.tax;
      order.vendor_id = orderInputs.vendor_id;
      order.menu_id = orderInputs.menu_id;
    });
  } catch (error) {
    WriteLog("insertOrderQRCode [WATERMELON_DB] RFID Order Insert :" + error);
    console.log(`[WATERMELON_DB] QRCode Order Insert :`, error);
    return error;
  }
}
