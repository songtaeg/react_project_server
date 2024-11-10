const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../db');
const JWT_KEY = "secret_key"; // 비밀 키를 하드코딩

// 로그인 
router.route("/")
    .post((req, res) => {
        const { id, password } = req.body;
        const query = 'SELECT * FROM tbl_user WHERE id = ?';

        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: '서버 오류' });
            }

            if (results.length > 0) {
                const user = results[0];

                // 비밀번호 비교
                bcrypt.compare(password, user.password_hash, (err, isMatch) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: '서버 오류' });
                    }

                    if (isMatch) {
                        const token = jwt.sign(
                            { userId: user.id, name: user.name },
                            JWT_KEY, { expiresIn: '1h' }
                        );
                        res.json({ success: true, message: "로그인 성공!", token, user });
                    } else {
                        res.json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
                    }
                });
            } else {
                res.json({ success: false, message: '사용자를 찾을 수 없습니다.' });
            }
        });
    });

// 아이디 중복 확인 
router.route("/check_id")
    .post(async (req, res) => {
        const { id } = req.body;

        try {
            const query = 'SELECT * FROM tbl_user WHERE id = ?';
            const [results] = await connection.promise().query(query, [id]);

            if (results.length > 0) {
                return res.status(400).json({ success: false, message: '이미 사용중인 아이디입니다.' });
            }

            res.json({ success: true, message: '사용 가능한 아이디입니다.' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

// 회원가입 
router.route("/insert")
    .post(async (req, res) => {
        const { id, name, email, password } = req.body;

        try {
            // ID 중복 확인
            const checkIdQuery = 'SELECT * FROM tbl_user WHERE id = ?';
            const [idResults] = await connection.promise().query(checkIdQuery, [id]);

            if (idResults.length > 0) {
                return res.status(400).json({ success: false, message: '이미 사용중인 아이디입니다.' });
            }

            // 이메일 중복 확인
            const checkEmailQuery = 'SELECT * FROM tbl_user WHERE email = ?';
            const [emailResults] = await connection.promise().query(checkEmailQuery, [email]);

            if (emailResults.length > 0) {
                return res.status(400).json({ success: false, message: '이미 사용중인 이메일입니다.' });
            }

            // 비밀번호 해시화
            const password_hash = await bcrypt.hash(password, 10);

            // 사용자 등록
            const insertQuery = 'INSERT INTO tbl_user (id, name, email, password_hash) VALUES (?, ?, ?, ?)';
            await connection.promise().query(insertQuery, [id, name, email, password_hash]);

            res.json({ success: true, message: '사용자 등록이 완료되었습니다.' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

module.exports = router;


