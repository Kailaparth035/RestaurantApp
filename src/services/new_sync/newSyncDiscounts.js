import { getDiscountsQuery } from "../../fragments/resolvers";
import { setCachedItem } from "../../helpers/storeData";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncDiscounts = async (client, organizationId, database) => {
    const discounts = database.collections.get("discounts");
    try {
        let res = await client.query({
            query: getDiscountsQuery,
            variables: {
                organizationId,
            },
        });
        if (res.data.discount.length > 0) {
            try {
                await database.write(async () => {
                    let discountsResponse = await database.collections.get("discounts").query().fetch();
                    const deletedDiscount = discountsResponse.map((comment) =>
                        comment.prepareDestroyPermanently()
                    );
                    database.batch(deletedDiscount);
                });
            } catch (error) {
                console.log("delet disount tabale error :: ", error);
            }
  
            const batchActions = [];
            const discountsInsert = res.data.discount.map(async (discount) => {
                batchActions.push(
                    discounts.prepareCreate((record) => {
                        record._raw.id = discount.id.toString();
                        record.amount = discount.amount;
                        record.code = discount.code;
                        record.name = discount.name;
                        record.description = discount.description;
                        record.discountType = discount.discount_type;
                        record.percentage = discount.percentage;
                    })
                );
                return true;
            });
            await Promise.all(discountsInsert);
            try {
                await database.write(async () => {
                    try {
                        await database.batch(batchActions);
                        await setCachedItem(KEY_NAME.DISCOUNTS_SYNC, 'true');
                        console.log("@@===Discount Done ===")

                    } catch (error) {
                        console.log({ error });
                    }
                });
            } catch (error) {
                console.log({ error });
            }
        }
    } catch (e) {
        console.log("sync Discounts error", e);
        return e;
    }
}
