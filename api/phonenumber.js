const express = require('express');
const phonenumber = express.Router();
const pool = require('../function/db');

// POST 라우트 작성
phonenumber.post('/savephonenumber', async (req, res) => {
  const { phonename, phonenumberList, username } = req.body; // 사용자 이름 받아오기

  // 데이터베이스에 기존 phonenumber 삭제
  const deleteSql = 'DELETE FROM phonenumber WHERE username = ?';
  try {
    await pool.query(deleteSql, [username]);
    console.log('Previous phonenumber deleted successfully');
  } catch (error) {
    console.error('Error deleting previous phonenumber from database:', error);
    res.status(500).json({ error: '이전 phonenumber 삭제 중 오류가 발생했습니다.' });
    return; // 오류 발생 시 함수 종료
  }

  // 새로운 phonenumber 삽입
  const insertSql = 'INSERT INTO phonenumber (username, phonename, phonenumber) VALUES (?, ?, ?)';
  try {
    // 각각의 phonenumber 아이템을 데이터베이스에 저장
    for (let i = 0; i < phonename.length; i++) {
      await pool.query(insertSql, [username, phonename[i], phonenumberList[i]]);
    }
    console.log('New phonenumber saved successfully');
    res.json({ message: 'phonenumber가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new phonenumber to database:', error);
    res.status(500).json({ error: '새로운 phonenumber 저장 중 오류가 발생했습니다.' });
  }
});

phonenumber.get('/phonenumberuser', async (req, res) => {
  const { username } = req.query;

  // 데이터베이스에서 해당 사용자의 phonenumber 가져오기
  const sql = 'SELECT * FROM phonenumber WHERE username = ?';

  try {
    const [rows] = await pool.query(sql, [username]);
    res.json(rows); // 사용자의 phonenumber를 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching user phonenumber from database:', error);
    res.status(500).json({ error: '사용자의 phonenumber를 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = phonenumber;