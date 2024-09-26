const express = require('express');
const userinfo = express.Router();
const pool = require('../function/db');

userinfo.get('/userinfo', async (req, res) => {
    const { username } = req.query;
    const sql = 'SELECT * FROM users WHERE username = ?';

    try {
        const [rows, fields] = await pool.query(sql, [username]);

        const filteredRows = rows.map(row => {
            const { id, password, ...rest } = row;
            return rest;
        });

        res.json(filteredRows);
    } catch (error) {
        console.error('Error fetching user progress from database:', error);
        res.status(500).json({ error: '사용자의 정보 가져오는 중 오류가 발생했습니다.' });
    }
});

userinfo.post('/complete', async (req, res) => {
    const { username, work } = req.query;
    const sql = 'UPDATE users SET ?? = 1 WHERE username = ?';

    try {
        await pool.query(sql, [work, username]);
        res.json({ message: '성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('Error updating user progress:', error);
        res.status(500).json({ error: '사용자의 정보 업데이트 중 오류가 발생했습니다.' });
    }
});

module.exports = userinfo;