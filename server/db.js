const mysql = require('mysql2');

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: '127.0.0.1',      
    user: 'root',           
    password: 'test1234',   
    database: 'reactsns'     
});
// 연결 확인
connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공');
});

module.exports = connection;