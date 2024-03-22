/**
 *
 * @param {eventId} eventId string
 * @param {uid} uid string
 * @return the card_on_files data
 */

import { getRfidLocal } from "../../screens/RfidScreens/utils";
import { WriteLog } from "../../../src/CommonLogFile";

const getDiscount = (discount, subtotal) => {
  if (!discount) {
    return 0;
  } else if (discount.percentage > 0) {
    return (discount.percentage / 100) * subtotal;
  } else if (discount?.amount > 0) {
    return discount.amount;
  }
  return 0;
};

const calcSubtotalWithTokensRedeemed = ({ items, tokens_balance = {} }) => {
  let current_tokens_balance = { ...tokens_balance };
  WriteLog(
    "calcSubtotalWithTokensRedeemed current_tokens_balance:::" +
      current_tokens_balance
  );
  // console.log("current_tokens_balance:::", current_tokens_balance);
  let newTotal = 0;
  let tokens_redeemed_price = 0;
  const tokens_redeemed = {};

  const calculateModifierPrice = (modifiers) => {
    let modifierPrice = 0;
    if (modifiers.modifier_type !== "") {
      if (modifiers?.modifiers_update?.length > 0) {
        modifiers?.modifiers_update.map((mapItem) => {
          modifierPrice = modifierPrice + mapItem?.additional_price;
        });
      }
    }
    return modifierPrice;
  };

  const items_with_tokens_redeemed = items.map((item) => {
    // console.log("item :::", item);
    newTotal += item.price + calculateModifierPrice(item);
    // console.log("newTotal :::", newTotal);
    if (item.redeemable_token_id) {
      const redeemableToken = current_tokens_balance[item.redeemable_token_id];
      // console.log("redeemableToken:::", redeemableToken);
      if (redeemableToken) {
        // console.log("item.token_price:::", item.token_price);
        if (redeemableToken.balance >= item.token_price) {
          current_tokens_balance = {
            ...current_tokens_balance,
            [item.redeemable_token_id]: {
              ...redeemableToken,
              balance: redeemableToken.balance - item.token_price,
            },
          };

          tokens_redeemed[item.redeemable_token_id] = {
            redeemable_token_id: item.redeemable_token_id,
            quantity:
              tokens_redeemed[item.redeemable_token_id] &&
              tokens_redeemed[item.redeemable_token_id].quantity
                ? tokens_redeemed[item.redeemable_token_id].quantity +
                  item.token_price
                : item.token_price,
          };

          newTotal -= item.price;
          tokens_redeemed_price += item.price;
          return {
            ...item,
            redeemed_token_id: item.redeemable_token_id,
          };
        }
      }
    }
    return item;
  });
  // console.log("tokens_redeemed :::", tokens_redeemed);
  // console.log("tokens_redeemed_price :::", tokens_redeemed_price);
  return {
    newTotal,
    tokens_redeemed,
    tokens_redeemed_price,
    updated_tokens_balance: current_tokens_balance,
    items_with_tokens_redeemed,
  };
};

