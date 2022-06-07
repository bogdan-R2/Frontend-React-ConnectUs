const express = require('express');
const http = require('http');
const app = express();
const port = 3001;
const routes = require('./src/routes/route.js');
const bodyParser = require("body-parser");
const client = require('./src/db/database.js');
const authRoute = require('./src/routes/auth.js');
const env = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const socket = require('socket.io');

app.use(cors());
env.config()



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const authJWT = (req, res, next) => {

    const nonSecurePaths = ['/', '/login', '/register'];
    if (nonSecurePaths.includes(req.path)) return next();

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        let userToken;
        jwt.verify(token, process.env.JWT_KEY, (err, username) => {
            userToken = username;
        })
        if (!userToken) {
            return res.status(403).json({ error: 'Invalid token!' });
        }
        next();
    }
    else {
        return res.status(403).json({ error: 'Please log in!' });
    }
}
app.use('/', authJWT, routes);

const server = http.createServer(app);
const SocketServer = require('./src/socket/socket.js');
SocketServer(server);

server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});




