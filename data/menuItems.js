import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, json } from "@nozbe/watermelondb/decorators";

const sanitizeItems = (json) => json;

export default class MenuItems extends Model {
  static table = "menuItems";

  @field("menu_item_id") menu_item_id;

  @field("name") name;

  @field("is_active") isActive;

  @readonly @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;

  @field("price") price;

  @field("image") image;

  @field("short_name") short_name;

  @field("unique_id") unique_id;

  @field("description") description;

  @field("redeemable_token_id") redeemable_token_id;

  @field("redeemable_token_name") redeemable_token_name;

  @field("token_price") token_price;

  @field("tax_percentage") tax_percentage;

  @field("tax") tax;

  @json("upc",sanitizeItems) upc;

  @field("is_favorite") is_favorite;

  @json("modifiers", sanitizeItems) modifiers;

  @field("modifier_type") modifier_type;

  @field("is_variable_price") is_variable_price;
}
