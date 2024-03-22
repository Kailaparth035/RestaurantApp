const Joi = require("joi");

const discountFields = Joi.object({
  name: Joi.string().required(),
  discount_type: Joi.string().required(),
  description: Joi.string(),
  code: Joi.string().required(),
  amount: Joi.number().integer(),
  percentage: Joi.number().integer(),
  applied_discount: Joi.number().allow(null, 0)
})
  .oxor("amount", "percentage")
  .required();

export const orderCashSchema = Joi.object({
  status: Joi.string().valid("processed", "pending").required(),

  items: Joi.array().required(),

  reference_id: Joi.string().required(),

  subtotal: Joi.number().integer().required(),

  tax: Joi.number().integer().required(),

  tip: Joi.number().integer().required(),

  device_id: Joi.number().integer().allow(null, ""),

  user_id: Joi.number().integer().required(),

  transaction_at: Joi.date().required(),

  transaction_time: Joi.date().required(),

  payments: Joi.object({
    status: Joi.string().required(),
    payment_data: Joi.object().required(),
    amount: Joi.number().integer().required(),
    payment_type: Joi.string().valid("cash").required(),
    reference_id: Joi.string().required(),
  }).required(),

  discount: Joi.array().items(discountFields).allow(null),

  location_id: Joi.number().integer().required(),

  event_id: Joi.number().integer().required(),

  attendee_id: Joi.number().integer().allow(null),

  phone_number: Joi.string().allow(null, ""),

  device_app_id: Joi.string(),
  vendor_id: Joi.number().allow(null),
  menu_id: Joi.number().allow(null)
});
