const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const client = require('../db/database.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const env = require('dotenv')
const jwt = require('jsonwebtoken');

env.config()

function generateAccessToken(username) {
    return jwt.sign({ username }, process.env.JWT_KEY, {expiresIn:"7200s"});
}

router.post('/register',
    body('username').isLength({ min: 3, max: 18 }),
    body('password').isLength({ min: 8, max: 18 }),
    body('first_name').isAlpha().isLength({ min: 2 }),
    body('last_name').isAlpha().isLength({ min: 2 }),
    body('email').isEmail(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password, first_name, last_name, email } = req.body;
        const hash_password = await bcrypt.hash(password, saltRounds);
        const values = [username, first_name, last_name, hash_password, email];

        //username verification
        var query = 'SELECT username from users WHERE username = $1';
        var success = await client.query(query, [username]);

        if (success.rowCount != 0)
            return res.status(401).json({ message: "This username is already being used!" });

        //email verification
        query = 'SELECT username from users WHERE email = $1';
        success = await client.query(query, [email]);

        if (success.rowCount != 0)
            return res.status(401).json({ message: "This email address is already being used!" });

        //send data to database
        query = 'INSERT INTO users(username, first_name, last_name, password, email) values($1, $2, $3, $4, $5) RETURNING *';
        success = await client.query(query, values);

        var token = generateAccessToken(username);
        res.send({ token });


    })

router.post(
    '/login',
    body('username'),
    body('password'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const query = 'SELECT * from users WHERE username = $1'
        var values = [username]

        const results = await client.query(query, values);
        if (results.rowCount == 0)
            return res.status(401).json({ message: 'Wrong username or password!' })

        const hash_password = (await client.query(query, values)).rows[0].password;

        if (!bcrypt.compareSync(password, hash_password)) {
            return res.status(401).json({ message: 'Wrong username or password!' })
        }

        var token = generateAccessToken(username);
        res.send({ token });
    })

router.get('/getcurrentuser',
    async (req, res) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(403).json({ error: 'No token provided, please log in' });
        }
        const user = await jwt.verify(token, process.env.JWT_KEY, (err, username) => {
            if (err) return err;
            return username;
        });
        if (!user.username)
            return res.status(403).json({ error: 'Invalid token!' });

        const query = 'SELECT * from users WHERE username = $1'
        var values = [user.username]

        const results = await client.query(query, values);
        if (results.rowCount == 0)
            return res.status(403).json({ error: 'Invalid token!' });

        const { username, first_name, last_name, avatar, email, user_id} = results.rows[0];
        return res.json({ username, first_name, last_name, avatar, email, user_id}  );
    })
module.exports = router;