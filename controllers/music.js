import express from 'express';
import { musicMws } from '../middlewares';

const router = express.Router();

router.post('/', musicMws.upload.single('file'), musicMws.postMusic);

module.exports = router;
