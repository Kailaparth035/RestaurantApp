import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export default class Users extends Model {
  static table = "users";

  @field("user_id") userId;

  @field("validation_code") validationCode;

  @field("password_hash") passwordHash;

  @date("created_at") createdAt;

  @date("updated_at") updatedAt;

  @field("phone_number") phoneNumber;

  @field("validation_time") validationTime;

  @field("status") status;

  @field("vendor_id") vendorId;

  @field("username") username;

  @field("email") email;

  @field("role_id") roleId;

  @field("organisation_id") organisationId;

  @field("tablet_access_code") tabletAccessCode;

  @field("event_id") eventId;
}
