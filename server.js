const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const pool = require('./function/db');

const bucketList = require('./api/buckitlist');
const funeral = require('./api/Funeral');
const healthdata = require('./api/healthdata');
const memory_locker = require('./api/memory_locker');
const mindlist = require('./api/mindlist');
const phonenumber = require('./api/phonenumber');
const userinfo = require('./api/userinfo');
const signup = require('./api/signup');
const WillWrite = require('./api/Will_write_back');

const app = express();

const startServer = () => {
  app.use(bodyParser.json());
  app.use(cors());
  app.use('/', bucketList);
  app.use('/', funeral);
  app.use('/', healthdata);
  app.use('/', memory_locker);
  app.use('/', mindlist);
  app.use('/', phonenumber);
  app.use('/', userinfo);
  app.use('/', signup);
  app.use('/', WillWrite);

  // 서버 실행
  const PORT = 8080;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};


const connectWithRetry = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release();
    startServer();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000); // 5초 후에 재시도
  }
};

try {
  connectWithRetry();
} catch (e) {
  console.log('Unexpected error:', e);
  console.log('Retrying in 5 seconds...');
  setTimeout(connectWithRetry, 5000); // 5초 후에 재시도
}