/**
 * 유저정보 화면에 대한 벡엔드
 * 주요기능
 * 1. 유저의 정보를 가져와서 화면에 보여줌
 * 2. 유저가 화면의 기능들을 완료했다면 그 완료 표시로 0에서1로 바꾸어줌
 */
const express = require('express');
const userinfo = express.Router();
const pool = require('../function/db');

/**
 * 1의 기능을 수행하기 위한 코드 유저가 유저정보 화면을 들어가면 그 유저에 대한 정보를 데이터베이스에서 가져와 화면에 띄워줌
 */
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

/**
 * 2의 기능을 수행하기 위한 코드 유저가 메인화면의 기능들을 하나씩 완료하면 그 표시를 하기위해 0에서 1로 그 값을 바꿔줌
 */
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