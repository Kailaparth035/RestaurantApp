/* eslint-disable no-else-return */
import { getMenuItems } from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncMenuItems = async (client, eventId, database) => {
  const menuItems = database.collections.get("menuItems");
  try {
    let res = await client.query({
      query: getMenuItems,
      variables: {
        eventId,
      },
    });

    if (res.data.items.length > 0) {
      try {
        await database.write(async () => {
          let localMenuItems = await database.collections.get("menuItems").query().fetch();
          const deleteAllLocalMenuItems = localMenuItems.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalMenuItems);
        });
      } catch (error) {
        console.log("delete local menuItems tabale error :: ", error);
      }
      const batchActions = [];
      const menuItemsInsert = res.data.items.map(async (item) => {
        batchActions.push(
          menuItems.prepareCreate((record) => {
            record._raw.id = item.id.toString();
            record.menu_item_id = item.id;
            record.name = item.name;
            record.is_active = item.is_active;
            record.created_at = item.created_at;
            record.updated_at = item.updated_at;
            record.price = item.price;
            record.image = item.image;
            record.short_name = item?.short_name;
            record.unique_id = item.unique_id;
            record.description = item.description;
            record.redeemable_token_id = item.redeemable_token_id;
            record.redeemable_token_name = item.redeemable_token_name;
            record.token_price = item.token_price;
            record.tax_percentage = item.tax_percentage;
            record.tax = item.tax;
            record.upc = item.upc;
            record.is_favorite = item.is_favorite || false;
            record.modifiers = item.modifiers;
            record.modifier_type = item.modifier_type;
            record.is_variable_price = item.is_variable_price;            
          })
        );
        return true;
      });
      await Promise.all(menuItemsInsert);
      try {
        await database.write(async () => {
          try {
            await database.batch(batchActions);
            console.log("@@===Menu Item Done=========")
            await setCachedItem(KEY_NAME.MENU_ITEMS_SYNC, 'true');
          } catch (error) {
            console.log({ error });
          }
        });
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (e) {
    console.log("sync menuItems error", e);
    return e;
  }
};
