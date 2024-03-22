/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */

import PropTypes from "prop-types";
import { Q } from "@nozbe/watermelondb";
import moment from "moment";
import React, { useState, useContext, useMemo } from "react";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { calcOrderTotals } from "../services/utilitiesSync/updateRfidAsset";
import { useTrackedState } from "./CartContext";
import { DiscountContext } from "./DiscountContext";
import { useAuth } from "./AuthContext";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import { APPCENTER_BUILD_ID } from "@env";
import { WriteLog } from "../../src/CommonLogFile";

export const TransactionContext = React.createContext();

const flattenCartItems = (items) => {
  const deepCopy = JSON.parse(JSON.stringify(items));

  deepCopy.forEach((obj, index, array) => {
    if (obj.quantity >= 2) {
      for (let i = obj.quantity; i >= 2; i -= 1) {
        array.push(obj);
      }
    }
    delete obj.quantity;
    delete obj.__typename;
  });
  return deepCopy;
};

const initialOrderTotalState = {
  subtotal_after_tokens: 0,
  total_discount: 0,
  applied_discounts: [],
  subtotal_after_discount: 0,
  total_tax: 0,
  tip: 0,
  subtotal_with_tax_and_tip: 0,
  surcharge_before_cash_applied: 0,
  surchargeAmount: 0,
  final_total: 0,
  total: 0,
  total_paid: 0,
  tokens_redeemed: {},
  tokens_redeemed_price: 0,
  updated_tokens_balance: {},
  cash_balance: 0,
  promo_balance: 0,
  cashBalanceCharged: 0,
  promoBalanceCharged: 0,
};

