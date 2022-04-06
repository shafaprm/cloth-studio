const Joi = require("joi");
const sanitizeHtml = require('sanitize-html');

const itemSchema = Joi.object({
  product: Joi.string().lowercase().required(),
  name: Joi.string().lowercase().required(),
  color: Joi.string().lowercase().required(),
});
