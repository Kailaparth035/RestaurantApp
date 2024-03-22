/* eslint-disable no-warning-comments */
/* eslint-disable spaced-comment */
/* eslint-disable line-comment-position */
/* eslint-disable no-shadow */
/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable no-var */
/* eslint-disable prefer-template */
/* eslint-disable prefer-const */

import { WriteLog } from "../../src/CommonLogFile";

export const tax = 0;

export const formatNumber = (number) => {
  // FIXME: /100.toFixed(2) elsewhere
  let updatedNumber = (number / 100).toFixed(2);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(updatedNumber);
};

export const displayForLocale = (number) => {
  // console.log("displayForLocale called with number ", number);
  if (!number || typeof number !== "number") {
    return "$0.00";
  } else {
    let updatedNumber = formatCentsForUiDisplay(number);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(updatedNumber);
  }
};

export const getDiscountTotal = ({ discounts, subtotal }) => {
  let discountTotal = 0;
  (discounts || []).forEach((discount) => {
    if (discount.hasOwnProperty("applied_discount")) {
      discountTotal += discount.applied_discount;
    } else if (discount?.percentage > 0) {
      discountTotal += (subtotal - discountTotal) * discount.percentage;
    } else if (discount.amount > 0) {
      discountTotal += discount.amount;
    }
  });
  return discountTotal;
};

export const getOrderTotal = ({
  subtotal = 0,
  tip = 0,
  tax = 0,
  discount = [],
  items,
  payment_method,
  digital_surcharge_amount = 0,
  ...order
}) => {
  const discountTotal = getDiscountTotal({ discounts: discount, subtotal });
  let surchargeAmount = 0;
  if (payment_method !== "cash" && items[0]) {
    surchargeAmount =
      items[0].hasOwnProperty("surchargeAmount") &&
      !isNaN(items[0].surchargeAmount)
        ? items[0].surchargeAmount
        : digital_surcharge_amount;
  }
  return subtotal + tip + tax + surchargeAmount - discountTotal;
};

export const getTaxAmount = (subtotal) => {
  return formatNumber(subtotal * tax);
};

export const getDiscountTaxAmountForUi = (discount, subtotal, type) => {
  if (type === "percentage") {
    const newSubtotal = getDiscountSubtotal(discount, subtotal);
    return formatNumber(newSubtotal * tax);
  } else {
    const newSubtotal = subtotal - discount;
    return formatNumber(newSubtotal * tax);
  }
};

export const getDiscountValue = (subtotal, percentage) => {
  // FIXME: if we divide by 100 we can get decimal numbers. problematic
  const result = ((percentage / 100) * subtotal).toFixed(0); //returns (30/100 = 0.30) * 45 = 13.5
  return result;
};

export const getSubtotalMinusDollarDiscount = (discount, subtotal) => {
  const newSubtotal = subtotal - discount; // $5 or subtotal 2000 - discount 500
  return formatNumber(newSubtotal);
};

export const getTaxAmountForOrderService = (totalCents) => {
  let tax = 0;
  return Number(Math.round(tax * totalCents));
};

export const formatCentsForUiDisplay = (cents) => {
  return (cents / 100).toFixed(2);
};

export const formatForCashCalculator = (subtotal) => {
  let totalTaxes = subtotal * tax;
  return ((subtotal + totalTaxes) / 100).toFixed(2);
};

export const getChange = (tenderedAmount, total, tip) => {
  return tenderedAmount - formatForCashCalculator(total) - tip / 100;
};

export const formatToPPSpayment = (totalInCents) => {
  let totalInCentsWithTax = totalInCents + totalInCents * tax;
  let totalCentsWithTip = totalInCentsWithTax;
  let result = (totalCentsWithTip / 100).toFixed(2);
  // WriteLog("calc formatToPPSpayment " + result);
  // console.log("formatToPPSpayment ", result);
  return result;
};

export const formatToOrderService = (totalInCents, tipInCents = 0) => {
  let tax = 0;
  let totalInCentsWithTax = totalInCents + totalInCents * tax;
  let totalCentsWithTip = Math.floor(totalInCentsWithTax) + tipInCents;
  return Number(totalCentsWithTip.toFixed(0));
};

export const getTotal = (subtotal) => {
  let taxAmount = subtotal * tax;
  return formatNumber(subtotal + taxAmount);
};

export const getDiscountSubtotal = (discount, subtotal) => {
  const discountValue = getDiscountValue(subtotal, discount);
  return subtotal - discountValue;
};

export const getWithDiscountTotal = (discount, subtotal, type) => {
  if (type === "percentage") {
    const newSubtotal = getDiscountSubtotal(discount, subtotal);
    const taxAmount = newSubtotal * tax;
    return formatNumber(newSubtotal + taxAmount);
  } else {
    const newSubtotal = subtotal - discount;
    const taxAmount = newSubtotal * tax;
    return formatNumber(newSubtotal + taxAmount);
  }
};

export const getTotalWithAppliedDiscountAndSurcharge = (
  discount,
  subtotal,
  discountType,
  surchargeValue,
  tip
) => {
  WriteLog(
    "calc getTotalWithAppliedDiscountAndSurcharge called with " +
      discount +
      subtotal +
      discountType +
      surchargeValue +
      tip
  );
  console.log("getTotalWithAppliedDiscountAndSurcharge called with ", {
    discount,
    subtotal,
    discountType,
    surchargeValue,
    tip,
  });
  const discountedSubtotal = getSubtotalAfterDiscount(
    discount,
    subtotal,
    discountType
  );
  // console.log(
  //   "discountedSubtotal inside gettotalwithdiscount and called with: ",
  //   { discountedSubtotal, subtotal, discountType }
  // );
  const surchargeAmount = getSurchargeAmountLineTipCalculator(
    discountedSubtotal,
    surchargeValue,
    tip
  );

  // console.log("surchargeAmount inside gettotalwithdiscount and called with: ", {
  //   discountedSubtotal,
  //   surchargeValue,
  //   tip,
  // });

  return discountedSubtotal + surchargeAmount;
};

