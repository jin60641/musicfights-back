import express from 'express';
import { musicMws } from '../middlewares';

const router = express.Router();

router.get('/:vid/:start/:duration', musicMws.getMusic);
router.post('/youtube', musicMws.postMusicByYoutube);
router.post('/', musicMws.upload.single('file'), musicMws.postMusic);

module.exports = router;
