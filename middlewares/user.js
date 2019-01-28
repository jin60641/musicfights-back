import jwt from 'jsonwebtoken';
import db from '../models';

export const login = (req, res) => {
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

  if(user){
    if(user.verify){
      const { id } = user;
      const secret = req.app.get('jwt-secret');
      const token = jwt.sign({ id, email }, secret);
      res.send({ data: { token } });
    } else {
      res.status(400).send({ message: '이메일 인증을 진행하셔야 정상적인 이용이 가능합니다.' });
    }
  } else {
    res.status(400).send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
  }
}

export const signUp = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ message: 'invalid' });
    return;
  }
  const user = await db.User.findOne({
    where : { email },
  });

  const current = {
    email,
    password,
  };

  const created = await db.User.create(current);
  if (created) {
    res.send({ data: 'success' });
  } else {
    res.status(400).send({ message: 'invalid' });
  }
}
