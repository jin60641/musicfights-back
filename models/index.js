import Sequelize from 'sequelize';
import path from 'path';
import fs from 'fs-extra';
import { db as settings, env } from '../config';

const testing = env === 'test';
const sequelize = new Sequelize(
  settings.database,
  settings.username,
  settings.password,
  {
    ...settings.options,
    logging: testing ? false : console.log,
  },
);

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => (file !== 'index.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

sequelize.sync({
  force: testing,
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
