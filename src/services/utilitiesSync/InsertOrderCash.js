import { WriteLog } from "../../../src/CommonLogFile";

/**
 *
 * @param {*} orderInputs Object
 * @param {*} extraPayload Object
 * @param {*} database Function
 * @param {*} is_online Boolean
 * @returns
 */
export async function insertOrderCash(
  orderInputs,
  extraPayload,
  database,
  is_online
) {
  try {
    const randomOrderId = Math.floor(100000 + Math.random() * 900000);

    const newOrders = await database.get("orders");
    return await newOrders.create((order) => {
      order.order_id = randomOrderId;
      order.reference_id = orderInputs.reference_id;
      order.items = orderInputs.items;
      order.discount = orderInputs.discount ? orderInputs.discount : null;
      order.subtotal = orderInputs.subtotal;
      order.tax = orderInputs.tax;
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
      if (orderInputs.phone_number) {
        order.phone_number = orderInputs.phone_number;
      }
      order.device_id = orderInputs.device_id ? orderInputs.device_id : 0;
      order.payment_method = "cash";
      order.payments = orderInputs.payments ? orderInputs.payments : {};
      order.is_pushed = is_online;
      order.vendor_id = orderInputs.vendor_id;
      order.menu_id = orderInputs.menu_id;
    });
  } catch (error) {
    WriteLog(" [WATERMELON_DB] Cash Order Insert : " + error);
    console.log(`[WATERMELON_DB] Cash Order Insert :`, error);
    return error;
  }
}
