const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const client = require('../db/database.js');
const env = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage })
var cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dsrz2tydo',
    api_key: '554921652233536',
    api_secret: 'F_Xssx0n0JV7eTSlF-zF0QMHOdo'
});

env.config()



router.get('/:id', async (req, res) => {
    const username = req.params.id;
    var query = 'SELECT first_name, last_name, avatar from users WHERE username = $1';
    var results = await client.query(query, [username]);

    if (results.rowCount == 0)
        return res.status(404).json({ error: "That username does not exist!" });

    const { first_name, last_name, avatar } = results.rows[0];

    const authHeader = req.headers.authorization;
    //verify token receive is not null
    if (!authHeader) {
        return res.status(403).json({ error: 'Invalid token!', message: 'No token received!' });
    }

    const token = authHeader.split(' ')[1];
    let userToken;
    jwt.verify(token, process.env.JWT_KEY, (err, username) => {
        if (err) {
            return null;
        }
        userToken = username;
    })

    if (!userToken) {
        return res.status(403).json({ error: 'Invalid token!' });
    }


    var friendship_status = false;
    var friend_request_status = "none";

    //friendship test
    query = ["select ur.username",
        "from users ur, users u, friendship f",
        "where u.user_id = f.first_user_id and ur.user_id = f.second_user_id and",
        "((u.username=$2 and ur.username=$1) or (u.username=$1 and ur.username=$2))"
    ].join(" ");
    result = await client.query(query, [userToken.username, username]);

    if (result.rowCount != 0) {
        friendship_status = true;
    } else {
        query = ["select ur.username",
            "from users ur, users u, friend_request f",
            "where u.user_id = f.user_id and ur.user_id = f.user_request_id and",
            "u.username=$1 and ur.username=$2"
        ].join(" ");
        result = await client.query(query, [userToken.username, username]);
        if (result.rowCount != 0) {
            friend_request_status = "send";
        } else {
            query = ["select ur.username",
                "from users ur, users u, friend_request f",
                "where u.user_id = f.user_id and ur.user_id = f.user_request_id and",
                "u.username=$1 and ur.username=$2"
            ].join(" ");
            result = await client.query(query, [userToken.username, username]);
            if (result.rowCount != 0) {
                friend_request_status = "receive";
            }
        }
    }
    query = ["select ur.username, ur.first_name, ur.last_name, ur.avatar",
        "from users ur, users u, friendship f",
        "where ((u.user_id = f.first_user_id and ur.user_id = f.second_user_id) ",
        " or (u.user_id = f.second_user_id and ur.user_id = f.first_user_id))",
        "and u.username=$1 and ur.username!=$2"
    ].join(" ");
    result = await client.query(query, [username, userToken.username]);
    console.log(result.rows);
    var friends = result.rows;
    return res.status(200).json({ username, first_name, last_name, avatar, friendship_status, friend_request_status, friends });
})

