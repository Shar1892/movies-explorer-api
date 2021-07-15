const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getUserInfo, updateUser } = require('../controllers/users');

router.get('/me', getUserInfo);

router.patch('/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      name: Joi.string().required(),
    }),
  }),
  updateUser);

module.exports = router;
