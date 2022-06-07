const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const client = require('../db/database.js');
const env = require('dotenv');
const jwt = require('jsonwebtoken');

router.post('/', body('search').isLength({ min: 2 }), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    search = req.body.search

    var query = [
        "select username, first_name, last_name, avatar",
        "from users",
        "where username like $1",
        "or first_name like $1",
        "or last_name like $1",
        "or concat(first_name, ' ', last_name) like $1",
        "or concat(last_name, ' ', first_name) like $1"
    ].join(" ");


    var success = await client.query(query, ['%' + search + '%']);

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    let username;
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        username = user.username;
    });

    query = [
        "select ur.username from users ur, users u, friendship f",
        "where",
        "(u.user_id = f.first_user_id and ur.user_id = f.second_user_id and u.username=$1) or ",
        "(u.user_id = f.second_user_id and ur.user_id = f.first_user_id and u.username=$1)"
    ].join(" ");

    var friends = (await client.query(query, [username])).rows;

    query = [
        "select username from users U inner join (select user_request_id from friend_request ",
        "where user_id = (select user_id from users where username=$1)) B on U.user_id = B.user_request_id"
    ].join(" ");

    //cui i-a dat
    var users_request = (await client.query(query, [username])).rows;

    query = [
        "select username from users U inner join (select user_id from friend_request",
        " where user_request_id = (select user_id from users where username=$1)) B on U.user_id=B.user_id"
    ].join(" ");

    //cine i-a dat
    var users_requested = (await client.query(query, [username])).rows;
    //console.log(users_requested);
    var resp = success.rows;
    //var list = Object.entries(friends)
    let friendlist = []
    let users_requestlist = [];
    let users_requestedlist = [];

    friends = friends.map(friend => friend.username);
    users_request = users_request.map(person => person.username);
    users_requested = users_requested.map(person => person.username);
    //console.log(friends, users_request, users_requested);
    resp.forEach(function (item, index) {
        item["friendship_status"] = false;
        item["friend_request_status"] = "none";
        if (friends.includes(item.username))
            item["friendship_status"] = true;
        if (users_request.includes(item.username))
            item["friend_request_status"] = "send";
        if (users_requested.includes(item.username))
            item["friend_request_status"] = "receive";
    });

    resp = resp.filter(person => person.username != username);
    return res.status(200).json(resp);
});
module.exports = router;