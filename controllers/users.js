const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/user');

const BadRequestErr = require('../errors/BadRequestErr');
const RepeatEmailErr = require('../errors/RepeatEmailErr');
const NotAuthErr = require('../errors/NotAuthErr');
const NotFoundErr = require('../errors/NotFoundErr');

dotenv.config();

const { NODE_ENV, JWT_SECRET } = process.env;

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        throw new NotFoundErr('Пользователь не найден.');
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;

  if (!email || !name) {
    throw new BadRequestErr('Не указаны данные пользователя.');
  }

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        throw new NotFoundErr('Пользователь не найден.');
      }
    })
    .catch(() => {
      throw new BadRequestErr('Переданы некорректные данные при обновлении.');
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    password, email, name,
  } = req.body;

  if (!email || !password || !name) {
    throw new BadRequestErr('Не указаны данные пользователя.');
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        email, name, password: hash,
      })
        .then((user) => {
          res.status(200).send({
            _id: user._id,
            name: user.name,
            email: user.email,
          });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            throw new RepeatEmailErr('Такой пользователь уже существует.');
          } else if (err.name === 'ValidationError') {
            throw new BadRequestErr('Переданы некорректные данные при создании пользователя.');
          }
        })
        .catch(next);
    });
};

const login = (req, res, next) => {
  const {
    password, email,
  } = req.body;

  if (!email || !password) {
    throw new NotAuthErr('Не указаны данные пользователя.');
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.send({ token });
    })
    .catch((err) => {
      throw new NotAuthErr(err.message);
    })
    .catch(next);
};

module.exports = {
  updateUser,
  getUserInfo,
  createUser,
  login,
};
