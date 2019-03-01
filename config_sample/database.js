const env = process.env.NODE_ENV || 'development';

const databaseName = {
  development: 'db_development',
  test: 'db_test',
  production: 'db',
};

const database = {
  database: databaseName[env],
  password: 'db-password',
  username: 'db-username',
  options: {
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // host : 'root',
    port: 3306,
    dialect: 'mysql',
    define: {
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci',
      },
    },
    query: {
    },
  },
};

export default database;
