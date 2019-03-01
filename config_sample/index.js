import database from './database';

export mailgun from './mail';
export { domain } from './service';

export const env = process.env.NODE_ENV || 'development';
export const db = database;
export const tokenSecret = 'token secret';
