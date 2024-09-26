const express = require('express');
const WillWrite = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('../function/db');

// 텍스트 유언장 저장 API
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

// 음성 유언장 저장 API
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

// 유언장 조회 API
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