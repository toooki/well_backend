/**
 * 메인메뉴중 유언장 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 화면이 로딩될때 유언장이 텍스트나 음성으로 저장되어있다면 저장된 유언장과 함께 수기면 수기 음성이면 음성 화면을 보여줌
 * 2. 유저가 수기에서 유언장 저장을 누르면 유저가 작성한 정보를 가져와 기존의 값을 삭제하고 가져온 데이터를 삽입함
 * 3. 유저가 녹음에서 유언장 저장을 누르면 유저가 작성한 정보를 가져와 base64로 된 값을 buffer로 바꿔주고 기존의 데이터베이스에 있던 값을 삭제하고 가져온 데이터를 삽입함
 */
const express = require('express');
const WillWrite = express.Router();
const pool = require('../function/db');

/**
 * 2의 기능을 수행하기 위한 코드 유저가 작성한 유언을 willwrite에 받아와 데이터베이스에서 기존의 유저의 데이터를 삭제하고 가져온 값을 삽입함
 */
WillWrite.post('/willwrite/text', async (req, res) => {
  const { username, willwrite } = req.body;

  try {
    const connection = await pool.getConnection();
    const query1 = 'DELETE FROM wills WHERE username = ?';
    await connection.execute(query1, [username]);
    const query2 = 'INSERT INTO wills (username, willwrite, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE willwrite = ?, created_at = NOW()';
    await connection.execute(query2, [username, willwrite, willwrite]);
    connection.release();
    res.status(200).send('유언장이 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('서버 오류로 유언장을 저장하지 못했습니다.');
  }
});

/**
 * 3의 기능을 수행하기 위한 코드 유저가 녹음한 데이터를 base64로 willrecordBase64에 받아와 buffer로 변환하여 기존에 데이터베이스에 저장된 값을 삭제하고 가져온 데이터를 삽입함
 */
WillWrite.post('/willwrite/audio', async (req, res) => {
  const { username, willrecordBase64 } = req.body;

  try {
    // base64 데이터를 Buffer로 변환
    const willrecordBuffer = Buffer.from(willrecordBase64, 'base64');

    const connection = await pool.getConnection();
    const query1 = 'DELETE FROM wills WHERE username = ?';
    await connection.execute(query1, [username]);
    const query2 = 'INSERT INTO wills (username, willrecord, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE willrecord = ?, created_at = NOW()';
    await connection.execute(query2, [username, willrecordBuffer, willrecordBuffer]);
    connection.release();
    res.status(200).send('음성 유언장이 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('서버 오류로 음성 유언장을 저장하지 못했습니다.');
  }
});

/**
 * 1의 기능을 수행하기 위한 코드 처음 창이 로딩될때 유저의 데이터가 있다면 그 값을 rows에 저장해 프런트 엔드로 전송한다 이때 willrecord 즉 음성으로 저장된 값이 있다면 buffer로 된 값을 base64로 변환하여 rows에 담아 프런트 엔드로 전송한다
 */
WillWrite.get('/willwrite/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = 'SELECT willwrite, willrecord, created_at FROM wills WHERE username = ?';
    const [rows] = await connection.execute(query, [username]);
    connection.release();

    if (rows.length > 0) {
      const row = rows[0];
      if (row.willrecord) {
        row.willrecord = row.willrecord.toString('base64'); // Buffer를 base64로 변환
      }
      res.status(200).json(row);
    } else {

    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('서버 오류로 유언장을 조회하지 못했습니다.');
  }
});

module.exports = WillWrite;