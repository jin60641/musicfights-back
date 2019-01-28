import express from 'express';
import {
  userMws,
} from '../middlewares';

const router = express.Router();

router.post('/signup', userMws.signUp)
router.post('/login', userMws.login)

module.exports = router;
