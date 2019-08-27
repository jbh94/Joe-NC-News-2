const usersRouter = require('express').Router();
const { sendOneUser } = require('../controllers/users-controller');
const { methodNotFound } = require('../errors');

usersRouter
  .route('/:username')
  .get(sendOneUser)
  .all(methodNotFound);

module.exports = usersRouter;
