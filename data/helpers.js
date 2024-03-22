import database from "./database";

const orders = database.collections.get("orders");

export const observeOrders = () => orders.query().observe();
export const saveOrder = async ({ id, items }) => {
  await database.write(async () => {
    await orders.create((entry) => {
      entry.id = id;
      entry.items = items;
    });
  });
};
