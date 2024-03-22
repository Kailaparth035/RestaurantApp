import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, json } from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;
export default class ASSET extends Model {
  static table = "rfid_assets";

  @field("rfid_id") rfid_id;

  @field("uid") uid;

  @field("is_active") is_active;

  @field("event_id") event_id;

  @field("last_four_phone_numbers") last_four_phone_numbers;

  @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;

  @json('tokens_balance', sanitizeItems) tokens_balance;

  @field("cash_balance") cash_balance;

  @field("promo_balance") promo_balance;

  @field("attendee_id") attendee_id;

  @field("is_sync") is_sync;
}
