const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');

const Funeral = express.Router();

const pool = require('../function/db');

// Multer 설정
const storage = multer.memoryStorage(); // 메모리 스토리지 사용 (파일을 메모리에 저장)
const upload = multer({ storage });

Funeral.get('/load/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM funeral_planning WHERE username = ?',
      [username]
    );
    connection.release();

    if (rows.length > 0) {
      // 파일을 Base64로 인코딩하여 응답
      const data = rows[0];
      if (data.pronunciation) {
        data.pronunciation = data.pronunciation.toString('base64');
      }
      res.status(200).json(data);
    } else {
      res.status(404).send('No data found for this username');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send('Error loading data');
  }
});

Funeral.post('/save', upload.single('pronunciation'), async (req, res) => {
  const {
    username,
    organDonation,
    bodyDonation,
    burialOrCremation,
    hospital,
    funeralServiceAgencies,
    funeralHome,
    pronunciationName
  } = req.body;

  const pronunciation = req.file ? req.file.buffer : null;

  if (!username) {
    return res.status(400).send('Username is required');
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM funeral_planning WHERE username = ?', [username]
    );

    await connection.query(
      'INSERT INTO funeral_planning (username, organDonation, bodyDonation, burialOrCremation, hospital, funeralServiceAgencies, funeralHome, pronunciationName, pronunciation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, organDonation, bodyDonation, burialOrCremation, hospital, funeralServiceAgencies, funeralHome, pronunciationName, pronunciation]
    );
    connection.release();
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data');
  }
});

module.exports = Funeral;
