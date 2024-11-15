/**
 * 메인메뉴중 마음의 빛 청산 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저가 저장한 데이터가 있다면 화면에 보여줌
 * 2. 유저가 마음의 빛을 작성하고 체크(저장하기)를 누르면 데이터베이스에 저장함
 */
const express = require('express');
const mindlistRouter = express.Router();
const pool = require('../function/db');

/**
 * 2의 기능을 수행하기 위한 코드 유저가 저장하기를 누르면 유저가 작성한 정보를 mindList에 받아와 원래 데이터베이스에 있던 값을 삭제하고 가져온 데이터를 삽입한다
 */
mindlistRouter.post('/savemindlist', async (req, res) => {
  const { mindList, username } = req.body; // 사용자 이름 받아오기
  // 데이터베이스에 기존 mind list 삭제
  const deleteSql = 'DELETE FROM mindlist WHERE username = ?';
  try {
    await pool.query(deleteSql, [username]);
    console.log('Previous mind list deleted successfully');
  } catch (error) {
    console.error('Error deleting previous mind list from database:', error);
    res.status(500).json({ error: '이전 mind list 삭제 중 오류가 발생했습니다.' });
    return; // 오류 발생 시 함수 종료
  }

  // 새로운 mind list 삽입
  const insertSql = 'INSERT INTO mindlist (username, text, completed) VALUES (?, ?, ?)';
  try {
    // 각각의 mind list 아이템을 데이터베이스에 저장
    for (const item of mindList) {
      await pool.query(insertSql, [username, item.text, item.completed]); // username 추가
    }
    console.log('New mind list saved successfully');
    res.json({ message: 'mind list가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new mind list to database:', error);
    res.status(500).json({ error: '새로운 mind list 저장 중 오류가 발생했습니다.' });
  }
});

/**
 * 1의 기능을 수행하기 위한 코드 유저가 처음 창을 로딩할때 유저의 데이터가 있다면 그 데이터를 rows에 저장해 프런트엔드로 전송함
 */
mindlistRouter.get('/mindlistuser', async (req, res) => {
  const { username } = req.query;

  // 데이터베이스에서 해당 사용자의 mind list 가져오기
  const sql = 'SELECT * FROM mindlist WHERE username = ?';

  try {
    const [rows, fields] = await pool.query(sql, [username]);
    res.json(rows); // 사용자의 mind list를 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching user mind list from database:', error);
    res.status(500).json({ error: '사용자의 mind list를 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = mindlistRouter;