export const getSurchargeAmountForDiscountedOrder = (
  discount,
  subtotal,
  discountType,
  surchargeValue,
  tip
) => {
  // console.log("getSurchargeAmountForDiscountedOrder called with ", {
  //   subtotal,
  //   discount,
  //   tip,
  // });
  const discountedSubtotal = getSubtotalAfterDiscount(
    discount,
    subtotal,
    discountType
  );
  const surchargeAmount = getSurchargeAmountLineTipCalculator(
    discountedSubtotal,
    surchargeValue,
    tip
  );
  // console.log("surchargeAmount discounted called with: ", {
  //   discountedSubtotal,
  //   surchargeValue,
  //   tip,
  // });
  // console.log("surchargeAmount of discounted result is: ", { surchargeAmount });
  return surchargeAmount;
};

export const getSurchargeAmountForDiscountedOrderLineTip = (
  discount,
  subtotal,
  discountType,
  surchargeValue,
  tip
) => {
  const discountedSubtotal = getSubtotalAfterDiscount(
    discount,
    subtotal,
    discountType
  );
  const surchargeAmount = getSurchargeAmountLineTipCalculator(
    discountedSubtotal,
    surchargeValue,
    tip
  );
  // console.log("surchargeamount discounted called with: ", {
  //   discountedSubtotal,
  //   surchargeValue,
  //   tip,
  // });
  return surchargeAmount;
};

export const getSurchargeAmount = (subtotal, surchargeValue, tip) => {
  const tip2 = parseInt(parseFloat(tip) * 100, 10);
  const surchargeAmount = Math.round(
    (subtotal + tip2) * (surchargeValue / 100)
  );
  return surchargeAmount;
};

export const getSurchargeAmountLineTipCalculator = (
  subtotal,
  surchargeValue,
  tip
) => {
  const surchargeAmount = Math.round((subtotal + tip) * (surchargeValue / 100));
  return surchargeAmount;
};

export const dollarStringToCentsNumber = (subtotal, surchargeValue, tip) => {
  const surchargeAmount = Math.round((subtotal + tip) * (surchargeValue / 100));
  return surchargeAmount;

  //TODO: this for showing the correct service fee in the tip calculator virew
};

export const getSurchargeAmountBack = (subtotal, surchargeValue, tip) => {
  const surchargeAmount = Math.round((subtotal + tip) * (surchargeValue / 100));
  return surchargeAmount;
};

export const getTotalWithSurcharge = (subtotal, surchargeValue, tip) => {
  const result = subtotal + getSurchargeAmount(subtotal, surchargeValue, tip);
  // console.log("getTotalWithSurcharge called with ", {
  //   subtotal,
  //   surchargeValue,
  //   tip,
  // });
  return result;
};

export const getSubtotalAfterDiscount = (discount, subtotal, type) => {
  if (type === "percentage") {
    return getDiscountSubtotal(discount, subtotal);
  } else {
    return subtotal - discount;
  }
};

function dateComponentPad(value) {
  var format = String(value);

  return format.length < 2 ? "0" + format : format;
}

export function formatDate(date) {
  var datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(
    dateComponentPad
  );
  var timePart = [date.getHours(), date.getMinutes(), date.getSeconds()].map(
    dateComponentPad
  );

  return datePart.join("-") + " " + timePart.join(":");
}

export function displayCurrencyToCentsInteger(displayCurrency) {
  // console.log("displayCurrencyToCentsInteger called with: ", displayCurrency);
  const result = parseInt(
    displayCurrency.replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ""),
    10
  );
  return result;
}

export const totalWithTip = (
  isDiscounted,
  discount,
  subtotal,
  discountType,
  tip,
  surchargeValue
) => {
  // console.log("surchargeValue", surchargeValue);
  if (isDiscounted && surchargeValue) {
    const total = getTotalWithAppliedDiscountAndSurcharge(
      discount,
      subtotal,
      discountType,
      surchargeValue,
      tip
    );
    // console.log("totalWithTip called with", { subtotal, tip });
    return formatCentsForUiDisplay(total + tip);
  }
  if (isDiscounted) {
    const discountedSubtotal = getSubtotalAfterDiscount(
      discount,
      subtotal,
      discountType
    );
    return formatCentsForUiDisplay(discountedSubtotal + tip);
  }
  if (surchargeValue) {
    const total = getTotalWithSurcharge(subtotal, surchargeValue, tip);
    return formatCentsForUiDisplay(total + tip);
  }
  return formatCentsForUiDisplay(subtotal + tip);
};

export const totalWithTipNoSurcharge = (
  isDiscounted,
  discount,
  subtotal,
  discountType,
  tip
) => {
  if (isDiscounted) {
    const discountedSubtotal = getSubtotalAfterDiscount(
      discount,
      subtotal,
      discountType
    );
    return formatCentsForUiDisplay(discountedSubtotal + tip);
  }
  return formatCentsForUiDisplay(subtotal + tip);
};
