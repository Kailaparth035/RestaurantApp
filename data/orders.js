/* eslint-disable camelcase */
import { Model } from "@nozbe/watermelondb";
import {
  action,
  date,
  field,
  json,
  readonly,
} from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;

export default class Order extends Model {
  static table = "orders";

  // TODO: offset watermelonDB reserving id?
  @field("order_id") order_id;

  @field("app_device_id") app_device_id;

  @json("items", sanitizeItems) items;

  @json("discount", sanitizeItems) discount;

  @field("subtotal") subtotal;

  @field("tax") tax;

  @field("tip") tip;

  @field("status") status;

  @field("device_id") device_id;

  @field("user_id") user_id;

  @readonly @date("created_at") created_at;

  @date("transaction_at") transaction_at;

  @field("reference_id") reference_id;

  @field("attendee_id") attendee_id;

  @field("phone_number") phone_number;

  @field("transaction_time") transaction_time;

  @field("digital_surcharge_percentage") digital_surcharge_percentage;

  @field("digital_surcharge_label") digital_surcharge_label;

  @field("digital_surcharge_amount") digital_surcharge_amount;

  @field("user_id") user_id;

  @field("event_id") event_id;

  @field("location_id") location_id;

  @field("payment_method") payment_method;

  @json("payments", sanitizeItems) payments;

  @field("is_pushed") is_pushed;

  @field("uid") uid;

  @json("tokens_redeemed", sanitizeItems) tokens_redeemed

  @field("mx_ref_id") mx_ref_id
  
  @field("vendor_id") vendor_id
  
  @field("menu_id") menu_id

  @action async delete() {
    await super.markAsDeleted();
  }
}
