const express = require('express');
const signup = express.Router();
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('../function/db');

signup.use(bodyParser.json());
signup.use(cors());

let verificationCode = {};

const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false  // 인증서 검증 비활성화
});

const authenticationhandler = async (phoneNumber, code) => {
  const apiUrl = 'https://cesrv.hknu.ac.kr/srv/sms/send';
  const payload = {
    to: phoneNumber,
    content: `인증번호는 ${code} 입니다`,
    hash: "e57d1d532bb397707048f0e31b6e7c6654ad11fb61f759301ec4cb2b2c362cac",
  };

  try {
    const response = await axios.post(apiUrl, payload, { httpsAgent: agent });
    console.log('SMS sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('SMS 발송 중 오류가 발생했습니다.');
  }
};

signup.post('/check-username', async (req, res) => {
  const { username } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [results] = await pool.query(sql, [username]);

    if (results.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking username in database:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

signup.post('/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const code = Math.floor(Math.random() * 9000) + 1000;
    verificationCode[phoneNumber] = code;
    await authenticationhandler(phoneNumber, code);
    res.status(200).json({ message: '인증번호가 전송되었습니다.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '인증번호 요청 중 오류가 발생했습니다.' });
  }
});

signup.post('/verify-code', async (req, res) => {
  const { username, password, phoneNumber, authCode } = req.body;

  try {
    if (verificationCode[phoneNumber] && verificationCode[phoneNumber] == authCode) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)';
      const [result] = await pool.query(sql, [username, hashedPassword, phoneNumber]);
      delete verificationCode[phoneNumber];
      res.json({ message: '회원가입이 완료되었습니다.' });
    } else {
      res.status(401).json({ error: '인증번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

signup.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [results] = await pool.query(sql, [username]);

    if (results.length === 0) {
      res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
      return;
    }

    const user = results[0];
    if (await bcrypt.compare(password, user.password)) {
      res.json({ message: '로그인 성공!' });
    } else {
      res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

signup.post('/signout', async (req, res) => {
  const { requestId, password } = req.body;

  try {
    const sqlSelect = 'SELECT * FROM users WHERE username = ?';
    const [results] = await pool.query(sqlSelect, [requestId]);

    if (results.length === 0) {
      res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const userId = user.id;
      const sqlDelete = 'DELETE FROM users WHERE id = ?';
      const [result] = await pool.query(sqlDelete, [userId]);

      res.json({ message: '회원삭제가 완료되었습니다.' });
    } else {
      res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error('Error during account deletion:', error);
    res.status(500).json({ error: '회원탈퇴 중 오류가 발생했습니다.' });
  }
});

module.exports = signup;
