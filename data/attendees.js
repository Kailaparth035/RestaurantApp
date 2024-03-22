import { Model } from "@nozbe/watermelondb";
import { field, json } from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;
export default class Attendees extends Model {
  static table = "attendees";

  @field("is_active") is_active;

  @field("phone_number") phone_number;

  @field("personnal_pin") personnal_pin;

  @field("event_id") event_id;

  @field("promo_balance") promo_balance;

  @field("promo_balance_rfid_applied") promo_balance_rfid_applied;

  @field("is_pushed") is_pushed

  @field("status") status
  
  @field("unsynced_rfid_uid") unsynced_rfid_uid

  @json("card_on_files", sanitizeItems) card_on_files;
}
