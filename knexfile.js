const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  development: {
    connection: {
      database: 'joe_nc_news'
    }
  },
  test: {
    connection: {
      database: 'joe_nc_news_test'
    }
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