function TransactionContextProvider({ children }) {
  const { selectedDiscounts, resetSelectedDiscounts } =
    useContext(DiscountContext);
  const {
    syncService,
    employeeUser,
    paymentTypeState,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
    deviceId,
  } = useAuth();
  const [tenderedAmount, setTenderedAmount] = useState(0);
  const [tip, setTip] = useState(0);
  const [methodOfPayment, setMethodOfPayment] = useState("");
  const [creditApproval, setCreditApproval] = useState(false);
  const [title, setTitle] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [transaction, setTransaction] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState();
  const [receiptToBeSent, setReceiptToBeSent] = useState(false);
  const [totalWithTip, setTotalWithTip] = useState(0);
  const [totalCharge, setTotalCharge] = useState(0);
  const [uid, setUid] = useState(null);
  const [rfid_last_four_phone_numbers, setRfid_last_four_phone_numbers] =
    useState();
  const [digitalSurchargeAmount, setDigitalSurchargeAmount] = useState(0);
  const [tokens_balance, setTokensBalance] = useState({});
  const cartState = useTrackedState();
  const { cartItems, total } = cartState;
  const db = useDatabase();
  const [orderTotals, setOrderTotals] = useState(initialOrderTotalState);

  const updateOrderTotals = async ({ rfid_asset = {}, payment_type } = {}) => {
    const items = flattenCartItems(cartItems);
    const { tokens_balance } = rfid_asset;
    const calculatedOrderTotal = calcOrderTotals({
      items,
      tokens_balance,
      rfid_asset,
      discount: selectedDiscounts,
      digital_surcharge_percentage:
        payment_type === "cash"
          ? 0
          : selectedLocation.digital_surcharge_percentage,
      tip,
      taxType: selectedMenu.tax_type,
      is_cash_not_taxed: selectedMenu?.is_cash_not_taxed,
      payment_type: paymentTypeState,
    });
    setOrderTotals(calculatedOrderTotal);
    return { ...calculatedOrderTotal, discount: selectedDiscounts };
  };

  React.useEffect(() => {
    if (selectedMenu?.id) {
      updateOrderTotals();
    }

    if (total == 0 && cartItems?.length < 1 && selectedDiscounts?.length > 0) {
      resetSelectedDiscounts();
    }
  }, [selectedDiscounts, tip, total]);

  const createOrder = async ({
    deferred,
    methodOfPayment: paymentMethod,
    referenceId,
    transactionData,
    offlineMode
  }) => {
    const dateTime = moment(
      new Date().toUTCString(),
      "DD MMM YYYY HH:mm:ss"
    ).format("YYYY-MM-DDTHH:mm:ss");

    const transaction_time = dateTime;

    const transaction_at = dateTime;

    const randomReferenceId = referenceId || nanoid(16);

    const surchargeValue = selectedLocation?.digital_surcharge_percentage;
    const surchargeLabel = selectedEvent?.digital_surcharge_label;
    const {
      subtotal_after_tokens,
      total_discount,
      subtotal_after_discount,
      total_tax,
      subtotal_with_tax_and_tip,
      surchargeAmount,
      final_total,
      total_paid,
      tokens_redeemed,
      tokens_redeemed_price,
      updated_tokens_balance,
      cash_balance,
      promo_balance,
      cashBalanceCharged,
      promoBalanceCharged,
      updated_items,
      applied_discounts,
      ...stuff
    } = await updateOrderTotals({ payment_type: paymentMethod });
    const paymentFields = {
      payment_data: transactionData ? transactionData : {},
      payment_type: paymentMethod,
      reference_id: randomReferenceId,
      status: "pending",
    };
    // console.log({employeeUser})
    const orderServiceInputCard = {
      status: "processed",
      items: updated_items,
      reference_id: randomReferenceId,
      // subtotal: subtotal_after_tokens,
      subtotal: total,
      tax: total_tax,
      tip,
      transaction_at,
      transaction_time,
      user_id: parseInt(employeeUser.user_id, 10),
      // payments: paymentFields,
      location_id: selectedLocation?.location_id,
      event_id: selectedLocation?.event_id,
      device_id: parseInt(APPCENTER_BUILD_ID),
      device_app_id: deviceId,
      vendor_id: Number(selectedLocation.vendor_id) || null,
      menu_id: Number(selectedMenu.id),
    };

    if (paymentMethod === "credit") {
      paymentFields.amount = total_paid;
      orderServiceInputCard.digital_surcharge = surchargeAmount;
      orderServiceInputCard.mx_ref_id =
        transactionData?.gatewayResponse?.rawResponse?.reference;
      if (transactionData?.currentStatus) {
        paymentFields.status = transactionData?.currentStatus?.toLowerCase();
      }
      if (deferred) {
        paymentFields.payment_data = {
          ...paymentFields.payment_data,
          deferred: true,
        };
      }
      orderServiceInputCard.payments = paymentFields;
    }

    if (paymentMethod === "cash") {
      paymentFields.amount = subtotal_with_tax_and_tip;
      paymentFields.status = "approved";
      orderServiceInputCard.payments = paymentFields;
      orderServiceInputCard.tax = selectedMenu?.is_cash_not_taxed
        ? 0
        : total_tax;
    }

    if (applied_discounts?.length > 0) {
      orderServiceInputCard.discount = applied_discounts;
    }

    if (customerPhoneNumber && receiptToBeSent) {
      orderServiceInputCard.phone_number = customerPhoneNumber;
    }

    const organizationId = employeeUser.organization_id;

    const extraPayloadData = {
      digital_surcharge_percentage: surchargeValue,
      digital_surcharge_label: surchargeLabel,
    };
    WriteLog(
      "TransactionContext create order" +
        { orderServiceInputCard: orderServiceInputCard }
    );
    console.log("create order", orderServiceInputCard);
    try {
      await syncService.newOrderPush(
        orderServiceInputCard,
        extraPayloadData,
        paymentMethod,
        offlineMode
      );
      return { success: false };
    } catch (error) {
      WriteLog("TransactionContext error" + { error: error });
      console.log(error);
      return { error };
    }
  };

  const updateOrderWithPhoneNumber = async ({ ref_id, phone_number }) => {
    const referencedOrder = await db.collections
      .get("orders")
      .query(Q.where("reference_id", ref_id))
      .fetch();
    if (referencedOrder[0]) {
      await db.write(async () => {
        await referencedOrder[0].update((order) => {
          order.phone_number = phone_number;
          return order;
        });
      });
    }
  };

  const clearTransaction = () => {
    setOrderTotals(initialOrderTotalState);
    setTransaction({});
    setTenderedAmount(0);
    setTip(0);
    setUid("");
    setDigitalSurchargeAmount(0);
  };
  const value = useMemo(
    () => ({
      tenderedAmount,
      setTenderedAmount,
      tip,
      setTip,
      methodOfPayment,
      setMethodOfPayment,
      creditApproval,
      setCreditApproval,
      title,
      setTitle,
      currentOrderId,
      setCurrentOrderId,
      transaction,
      setTransaction,
      customerPhoneNumber,
      setCustomerPhoneNumber,
      receiptToBeSent,
      setReceiptToBeSent,
      totalWithTip,
      setTotalWithTip,
      totalCharge,
      setTotalCharge,
      uid,
      setUid,
      rfid_last_four_phone_numbers,
      setRfid_last_four_phone_numbers,
      digitalSurchargeAmount,
      setDigitalSurchargeAmount,
      tokens_balance,
      setTokensBalance,
      orderTotals,
      updateOrderTotals,
      createOrder,
      updateOrderWithPhoneNumber,
      clearTransaction,
    }),
    [
      tenderedAmount,
      setTenderedAmount,
      tip,
      setTip,
      methodOfPayment,
      setMethodOfPayment,
      creditApproval,
      setCreditApproval,
      title,
      setTitle,
      currentOrderId,
      setCurrentOrderId,
      transaction,
      setTransaction,
      customerPhoneNumber,
      setCustomerPhoneNumber,
      receiptToBeSent,
      setReceiptToBeSent,
      totalWithTip,
      setTotalWithTip,
      totalCharge,
      setTotalCharge,
      uid,
      setUid,
      rfid_last_four_phone_numbers,
      setRfid_last_four_phone_numbers,
      digitalSurchargeAmount,
      setDigitalSurchargeAmount,
      tokens_balance,
      setTokensBalance,
      orderTotals,
      updateOrderTotals,
      createOrder,
      updateOrderWithPhoneNumber,
      clearTransaction,
    ]
  );
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

TransactionContextProvider.propTypes = {
  children: PropTypes.element,
};
export const useTransactionContext = () => React.useContext(TransactionContext);

export default TransactionContextProvider;
