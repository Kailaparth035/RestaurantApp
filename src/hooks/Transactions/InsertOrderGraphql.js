/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation } from "@apollo/client";
import { PUSH_ORDER } from "../../fragments/resolvers";
import { WriteLog } from "../../../src/CommonLogFile";

export const [AddOrder] = useMutation(PUSH_ORDER, {
  onError: (err) => {
    WriteLog("InsertOrderGraphql " + err);
    console.log(err);
    throw new Error(err);
  },
  onCompleted: (data) => {
    WriteLog("InsertOrderGraphql Nothing wrong");
    console.log({ message: "Nothing wrong", status: "approved" });
  },
});
