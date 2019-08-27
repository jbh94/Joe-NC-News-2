const { fetchOneUser } = require('../models/users-model');

exports.sendOneUser = (req, res, next) => {
  const { username } = req.params;
  fetchOneUser(username)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};
