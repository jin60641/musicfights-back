import express from 'express';
import { musicMws } from '../middlewares';

const router = express.Router();

router.post('/youtube', musicMws.postMusicByYoutube);
router.post('/', musicMws.upload.single('file'), musicMws.postMusic);
router.get('/:vid/:start/:duration', musicMws.getMusic);

module.exports = router;
