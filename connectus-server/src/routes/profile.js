const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const client = require('../db/database.js');
const env = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage })
var cloudinary = require('cloudinary').v2;
const { user } = require('../db/database.js');

function getUser(authHeader) {
    const token = authHeader.split(' ')[1];
    var username;
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        username = user.username;
    });
    return username;
}
router.post('/edit',
    body('first_name').isAlpha().isLength({ min: 2 }),
    body('last_name').isAlpha().isLength({ min: 2 }),
    body('email').isEmail(),
    async (req, res) => {
        //console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let username = getUser(req.headers.authorization);

        const { first_name, last_name, email } = req.body;

        var query = 'UPDATE users SET first_name = $1, last_name = $2, email = $3 where username = $4'
        var success;
        try {
            success = await client.query(query, [first_name, last_name, email, username]);
        } catch (error) {
            return res.status(409).json({ error: true, message: 'E-mail is already used!' });
        }

        return res.status(200).json({ first_name: first_name, last_name: last_name, email: email });
    })

router.post('/edit/upload', upload.single('image'), async (req, res) => {

    let username = getUser(req.headers.authorization);
    var image = req.file;
    cloudinary.uploader.upload_stream(async function (error, result) {
        if (error)
            return res.status(403).json({ error: 'Something went wrong with the upload, please try again later!', message: 'No token receive!' });

        if (result) {
            var query = 'UPDATE users SET avatar = $1 where username = $2';
            var success = await client.query(query, [result.secure_url, username]);
            query = 'INSERT INTO profile_pictures_history(avatar,user_id) values($1, (select user_id from users where username = $2))';
            success = await client.query(query, [result.secure_url, username]);
            return res.status(200).json({ message: result.secure_url });
        }
    }).end(image.buffer);
    return;
})
router.get('/friends', async (req, res) => {
    let username = getUser(req.headers.authorization);
    var query = [
        "select ur.username, ur.first_name, ur.last_name, ur.avatar, ur.user_id",
        "from users u, users ur, friendship f",
        "where u.username = $1 and",
        "((f.first_user_id = u.user_id and f.second_user_id = ur.user_id)",
        "or (f.second_user_id = u.user_id and f.first_user_id = ur.user_id))"
    ].join(" ");
    var friends = (await client.query(query, [username])).rows;

    res.status(200).json(friends);
})

router.post('/post', upload.single('image'), async (req, res) => {
    let username = getUser(req.headers.authorization);
    var image = req.file;
    const fields = JSON.parse(JSON.stringify(req.body));
    if (!fields.text && !image)
        return res.status(400).json({ error: 'Invalid fields' });

    var query = [
        "INSERT INTO public.post(user_id)",
        "VALUES ((select user_id from users where username= $1)) RETURNING post_id"
    ].join(" ");
    var post_id = (await client.query(query, [username])).rows[0].post_id;
    console.log(post_id);

    var query = [
        "INSERT INTO public.post_content(post_id)",
        "VALUES ($1) RETURNING post_content_id"
    ].join(" ");
    var post_content_id = (await client.query(query, [post_id])).rows[0].post_content_id;
    console.log(post_content_id);

    if (image) {
        cloudinary.uploader.upload_stream(async function (error, result) {
            if (error)
                return res.status(403).json({ error: 'Something went wrong with the upload, please try again later!', message: 'No token receive!' });

            if (result) {
                var query = "UPDATE post_content SET media = $1 where post_content_id = $2";
                var success = await client.query(query, [result.secure_url, post_content_id]);
            }
        }).end(image.buffer);
    }

    if (fields.text) {
        var query = "UPDATE post_content SET text = $1 where post_content_id = $2";
        var success = await client.query(query, [fields.text, post_content_id]);
    }

    return res.status(200).json({ message: "merge" });
})

router.get('/posts', async (req, res) => {
    let username = getUser(req.headers.authorization);
    var query = [
        "SELECT P.post_id, P.user_id, (select username from users where user_id = P.user_id) username, (select avatar from users where user_id = P.user_id), P.created_on, O.media, O.text",
        "FROM post P left join post_content O on P.post_id = O.post_id",
        "where P.user_id = (select user_id from users where username = $1)"
    ].join(" ");
    var result = await client.query(query, [username]);

    query = ["select C.comment_id, C.post_id, C.text, U.user_id, U.username, U.first_name, C.created_on",
        ", U.last_name, U.avatar from comment C inner join users U on C.user_id = U.user_id",
        "order by C.created_on DESC"].join(" ");
    var result2 = await client.query(query).catch(error => {
        console.log(error);
    });

    const obj = {};
    result2.rows.forEach(comment => {
        if (obj.hasOwnProperty(comment.post_id)) {
            obj[comment.post_id].push(comment);
        } else {
            obj[comment.post_id] = [comment];
        }
    });
    const obj2 = {};
    query = ["select L.post_id, L.post_like_id, L.like_type, U.username from post_like L",
        "inner join users U on U.user_id = L.user_id"].join(" ");
    result2 = await client.query(query).catch(error => {
        console.log(error);
    })
    result2.rows.forEach(like => {
        if (obj2.hasOwnProperty(like.post_id)) {
            obj2[like.post_id].push(like);
        } else {
            obj2[like.post_id] = [like];
        }
    });
    //
    result.rows.forEach((element, index) => {
        result.rows[index].comments = obj[result.rows[index].post_id] || [];
        result.rows[index].likes = obj2[result.rows[index].post_id] || [];
        result.rows[index].self_like = 0;
        if (obj2[result.rows[index].post_id] != undefined) {
            obj2[result.rows[index].post_id].forEach(element => {
                if (element.username == username) {
                    result.rows[index].self_like = element.like_type;
                }
            });
        }
    });
    //console.log(result.rows);
    return res.status(200).json(result.rows);
})

