import { Model } from "@nozbe/watermelondb";
import { date, field, json, readonly } from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;

export default class Events extends Model {
  static table = "events";

  @json("configuration", sanitizeItems) configuration;

  @field("event_id") eventId;

  @field("name") name;

  @field("currency") currency;

  @field("organization_id") organizationId;

  @field("timezone") timezone;

  @field("digital_surcharge_label") digital_surcharge_label;

  @field("dynamic_descriptor") dynamic_descriptor;

  @date("start_date") startDate;

  @date("end_date") endDate;

  @json("payment_types", sanitizeItems) paymentTypes;

  @json("available_tokens", sanitizeItems) availableTokens;

  @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;

  @field("is_org_logout_protected") is_org_logout_protected;

  @field("is_clerk_logout_protected") is_clerk_logout_protected;

  @field("event_passcode") event_passcode;
  
}
