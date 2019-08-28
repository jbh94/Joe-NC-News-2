exports.methodNotFound = (req, res, next) => {
  res.status(405).send({ msg: 'Method is not found' });
};

exports.SQL400Errors = (err, req, res, next) => {
  const errorCodes = ['42703', '23502F', '22001', '22P02'];
  if (errorCodes.includes(err.code)) {
    res.status(400).send({
      msg: 'Bad request!'
    });
  } else next(err);
};

exports.SQL422Errors = (err, req, res, next) => {
  const errorCodes = ['23503'];
  if (errorCodes.includes(err.code)) {
    res.status(422).send({
      msg: 'Unprocessable entity!'
    });
  } else next(err);
};

// exports.SQLNullError = (err, req, res, next) => {
//   const errorCodes = ['23502'];
//   if (errorCodes.includes(err.code)) {
//     res.status(400).send({
//       msg: 'Comment failed to post!'
//     });
//   } else next(err);
// };

exports.routeError = (req, res, next) => {
  res.status(404).send({ msg: 'Route not found!' });
};

exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.serverError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({
    msg: 'Internal server error'
  });
};