export const calcOrderTotals = ({
  items,
  tokens_balance,
  rfid_asset,
  discount,
  digital_surcharge_percentage,
  tip,
  taxType,
  is_cash_not_taxed,
  payment_type,
}) => {
  const {
    newTotal: subtotalAfterTokensApplied,
    tokens_redeemed = null,
    tokens_redeemed_price = 0,
    updated_tokens_balance = null,
    items_with_tokens_redeemed,
  } = calcSubtotalWithTokensRedeemed({
    items,
    tokens_balance: tokens_balance || {},
  });
  let discountTotal = 0;
  const applied_discounts = (discount || [])
    .sort((a, b) => (a?.amount > b?.amount ? a : b))
    .map((x, i) => {
      WriteLog("calcSubtotalWithTokensRedeemed discount" + discount);
      console.log("discount format", discount);
      const appliedDiscount = getDiscount(
        x,
        subtotalAfterTokensApplied - discountTotal
      );
      discountTotal += appliedDiscount;
      return {
        ...x,
        applied_discount: appliedDiscount,
      };
    });
  let discountRemaining = discountTotal;
  let totalTax = 0;

  const updatedItems = items_with_tokens_redeemed.map((item) => {
    const item_total = item.redeemed_token_id ? 0 : item.price;

    const itemPercentageOfSubtotal = item_total / subtotalAfterTokensApplied;
    let itemDiscount = 0;
    if (discountRemaining > 0) {
      itemDiscount = itemPercentageOfSubtotal * discountTotal;
      if (itemDiscount >= discountRemaining) {
        itemDiscount = discountRemaining;
      }
      discountRemaining -= itemDiscount;
    }
    let itemTax;
    if (item_total - itemDiscount > 0) {
      itemTax =
        Math.round(item_total - itemDiscount) * (item.tax_percentage || 0);
    } else {
      itemTax = 0;
    }

    totalTax += itemTax;
    return {
      ...item,
      item_discount_applied: itemDiscount,
      item_tax: itemTax,
    };
  });

  let subtotalAfterDiscount = subtotalAfterTokensApplied - discountTotal;
  if (subtotalAfterDiscount < 0) {
    subtotalAfterDiscount = 0;
  }
  if (is_cash_not_taxed && payment_type === "cash") {
    totalTax = 0;
  }
  const subtotalWithTaxAndTip = Math.round(
    parseInt(subtotalAfterDiscount) + parseInt(tip) + parseInt(totalTax)
  );
  1;

  let totalWithTaxAndTipAfterCashApplied = subtotalWithTaxAndTip;
  let promoBalanceCharged = 0;
  let cashBalanceCharged = 0;

  const promo_balance = rfid_asset?.promo_balance || 0;
  const cash_balance = rfid_asset?.cash_balance || 0;
  if (totalWithTaxAndTipAfterCashApplied > 0 && promo_balance > 0) {
    if (promo_balance >= totalWithTaxAndTipAfterCashApplied) {
      promoBalanceCharged = totalWithTaxAndTipAfterCashApplied;
      totalWithTaxAndTipAfterCashApplied = 0;
    } else {
      totalWithTaxAndTipAfterCashApplied -= promo_balance;
      promoBalanceCharged = promo_balance;
    }
  }

  if (totalWithTaxAndTipAfterCashApplied > 0 && cash_balance > 0) {
    if (cash_balance >= totalWithTaxAndTipAfterCashApplied) {
      cashBalanceCharged = totalWithTaxAndTipAfterCashApplied;
      totalWithTaxAndTipAfterCashApplied = 0;
    } else {
      totalWithTaxAndTipAfterCashApplied -= cash_balance;
      cashBalanceCharged = cash_balance;
    }
  }

  const surcharge_before_cash_applied = Math.round(
    subtotalWithTaxAndTip * (digital_surcharge_percentage / 100)
  );
  const surchargeAmount = Math.round(
    totalWithTaxAndTipAfterCashApplied * (digital_surcharge_percentage / 100)
  );

  const totalAmountToCharge =
    surcharge_before_cash_applied + subtotalWithTaxAndTip;
  const totalAmountToChargeAfterCashApplied =
    surchargeAmount + totalWithTaxAndTipAfterCashApplied;
  return {
    updated_items: updatedItems,
    subtotal_after_tokens: subtotalAfterTokensApplied,
    total_discount: discountTotal,
    applied_discounts,
    subtotal_after_discount: subtotalAfterDiscount,
    total_tax:
      is_cash_not_taxed && payment_type === "cash" ? 0 : Math.round(totalTax),
    tip,
    subtotal_with_tax_and_tip: subtotalWithTaxAndTip,
    surcharge_before_cash_applied,
    surchargeAmount,
    final_total: totalAmountToCharge,
    total: totalAmountToCharge,
    total_paid: totalAmountToChargeAfterCashApplied,
    tokens_redeemed,
    tokens_redeemed_price,
    updated_tokens_balance,
    cash_balance: cash_balance - cashBalanceCharged,
    promo_balance: promo_balance - promoBalanceCharged,
    cashBalanceCharged,
    promoBalanceCharged,
  };
};

export async function updateRfidAsset(
  { uid, items, digital_surcharge_percentage, tip, discount },
  db,
  addSyncLogs = () => {}
) {
  let current_rfid_asset = await getRfidLocal(db, uid);
  // console.log({ current_rfid_asset });
  // addSyncLogs({current_rfid_asset: current_rfid_asset?._raw})
  const {
    tokens_redeemed,
    tokens_redeemed_price,
    updated_tokens_balance,
    cash_balance,
    promo_balance,
    surchargeAmount,
    total,
    total_paid,
    final_total,
    cashBalanceCharged,
    promoBalanceCharged,
    subtotal_after_discount,
    subtotal_with_tax_and_tip,
    total_tax,
    total_discount,
  } = calcOrderTotals({
    items,
    tokens_balance: current_rfid_asset.tokens_balance,
    rfid_asset: current_rfid_asset,
    discount,
    digital_surcharge_percentage,
    tip,
  });
  // console.log({ promo_balance, cash_balance });
  try {
    const batchActions = [
      current_rfid_asset.prepareUpdate((record) => {
        record.cash_balance = cash_balance;
        record.promo_balance = promo_balance;
        record.tokens_balance = updated_tokens_balance;
        record._raw.cash_balance = cash_balance;
        record._raw.promo_balance = promo_balance;
        record._raw.tokens_balance = updated_tokens_balance;
      }),
    ];
    await db.write(async () => {
      try {
        db.batch(batchActions);
        // addSyncLogs(`updateRfid batched`)
        WriteLog("calcSubtotalWithTokensRedeemed updateRfid batched");
        console.log(`updateRfid batched`);
        // addSyncLogs({log: 'rfid asset updated'})
      } catch (error) {
        // addSyncLogs(`updateRfid batched error`)
        // addSyncLogs({log: 'rfid asset error', error})
        WriteLog(
          "calcSubtotalWithTokensRedeemed updateRfid batched error" + error
        );
        console.log(`updateRfid batched error`);
        console.log({ error });
      }
    });
  } catch (error) {
    WriteLog("calcSubtotalWithTokensRedeemed updateRfid batched error" + error);
    console.log({ error });
  }

  const updated_rfid_asset = await getRfidLocal(db, uid);
  // addSyncLogs({updated_rfid_asset: updated_rfid_asset?._raw})
  return {
    tokens_redeemed,
    tokens_redeemed_price,
    tokens_balance: updated_tokens_balance,
    cash_balance,
    promo_balance,
    surchargeAmount,
    digital_surcharge: surchargeAmount,
    total,
    total_paid,
    final_total,
    cashBalanceCharged,
    promoBalanceCharged,
    subtotal_after_discount,
    subtotal_with_tax_and_tip,
    total_tax,
    total_discount,
  };
}
