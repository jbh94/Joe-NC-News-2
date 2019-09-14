const apiRouter = require('express').Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const { methodNotFound } = require('../errors');
const json = require('../endpoints.json');

// apiRouter
//   .get('/', (req, res, next) => {
//     res.status(200).send({ msg: 'You have reached the API router!' });
//   })
//   .all(methodNotFound);

apiRouter
  .route('/')
  .get((req, res) => {
    res.status(200).send(json);
  })
  .all(methodNotFound);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
