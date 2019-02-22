import Sequelize from 'sequelize';
import path from 'path';
import fs from 'fs-extra';
import mongoose from 'mongoose';
import { db as settings, env } from '../../config';

const mongo = mongoose.connect(`mongodb://localhost/${settings.database}`, { useNewUrlParser: true });

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
  .filter(file => !file.includes('index') && !file.includes('swp'))
  .forEach(async (file) => {
    const filePath = path.join(__dirname, file);
    const [name] = file.split('.');
    const modelName = name.charAt(0).toUpperCase() + name.slice(1);
    if (file.includes('mysql')) {
      const model = sequelize.import(filePath);
      db[modelName] = model;
    } else {
      const { default: schema } = await import(filePath);
      db[modelName] = mongoose.model(modelName, schema);
    }
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
db.mongo = mongo;

module.exports = db;
