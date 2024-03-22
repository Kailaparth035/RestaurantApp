import { Model } from "@nozbe/watermelondb";
import { date, field, json, readonly } from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;

export default class Menus extends Model {
  static table = "menus";

  static assocation = {
    locations: { type: "belongs_to", key: "location_id" },
  };

  @field("menu_id") menuId;

  @field("name") name;

  @field("is_active") isActive;

  @field("event_id") eventId;

  @json("items", sanitizeItems) items;

  @readonly @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;

  @json("location_menus", sanitizeItems) locationMenus;

  @field("location_id", sanitizeItems) location_id;

  @field("tax_type") tax_type;

  @field("is_cash") is_cash;

  @field("is_credit") is_credit;

  @field("is_rfid") is_rfid;

  @field("is_qr") is_qr;

  @field("is_tips") is_tips;

  @field("tip_percentage_1") tip_percentage_1;

  @field("tip_percentage_2") tip_percentage_2;

  @field("tip_percentage_3") tip_percentage_3;

  @field("is_custom_item") is_custom_item;

  @json("category", sanitizeItems) category;

  @field("is_discount") is_discount;

  @field("is_discount_protected") is_discount_protected;

  @field("is_cash_not_taxed") is_cash_not_taxed;

  @field("processing_mode") processing_mode;
}