router.get('/feed', async (req, res) => {
    let username = getUser(req.headers.authorization);
    query = [
        "select M.post_id, M.user_id, (select username from users where user_id = M.user_id)username, (select avatar from users where user_id = M.user_id), M.created_on, O.media, O.text from",
        "(select P.user_id, P.post_id, P.created_on from post P inner join",
        "(select ur.user_id, ur.username from users ur, users u, friendship f where",
        "(u.user_id = f.first_user_id and ur.user_id = f.second_user_id and u.username=$1) or",
        "(u.user_id = f.second_user_id and ur.user_id = f.first_user_id and u.username=$1)) F",
        "on P.user_id = F.user_id) M left join post_content O on M.post_id = O.post_id",
        "order by M.created_on DESC"
    ].join(" ");
    var result = await client.query(query, [username]);

    query = ["select C.comment_id, C.post_id, C.text, U.user_id, U.username, U.first_name, C.created_on",
        ", U.last_name, U.avatar from comment C inner join users U on C.user_id = U.user_id",
        "order by C.created_on DESC"].join(" ");
    var result2 = await client.query(query).catch(error => {
        console.log(error);
    });

    const obj = {};
    result2.rows.forEach(comment => {
        if (obj.hasOwnProperty(comment.post_id)) {
            obj[comment.post_id].push(comment);
        } else {
            obj[comment.post_id] = [comment];
        }
    });
    const obj2 = {};
    query = ["select L.post_id, L.post_like_id, L.like_type, U.username from post_like L",
        "inner join users U on U.user_id = L.user_id"].join(" ");
    result2 = await client.query(query).catch(error => {
        console.log(error);
    })
    result2.rows.forEach(like => {
        if (obj2.hasOwnProperty(like.post_id)) {
            obj2[like.post_id].push(like);
        } else {
            obj2[like.post_id] = [like];
        }
    });
    //
    result.rows.forEach((element, index) => {
        result.rows[index].comments = obj[result.rows[index].post_id] || [];
        result.rows[index].likes = obj2[result.rows[index].post_id] || [];
        result.rows[index].self_like = 0;
        if (obj2[result.rows[index].post_id] != undefined) {
            obj2[result.rows[index].post_id].forEach(element => {
                if (element.username == username) {
                    result.rows[index].self_like = element.like_type;
                }
            });
        }
    });
    console.log(result.rows);
    return res.status(200).json(result.rows);

})

router.post('/post/:post_id/comment', async (req, res) => {
    let username = getUser(req.headers.authorization);
    let post_id = req.params.post_id;
    let text = req.body.text;
    console.log(post_id, username, text);
    var query = [
        "INSERT INTO comment (post_id, text, user_id)",
        "VALUES ($1, $2, (select user_id from users where username = $3)) RETURNING comment_id"
    ].join(" ");
    var comment_id = (await client.query(query, [post_id, text, username])).rows[0].comment_id;
    return res.status(200).json({ comment_id: comment_id });
})

router.post('/post/:post_id/like', async (req, res) => {
    let username = getUser(req.headers.authorization);
    let post_id = req.params.post_id;
    let like_type = req.body.like_type;
    console.log(username, post_id, like_type);
    var query = [
        "SELECT * FROM post_like",
        "WHERE post_id = $1 AND user_id = (select user_id from users where username = $2)"
    ].join(" ");
    var result = await client.query(query, [post_id, username]);
    console.log(result.rows)
    if (result.rowCount > 0) {
        query = [
            "DELETE FROM post_like",
            "WHERE post_id = $1 AND user_id = (select user_id from users where username = $2)"
        ].join(" ");
        var result = await client.query(query, [post_id, username]);
        return res.status(200).json({});
    }
    else {
        query = [
            "INSERT INTO post_like(post_id, user_id, like_type)",
            "VALUES($1, (select user_id from users where username = $2), $3) RETURNING post_like_id"
        ].join(" ");
        var like_id = (await client.query(query, [post_id, username, like_type])).rows[0].post_like_id;
        return res.status(200).json({ like_id });
    }
})

module.exports = router;