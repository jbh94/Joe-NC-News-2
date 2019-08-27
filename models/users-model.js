const connection = require('../db/connection');

exports.fetchOneUser = username => {
  return connection
    .select('*')
    .from('users')
    .where('username', username)
    .then(user => {
      if (!user.length) {
        return Promise.reject({ status: 404, msg: 'Username not found!' });
      } else return user;
    });
};
