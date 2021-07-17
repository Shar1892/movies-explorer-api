const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const auth = require('../middlewares/auth');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const NotFoundErr = require('../errors/NotFoundErr');

router.post('/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser);

router.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login);

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use('/', () => {
  throw new NotFoundErr('Запрашиваемая страница не найдена.');
});

module.exports = router;
