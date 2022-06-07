const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const client = require('../db/database.js');
const env = require('dotenv');
const jwt = require('jsonwebtoken');
const { user } = require('../db/database.js');

function getUser(authHeader) {
    const token = authHeader.split(' ')[1];
    var username;
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        username = user.username;
    });
    return username;
}

router.post('/create/:friend', async (req, res) => {
    let username = getUser(req.headers.authorization);
    let friend = req.params.friend;
    console.log(username, friend);

    var query = [
        "select chat_room_id from chat_room where",
        "(user1 = (select user_id from users where username=$1) and",
        "user2 = (select user_id from users where username=$2)) or",
        "(user1 = (select user_id from users where username=$2) and",
        "user2 = (select user_id from users where username=$1))"
    ].join(" ");
    var result = await client.query(query, [username, friend]);
    if (result.rows.length == 0) {
        query = [
            "insert into chat_room(name, user1, user2)",
            "values('nume',",
            "(select user_id from users where username=$1),",
            "(select user_id from users where username=$2)) RETURNING chat_room_id"
        ].join(" ");
        var result2 = await client.query(query, [username, friend]);
        return res.status(200).json(result2.rows[0])
    }
    else {
        return res.status(200).json(result.rows[0]);
    }
})

router.get('/:chat_room_id', async (req, res) => {
    let username = getUser(req.headers.authorization);
    let chat_room_id = req.params.chat_room_id;
    var query = [
        "select * from chat_room R inner join chat_message M on",
        "R.chat_room_id = M.chat_room_id where R.chat_room_id = $1",
        "order by M.sent asc"
    ].join(" ");
    var result = await client.query(query, [chat_room_id]);
    return res.status(200).json(result.rows);
})

router.post('/:chat_room_id', async (req, res) => {
    let username = getUser(req.headers.authorization);
    let chat_room_id = req.params.chat_room_id;
    let message = req.body.message;
    var query = [
        "insert into chat_message(chat_room_id, user_id, msg)",
        "values($1, (select user_id from users where username=$2), $3)",
        "returning msg, sent,chat_message_id"
    ].join(" ");
    try {
        var result = await client.query(query, [chat_room_id, username, message]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(409).json({ error: 'sql error' });
    }

})

module.exports = router;
