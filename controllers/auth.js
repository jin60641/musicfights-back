import express from 'express';
import { authMws } from '../middlewares';

const router = express.Router();

router.post('/signup', authMws.signUp);
router.post('/login', authMws.login);
router.post('/loggedin', authMws.loggedIn);

module.exports = router;
