import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export default class Syncs extends Model {
  static table = "syncs";

  @field("endpoint") endpoint;
  
  @field("createdAt") createdAt;

  @readonly @date("created_at") createdAt;

  @readonly @date("updated_at") updatedAt;
}
