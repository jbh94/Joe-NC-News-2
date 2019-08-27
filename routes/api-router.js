const apiRouter = require('express').Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const { methodNotFound } = require('../errors');

apiRouter
  .get('/', (req, res, next) => {
    res.status(200).send({ msg: 'You have reached the API router!' });
  })
  .all(methodNotFound);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);

module.exports = apiRouter;
