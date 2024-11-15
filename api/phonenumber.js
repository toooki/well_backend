/**
 * 메인메뉴중 연락처 정리 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저가 저장한 데이터가 있다면 화면에 보여줌
 * 2. 유저가 연락처를 작성하고 체크(저장하기)를 누르면 데이터베이스에 저장함
 */
const express = require('express');
const phonenumber = express.Router();
const pool = require('../function/db');

/**
 * 2의 기능을 수행하기 위한 코드 유저가 저장하기를 누르면 유저가 작성한 정보를 이름은 phonename에 전화번호는 phonenumberList에 받아와 기존의 데이터베이스에 있던 값은 삭제하고 받아온 데이터를 삽입한다
 */
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

/**
 * 1의 기능을 수행하기 위한 코드 유저가 처음 창을 로딩할 때 유저의 데이터가 있다면 그 데이터를 rows에 저장해 프런트엔드로 전송함
 */
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