router.get('/:id/posts', async (req, res) => {
    const username = req.params.id;
    console.log('[ula')
    var query = [
        "SELECT P.post_id, P.user_id, (select username from users where user_id = P.user_id) username, (select avatar from users where user_id = P.user_id), P.created_on, O.media, O.text",
        "FROM post P left join post_content O on P.post_id = O.post_id",
        "where P.user_id = (select user_id from users where username = $1) order by P.created_on DESC"
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

/*
router.post('/:id/edit',
    body('first_name').isAlpha().isLength({ min: 2 }),
    body('last_name').isAlpha().isLength({ min: 2 }),
    body('email').isEmail(),
    async (req, res) => {
        //console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const username = req.params.id;

        const authHeader = req.headers.authorization;
        //verify token receive is not null
        if (!authHeader) {
            return res.status(403).json({ error: 'Invalid token!', message: 'No token receive!' });
        }

        const token = authHeader.split(' ')[1];
        let userToken;
        jwt.verify(token, process.env.JWT_KEY, (err, username) => {
            if (err) {
                return null;
            }
            userToken = username;
        })

        if (!userToken) {
            return res.status(403).json({ error: 'Invalid token!' });
        }

        if (userToken.username != username) {
            return res.status(403).json({ error: 'wrong account (debugging only)' });
        }

        const { first_name, last_name, email } = req.body;

        var query = 'UPDATE users SET first_name = $1, last_name = $2, email = $3 where username = $4'
        var success = await client.query(query, [first_name, last_name, email, username]);
        //console.log(success)
        return res.status(200).json({ message: 'Update succses!' });
    });
*/

/*
router.post('/:id/edit/upload', upload.single('image'), async (req, res) => {
    var image = req.file;
    //console.log(image)
    //cloudinary.uploader.upload(image.buffer, function (error, result) {console.log(result, error)});
    let upload_err, upload_res;
    cloudinary.uploader.upload_stream(async function (error, result) {
        //console.log(error);
        //console.log(result);
        if (error)
            return res.status(403).json({ error: 'Something went wrong with the upload, please try again later!', message: 'No token receive!' });

        if (result) {
            let username = req.params.id;
            var query = 'UPDATE users SET avatar = $1 where username = $2'
            var success = await client.query(query, [result.secure_url, username]);
            return res.status(200).json({ message: result.secure_url });
        }

    }).end(image.buffer);

    //var link = upload_res.secure_url;
    //console.log(link);
    return;

})
*/

async function friends_actions(req) {
    const username_sendto = req.params.id;

    var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
    var results = await client.query(query, [username_sendto]);
    var err = 200;
    if (results.rowCount == 0) {
        //return res.status(404).json({ error: "That username does not exist!" });
        err = 404;
        return { err };
    }
    const user_request_id = results.rows[0].user_id;
    const return_param = results.rows[0];
    const authHeader = req.headers.authorization;

    const token = authHeader.split(' ')[1];
    let userToken;
    jwt.verify(token, process.env.JWT_KEY, (err, username) => {
        if (err) {
            return null;
        }
        userToken = username;
    })

    if (userToken.username == username_sendto) {
        //return res.status(403).json({ error: 'friend request to same user (debugging only)' });
        err = 403;
        return { err };
    }

    query = 'SELECT user_id from users WHERE username = $1';
    results = await client.query(query, [userToken.username]);

    const user_id = results.rows[0].user_id;
    return { username_sendto, user_id, return_param, user_request_id, err };
}

router.post('/:id',
    body("actions"),
    async (req, res) => {
        if (req.body.actions == 'friend_request') {
            /*
                        const username_sendto = req.params.id;
            
                        var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
                        var results = await client.query(query, [username_sendto]);
            
                        if (results.rowCount == 0)
                            return res.status(404).json({ error: "That username does not exist!" });
            
                        const user_request_id = results.rows[0].user_id;
                        const return_param = results.rows[0];
                        const authHeader = req.headers.authorization;
            
                        const token = authHeader.split(' ')[1];
                        let userToken;
                        jwt.verify(token, process.env.JWT_KEY, (err, username) => {
                            if (err) {
                                return null;
                            }
                            userToken = username;
                        })
            
                        if (userToken.username == username_sendto) {
                            return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                        }
            
                        query = 'SELECT user_id from users WHERE username = $1';
                        results = await client.query(query, [userToken.username]);
            
                        const user_id = results.rows[0].user_id;
            */
            //nou
            var results = await friends_actions(req);
            const username_sendto = results.username_sendto;

            if (results.err != 200) {
                if (results.err == 403) {
                    return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                }
                if (results.err == 404) {
                    return res.status(404).json({ error: "That username does not exist!" });
                }
            }
            //nou
            //verify friend_request table
            query = 'SELECT * from friend_request WHERE (user_id = $1 and user_request_id = $2) or (user_id = $2 and user_request_id = $1)';

            result = await client.query(query, [results.user_id, results.user_request_id]);

            if (result.rowCount > 0)
                return res.status(403).json({ error: 'Request aready send!' });

            //verify friendship table
            query = 'SELECT * from friendship WHERE (first_user_id = $1 and second_user_id = $2) or (first_user_id = $2 and second_user_id = $1)';
            result = await client.query(query, [results.user_id, results.user_request_id]);

            if (result.rowCount > 0)
                return res.status(403).json({ error: 'Users aready friends!' });

            query = 'INSERT INTO friend_request(user_id, user_request_id) values($1, $2) RETURNING *';
            result = await client.query(query, [results.user_id, results.user_request_id]);

            const { first_name, last_name, avatar } = results.return_param;

            res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: false, friend_request_status: "send" });

        } else if (req.body.actions == 'cancel_friend_request') {
            //nou
            var results = await friends_actions(req);
            const username_sendto = results.username_sendto;

            if (results.err != 200) {
                if (results.err == 403) {
                    return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                }
                if (results.err == 404) {
                    return res.status(404).json({ error: "That username does not exist!" });
                }
            }
            //nou
            /*
            const username_sendto = req.params.id;

            var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
            var results = await client.query(query, [username_sendto]);

            if (results.rowCount == 0)
                return res.status(404).json({ error: "That username does not exist!" });

            const user_request_id = results.rows[0].user_id;
            const return_param = results.rows[0];
            const authHeader = req.headers.authorization;

            const token = authHeader.split(' ')[1];
            let userToken;
            jwt.verify(token, process.env.JWT_KEY, (err, username) => {
                if (err) {
                    return null;
                }
                userToken = username;
            })

            if (userToken.username == username_sendto) {
                return res.status(403).json({ error: 'friend request to same user (debugging only)' });
            }

            query = 'SELECT user_id from users WHERE username = $1';
            results = await client.query(query, [userToken.username]);

            const user_id = results.rows[0].user_id;*/
            //verify friendship table
            query = 'SELECT * from friend_request WHERE user_id = $1 AND user_request_id = $2';
            result = await client.query(query, [results.user_id, results.user_request_id]);

            if (result.rowCount == 0)
                return res.status(401).json({ error: 'No friend request send!' });

            query = 'DELETE FROM friend_request WHERE user_id = $1 AND user_request_id = $2';
            await client.query(query, [results.user_id, results.user_request_id]);

            const { first_name, last_name, avatar } = results.return_param;
            res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: false, friend_request_status: "none" });

        } else if (req.body.actions == 'remove_friend') {
            //nou
            var results = await friends_actions(req);
            const username_sendto = results.username_sendto;

            if (results.err != 200) {
                if (results.err == 403) {
                    return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                }
                if (results.err == 404) {
                    return res.status(404).json({ error: "That username does not exist!" });
                }
            }
            //nou
            /*
            const username_sendto = req.params.id;

            var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
            var results = await client.query(query, [username_sendto]);

            if (results.rowCount == 0)
                return res.status(404).json({ error: "That username does not exist!" });

            const user_request_id = results.rows[0].user_id;
            const return_param = results.rows[0];
            const authHeader = req.headers.authorization;

            const token = authHeader.split(' ')[1];
            let userToken;
            jwt.verify(token, process.env.JWT_KEY, (err, username) => {
                if (err) {
                    return null;
                }
                userToken = username;
            })

            if (userToken.username == username_sendto) {
                return res.status(403).json({ error: 'You cant remove you... (debugging only)' });
            }

            query = 'SELECT user_id from users WHERE username = $1';
            results = await client.query(query, [userToken.username]);

            const user_id = results.rows[0].user_id;*/

            //verify friendship table
            //trebuie modificat
            query = 'SELECT * from friendship WHERE first_user_id = $1 AND second_user_id = $2';
            result = await client.query(query, [results.user_id, results.user_request_id]);

            const { first_name, last_name, avatar } = results.return_param;

            if (result.rowCount != 0) {
                query = 'DELETE FROM friendship WHERE first_user_id = $1 AND second_user_id = $2';
                await client.query(query, [results.user_id, results.user_request_id]);
                res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: false, friend_request_status: "none" });
            }

            query = 'SELECT * from friendship WHERE first_user_id = $2 AND second_user_id = $1';
            result = await client.query(query, [results.user_id, results.user_request_id]);

            if (result.rowCount != 0) {
                query = 'DELETE FROM friendship WHERE first_user_id = $2 AND second_user_id = $1';
                await client.query(query, [results.user_id, results.user_request_id]);
                res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: false, friend_request_status: "none" });
            }

            res.status(400).json({ error: 'User is not a friend!' });

        } else if (req.body.actions == 'accept_friend_request') {
            //nou
            var results = await friends_actions(req);
            const username_sendto = results.username_sendto;

            if (results.err != 200) {
                if (results.err == 403) {
                    return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                }
                if (results.err == 404) {
                    return res.status(404).json({ error: "That username does not exist!" });
                }
            }
            //nou
            /*

            const username_sendto = req.params.id;

            var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
            var results = await client.query(query, [username_sendto]);

            if (results.rowCount == 0)
                return res.status(404).json({ error: "That username does not exist!" });

            const user_request_id = results.rows[0].user_id;
            const return_param = results.rows[0];
            const authHeader = req.headers.authorization;

            const token = authHeader.split(' ')[1];
            let userToken;
            jwt.verify(token, process.env.JWT_KEY, (err, username) => {
                if (err) {
                    return null;
                }
                userToken = username;
            })

            if (userToken.username == username_sendto) {
                return res.status(400).json({ error: 'friend request to same user (debugging only)' });
            }

            query = 'SELECT user_id from users WHERE username = $1';
            results = await client.query(query, [userToken.username]);

            const user_id = results.rows[0].user_id;*/


            //verify friend_request table
            query = 'SELECT * from friend_request WHERE user_id = $2 AND user_request_id = $1';
            result = await client.query(query, [results.user_id, results.user_request_id]);
            //console.log(result);

            if (result.rowCount == 0)
                return res.status(401).json({ error: 'No friend request received!' });

            query = 'DELETE FROM friend_request WHERE user_id = $2 AND user_request_id = $1';
            await client.query(query, [results.user_id, results.user_request_id]);

            query = 'INSERT INTO friendship(first_user_id, second_user_id) values($1, $2)';
            await client.query(query, [results.user_id, results.user_request_id]);

            const { first_name, last_name, avatar } = results.return_param;
            res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: true, friend_request_status: "none" });

        } else if (req.body.actions == 'decline_friend_request') {
            //nou
            var results = await friends_actions(req);
            const username_sendto = results.username_sendto;

            if (results.err != 200) {
                if (results.err == 403) {
                    return res.status(403).json({ error: 'friend request to same user (debugging only)' });
                }
                if (results.err == 404) {
                    return res.status(404).json({ error: "That username does not exist!" });
                }
            }
            //nou
            /*
            const username_sendto = req.params.id;

            var query = 'SELECT user_id, first_name, last_name, avatar from users WHERE username = $1';
            var results = await client.query(query, [username_sendto]);

            if (results.rowCount == 0)
                return res.status(404).json({ error: "That username does not exist!" });

            const user_request_id = results.rows[0].user_id;
            const return_param = results.rows[0];
            const authHeader = req.headers.authorization;

            const token = authHeader.split(' ')[1];
            let userToken;
            jwt.verify(token, process.env.JWT_KEY, (err, username) => {
                if (err) {
                    return null;
                }
                userToken = username;
            })

            if (userToken.username == username_sendto) {
                return res.status(400).json({ error: 'friend request to same user (debugging only)' });
            }

            query = 'SELECT user_id from users WHERE username = $1';
            results = await client.query(query, [userToken.username]);

            const user_id = results.rows[0].user_id;*/


            //verify friend_request table
            query = 'SELECT * from friend_request WHERE user_id = $2 AND user_request_id = $1';
            result = await client.query(query, [results.user_id, results.user_request_id]);
            console.log(result);

            if (result.rowCount == 0)
                return res.status(401).json({ error: 'No friend request received!' });

            query = 'DELETE FROM friend_request WHERE user_id = $2 AND user_request_id = $1';
            await client.query(query, [results.user_id, results.user_request_id]);

            const { first_name, last_name, avatar } = results.return_param;
            res.status(200).json({ username_sendto, first_name, last_name, avatar, friendship_status: false, friend_request_status: "none" });
        }
    })

router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    //verify token receive is not null
    if (!authHeader) {
        return res.status(403).json({ error: 'Invalid token!', message: 'No token received!' })
    }

    const token = authHeader.split(' ')[1];
    let userToken;
    jwt.verify(token, process.env.JWT_KEY, (err, username) => {
        if (err) {
            return null;
        }
        userToken = username;
    })

    if (!userToken) {
        return res.status(403).json({ error: 'Invalid token!' });
    }
    var query = 'select ur.username, ur.first_name, ur.last_name, ur.avatar from users u, users ur, friend_request r where u.username = $1 and r.user_request_id = u.user_id and ur.user_id = r.user_id';
    var result = await client.query(query, [userToken.username]);
    res.status(200).json((result.rows));
})


module.exports = router;
