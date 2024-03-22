import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export default class Discounts extends Model {
  static table = "discounts";

  @field("amount") amount;

  @field("code") code;

  @field("description") description;

  @field("discount_type") discountType;

  @field("name") name;

  @field("percentage") percentage;

  @field("discount_id") discountId;

  @readonly @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;
}
