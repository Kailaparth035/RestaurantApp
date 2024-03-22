import { logStuckOrders } from "../src/fragments/resolvers";
import { WriteLog } from "../src/CommonLogFile";

const customLogging = async ({ client, input, loggingOn }) => {
  if (!loggingOn) {
    return true;
  }
  try {
    // client, input: {[`orderType_${order.payment_method}`]: order.items} })
    WriteLog({ input });
    console.log({ input });

    const { data } = await client.mutate({
      mutation: logStuckOrders,
      variables: { input: JSON.stringify(input) },
    });
    WriteLog("CustomeLogging" + { data: data });
    console.log({ data });
    return { data: JSON.stringify(data?.log_stuck_orders?.message), error: "" };
  } catch (error) {
    WriteLog("CustomeLogging" + { error: error });
    console.log({ error });
    return { error, data: "" };
  }
};

export default customLogging;
