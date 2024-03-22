/* eslint-disable no-else-return */
import { getMenusQuery } from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncMenus = async (client, eventId, database) => {
  const menus = database.collections.get("menus");
  try {
    let res = await client.query({
      query: getMenusQuery,
      variables: {
        eventId,
      },
    });

    if (res.data.menus.length > 0) {
      try {
        await database.write(async () => {
          let localMenus = await database.collections.get("menus").query().fetch();
          const deleteAllLocalMenus = localMenus.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalMenus);
        });
      } catch (error) {
        console.log("delete local menus tabale error :: ", error);
      }
      const batchActions = [];
      const menusInsert = res.data.menus.map(async (menu) => {
        batchActions.push(
          menus.prepareCreate((record) => {
            record._raw.id = menu.id.toString();
            record.menuId = menu.id;
            record.eventId = menu.event_id;
            record.name = menu.name;
            record.isActive = menu.is_active;
            record.items = menu.menu_items;
            record.locationMenus = menu?.location_menus;
            record.location_id = menu?.locations_menus && menu?.locations_menus[0]?.location_id;
            record.tax_type = menu.tax_type;
            record.is_cash = menu.is_cash;
            record.is_credit = menu.is_credit;
            record.is_rfid = menu.is_rfid;
            record.is_qr = menu.is_qr;
            record.is_tips = menu.is_tips;
            record.tip_percentage_1 = menu.tip_percentage_1;
            record.tip_percentage_2 = menu.tip_percentage_2;
            record.tip_percentage_3 = menu.tip_percentage_3;
            record.is_custom_item = menu.is_custom_item;
            record.category = menu.category;
            record.is_discount = menu.is_discount;
            record.is_discount_protected = menu.is_discount_protected;
            record.is_cash_not_taxed = menu.is_cash_not_taxed;
          })
        );
        return true;
      });
      await Promise.all(menusInsert);
      try {
        await database.write(async () => {
          try {
            await database.batch(batchActions);
            console.log("@@===Menu Done=========")
            await setCachedItem(KEY_NAME.MENUS_SYNC, 'true');
          } catch (error) {
            console.log({ error });
          }
        });
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (e) {
    console.log("sync menus error", e);
    return e;
  }
};
