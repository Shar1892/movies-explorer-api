const Movie = require('../models/movie');

const BadRequestErr = require('../errors/BadRequestErr');
const NotOwnerErr = require('../errors/NotOwnerErr');
const NotFoundErr = require('../errors/NotFoundErr');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch(() => {
      throw new BadRequestErr('Переданы некорректные данные.');
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie) {
        if (movie.owner.toString() === req.user._id) {
          Movie.findByIdAndRemove(req.params.movieId)
            .then((dataMovie) => {
              res.status(200).send(dataMovie);
            });
        } else {
          throw new NotOwnerErr('Нельзя удалить чужой фильм.');
        }
      } else {
        throw new NotFoundErr('Фильм не найдена.');
      }
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
