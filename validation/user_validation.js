const baseJoi = require("joi");
const ExpressError = require("../utility/express_error.js");
const sanitizeHtml = require('sanitize-html');

const extension = (Joi) => ({
  type : 'string',
  base : baseJoi.string(),
  messages : {
    'string.escapeHTML' : '{{#label}} must not included HTML',
  },
  rules : {
    escapeHTML : {
      validate(value, helper){
        const clean = sanitizeHTML(value, {
          allowedTags : [],
          allowedAttributes : {},
        })
        if(clean !== value){ return helpers.error('string.escapeHTML', {value})};
        return clean;
      }
    }
  }
})

const Joi = baseJoi.extend(extension);

const userSchema = Joi.object({
  username: Joi.string().lowercase().required(),
  password: Joi.string(),
  passwordConfirmation: Joi.any().valid(Joi.ref("password")),
  emailAddress: Joi.string().lowercase().required(),
  phoneNumber: Joi.string().required(),
  homeAddress: Joi.string().required(),
  province : Joi.string().required().lowercase(),
  district : Joi.string().required().lowercase(),
  city : Joi.string().required().lowercase(),
  zipCode : Joi.string().required(),
});

const userValidation = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const message = error.details.map((element) => element.message).join(",");
    throw new ExpressError(message);
  }
  next();
};

module.exports = userValidation;
