const Joi = require("joi");

const discountFields = Joi.object({
  name: Joi.string().required(),
  discount_type: Joi.string().required(),
  description: Joi.string(),
  code: Joi.string().required(),
  amount: Joi.number().integer(),
  percentage: Joi.number().integer(),
  applied_discount: Joi.number().allow(0)
})
  .oxor("amount", "percentage")
  .required();

export const orderRfidSchema = Joi.object({
  /**
   * @Status is required if the value is processed it's because the service is online, and pending when it was previously offline.
   */
  status: Joi.string().valid("processed", "pending").required(),

  items: Joi.array().required(),

  reference_id: Joi.string().required(),

  subtotal: Joi.number().integer().required(),

  tax: Joi.number().integer().required(),

  tip: Joi.number().integer().required(),

  transaction_at: Joi.string().required(),

  transaction_time: Joi.string().required(),

  discount: Joi.array().items(discountFields).allow(null),

  location_id: Joi.number().integer().required(),

  event_id: Joi.number().integer().required(),

  user_id: Joi.number().integer().required(),

  uid: Joi.string().required(),

  phone_number: Joi.string().allow(null, ""),

  device_id: Joi.number().integer().allow(null, ""),

  device_app_id: Joi.string(),

  digital_surcharge: Joi.number().integer(),

  digital_surcharge_percentage: Joi.number(),

  tokens_redeemed: Joi.object().allow(null),
  vendor_id: Joi.number().allow(null),
  menu_id: Joi.number().allow(null)
});
