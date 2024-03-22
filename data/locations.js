import { Model } from "@nozbe/watermelondb";
import {
  children,
  date,
  field,
  json,
  readonly,
} from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;

export default class Locations extends Model {
  static table = "locations";

  static associations = {
    menus: { type: "has_many", foreignKey: "location_id" },
  };

  @field("location_id") locationId;
  @field("name") name;
  @field("is_active") isActive;
  @field("event_id") eventId;
  @field("digital_surcharge_percentage") digital_surcharge_percentage;
  @field("dynamic_descriptor") dynamic_descriptor;
  @readonly @date("created_at") createdAt;
  @readonly @date("updated_at") updatedAt;
  @children("menus") menus;
  @json("payment_processor_config", sanitizeItems) paymentProcessorConfig;
  @field("payment_processor") paymentProcessor;
  @json("locationMenus", sanitizeItems) locationMenus;
  @field("vendor_id") vendor_id;
  @json("redeemable_tokens", sanitizeItems) redeemableTokens;
}
