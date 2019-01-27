import express from 'express';

import * as controllers from './controllers';

const router = express.Router();

Object.entries(controllers).forEach(([key, controller]) => router.use(`/api/${key}`, controller));

module.exports = router;
