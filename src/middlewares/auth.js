import jwt from 'jsonwebtoken';

import db from '../models';
import { domain, host, mailgun } from '../../config';

const checkLoggedIn = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  const secret = req.app.get('jwt-secret');
  const isLoggedIn = await jwt.verify(token, secret);
  if (!isLoggedIn) {
    res.status(400).send({ message: '로그인이 필요합니다.' });
    return;
  }
  const { id } = isLoggedIn;
  req.user = await db.User.findOne({ where: { id } });
  next();
};
const verifyMail = async (req, res) => {
  const { email, link } = req.body;
  const user = await db.User.findOne({ where: { email } });
  if (user && db.User.createHashedEmail(email) === link) {
    db.User.update({ verify: true }, { where: { email } })
      .then(() => {
        res.send({ data: '회원가입이 완료되었습니다.' });
      });
  } else {
    res.status(401).send({ message: '잘못된 접근입니다.' });
  }
};

const loggedIn = (req, res) => {
  res.send({ data: req.user, message: 'token valid' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const where = {
    email,
    password: db.User.createHashedPassword(password),
  };

  const user = await db.User.findOne({
    where,
    attributes: db.User.attributeNames,
    raw: true,
  });

  if (user) {
    if (user.verify) {
      const { id } = user;
      const secret = req.app.get('jwt-secret');
      const token = await jwt.sign({ id, email }, secret);
      res.send({ data: { user, token } });
    } else {
      res.status(400).send({ message: '이메일 인증을 진행하셔야 정상적인 이용이 가능합니다.' });
    }
  } else {
    res.status(400).send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
  }
};

const signUp = async (req, res) => {
  const {
    email,
    handle,
    name,
    password,
  } = req.body;

  if (!email || !password || !handle || !name) {
    res.status(400).send({ message: 'invalid' });
    return;
  }

  const user = await db.User.findOne({
    where: {
      $or: [{
        email,
      }, {
        handle,
      }],
    },
  });

  if (user) {
    if (user.email === email) {
      res.status(400).send({ message: 'email already used' });
    }

    if (user.handle === handle) {
      res.status(400).send({ message: 'handle already used' });
    }

    return;
  }

  const current = {
    email,
    handle,
    name,
    password,
  };

  const created = await db.User.create(current);
  if (created) {
    const link = db.User.createHashedEmail(email);

    const string = `${host}/mail/${email}/${link}`;
    const data = {
      from: `Admin <me@${domain}>`,
      to: email,
      subject: `${domain} 이메일 인증 안내`,
      html: `<div id="box" style="display:block;background-color:#ebeff4;margin-top:auto;margin-bottom:auto;margin-right:auto;margin-left:auto;width:100%;padding-top:50px;padding-bottom:50px;" > <div id="wrap" style="max-width:700px;border-radius:4px;margin-left:auto;margin-right:auto;box-shadow:0 2px 8px rgba(0, 0, 0, 0.25);background-color:white;" > <div id="head" style="height:55px;background-color:#ff5c3e;padding-top:13px;padding-bottom:0px;padding-right:0px;padding-left:38px;box-sizing:border-box;" ></div> <div id="body" style="position:relative;padding-top:38px;padding-bottom:38px;padding-right:38px;padding-left:38px;box-sizing:border-box;" > <div id="title" style="font-size:19px;font-weight:800;padding-bottom:20px;border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:black;max-width:310px;width:100%;margin-bottom:20px;" > ${domain} 이메일 인증 안내 </div> <div id="text" style="font-size:15px;line-height:32px;" > 안녕하세요.<br /> ${domain}의 회원이 되신 것을 진심으로 환영합니다.<br /> 아래 인증 버튼을 클릭하시면<br /> 회원 가입 절차가 완료됩니다.<br /> </div> <a id="btn" href="${string}" style="text-decoration:none;cursor:pointer;margin-top:22px;margin-left:10px;padding-top:14px;padding-bottom:14px;padding-right:35px;padding-left:35px;font-size:17px;border-radius:200px;background-color:#3fc649;color:white;display:inline-block;text-align:center;" > 이메일 인증 </a> <div id="footer" style="margin-top:80px;" > <div id="footer-text" style="display:inline-block;margin-top:2px;vertical-align:middle;font-size:10px;color:#a8a8a8;padding-left:15px;border-left-width:1px;border-left-style:solid;border-left-color:#d5d5d5;margin-left:15px;line-height:14px;" > Copyrightⓒ2017.Allrights reserved by ${domain}<br /> 본인이 가입하신 것이 아니라면 문의 바랍니다. </div> </div> </div> </div> </div>`,
    };

    mailgun.messages().send(data, (error, body) => {
      if (!error && body) {
        res.send({ data: 'success' });
      }
    });
  } else {
    res.status(400).send({ message: 'invalid' });
  }
};

export default {
  checkLoggedIn,
  verifyMail,
  loggedIn,
  login,
  signUp,
};
