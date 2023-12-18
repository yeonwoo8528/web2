const express = require('express')
const session = require('express-session')
const path = require('path');
const cors = require('cors');

const app = express()
const port = 3001

const db = require('./lib/db');
const sessionOption = require('./lib/sessionOption');
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(sessionOption);
app.use(session({
    key: 'session_cookie_name',
    secret: '~',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

app.get('/', (req, res) => {
    req.sendFile(path.join(__dirname, '/build/index.html'));
})

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.post("/login", (req, res) => { // 데이터 받아서 결과 전송
    const id = req.body.userId;
    const password = req.body.userPassword;
    const sendData = { isLogin: "" };

    if (id && password) {             // id와 pw가 입력되었는지 확인
        db.query('SELECT * FROM firstmysql WHERE id = ?', [id], function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {       // db에서의 반환값이 있다 = 일치하는 아이디가 있다.      
                if (password === results[0].password) {                  // 비밀번호가 일치하면
                    req.session.is_logined = true;      // 세션 정보 갱신
                    req.session.nickname = id;
                    req.session.name = results[0].name;
                    req.session.save(function () {
                        sendData.isLogin = "True"
                        res.send(sendData);
                    });
                    db.query(`INSERT INTO logTable (created, id, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`
                        , [req.session.nickname, '-', `React 로그인 테스트`], function (error, result) { });
                }
                else {                                   // 비밀번호가 다른 경우
                    sendData.isLogin = "로그인 정보가 일치하지 않습니다."
                    res.send(sendData);
                }
            } else {    // db에 해당 아이디가 없는 경우
                sendData.isLogin = "아이디 정보가 일치하지 않습니다."
                res.send(sendData);
            }
        });
    } else {            // 아이디, 비밀번호 중 입력되지 않은 값이 있는 경우
        sendData.isLogin = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);
    }
});

app.post("/signin", (req, res) => {  // 데이터 받아서 결과 전송
    const name = req.body.userName;
    const id = req.body.userId;
    const password = req.body.userPassword;
    const password2 = req.body.userPassword2;

    const sendData = { isSuccess: "" };

    if (name && id && password && password2) {
        db.query('SELECT * FROM firstmysql WHERE id = ?', [id], function (error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0 && password == password2) {         // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                db.query('INSERT INTO firstmysql (id, password, name) VALUES(?, ?, ?)', [id, password, name], function (error, data) {
                    if (error) throw error;
                    req.session.save(function () {
                        sendData.isSuccess = "True"
                        res.send(sendData);
                    });
                });
            } else if (password != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우                  
                sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다."
                res.send(sendData);
            }
            else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "이미 존재하는 아이디 입니다!"
                res.send(sendData);
            }
        });
    } else {
        sendData.isSuccess = "이름, 아이디, 비밀번호를 입력하세요!"
        res.send(sendData);
    }

});

app.get('/userdata', (req, res) => {
    const sendData = { isLogin: false, userData: {} };
    const id = req.session.nickname;
    const sqlQuery = `
        SELECT firstmysql.name, firstmysql.id
        From firstmysql
        WHERE firstmysql.id = ?`;
    db.query(sqlQuery, [id], function (error, results, fields) {
        if (error) throw error;
        else {
            const userData = results[0] || {};
            sendData.userData = userData;
            sendData.isLogin = true;
            const postsQuery = `
                SELECT posts.content, posts.idx
                FROM posts
                WHERE posts.id = ?`;
            db.query(postsQuery, [id], function (error, results, fields) {
                if (error) throw error;
                else {
                    sendData.userPosts = results;
                    res.send(sendData);
                }
            });
        }
    });
});

app.get('/boards', (req, res) => {
    db.query('SELECT firstmysql.name, posts.content, posts.idx FROM firstmysql JOIN posts ON firstmysql.id = posts.id', function (error, results, fields) {
        if (error) {
            console.error('Error retrieving posts data:', error);
            res.status(500).send('Internal Server Error');
        } else {
            const postsData = results.map(post => ({
                name: post.name,
                content: post.content,
                idx: post.idx,
            }));
            res.send({ allPosts: postsData });
        }
    });
});

app.get('/posts', (req, res) => {
    db.query('SELECT * FROM posts', function (error, results, fields) {
        if (error) {
            console.error('Error retrieving posts data:', error);
            res.status(500).send('Internal Server Error');
        } else {
            const postsData = results.map(post => ({
                id: post.id,
                content: post.content,
                comments: []
            }));
        }
    });
});

app.post('/posts', (req, res) => {
    const id = req.session.nickname;
    const content = req.body.userContent;

    db.query('INSERT INTO posts (id, content) VALUES (?, ?)', [id, content], function (error, results, fields) {
        if (error) {
            console.error('Error inserting post data:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.send({ isSuccess: true, postId: results.insertId });
        }
    });
});

app.delete('/posts', (req, res) => {
    const id = req.session.nickname;

    db.query('DELETE FROM posts WHERE id = ?', [id], function (error, results, fields) {
        if (error) {
            console.error('Error deleting posts data:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.send({ isSuccess: true });
        }
    });
});

app.get('/comments/:postId', (req, res) => {
    const postId = req.params.postId;
    const commentsQuery = `
        SELECT posts.content, comments.writer, comments.comment
        FROM posts LEFT JOIN comments ON posts.idx = comments.postId
        WHERE posts.idx = ?`;
    db.query(commentsQuery, [postId], (error, results, fields) => {
        if (error) {
            console.error('Error retrieving comments data:', error);
            res.status(500).send('Internal Server Error');
        }
        else {
            const postContent = results.length > 0 ? results[0].content : '';
            const commentsData = results.map((comment) => ({
                writer: comment.writer,
                comment: comment.comment,
            }));
            res.send({ postContent, comment: commentsData });
        }
    }
    );
});

app.post('/comments/:postId', (req, res) => {
    const writer = req.session.name;
    const comment = req.body.comment;
    const postId = req.params.postId;

    db.query('INSERT INTO comments (writer, comment, postId) VALUES (?, ?, ?)', [writer, comment, postId], function (error, result) {
        if (error) {
            console.error('Error inserting comment data:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.json({ isSuccess: true, writer: writer });
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})