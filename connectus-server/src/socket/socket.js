const socketIo = require('socket.io');
const { emit, user } = require('../db/database');
const options = {
    cors: true,
    origins: ['http://localhost:3000/']
};

const users = {};


const SocketServer = (server) => {
    const io = socketIo(server, options);


    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
            return next(new Error("invalid username"));
        }
        socket.username = username;
        if (users.hasOwnProperty(username)) {
            users[socket.username].emit('error_multiple_connections', {
                err: 'You have logged in from another tab'
            });
            users[socket.username].disconnect();
        }
        users[socket.username] = socket;
        next();
    });

    io.on('connection', (socket) => {
        // console.log(Object.keys(users));
        const { username } = socket;

        io.emit('login', {
            username
        });

        socket.on('friend_request', (response) => {
            const { user, secondUser } = response;

            if (users.hasOwnProperty(secondUser)) {
                console.log(users[secondUser].id);
                socket.to(users[secondUser].id).emit('friend_request', user);
            }
        });

        socket.on('get_online_users', (useri) => {
            users[socket.username].emit('get_online_users', {
                users: useri.users.map(user => ({
                    ...user,
                    online: users.hasOwnProperty(user.username)
                }))
            });
        })

        socket.on('logout', () => {
            io.emit('logout', {
                username: username
            });
        });


        socket.on('cancel_friend_request', (response) => {
            const { user, secondUser } = response;
            if (users.hasOwnProperty(secondUser)) {
                socket.to(users[secondUser].id).emit('cancel_friend_request', user);
            }
        });

        socket.on('decline_friend_request', (response) => {
            const { user, secondUser } = response;

            if (users.hasOwnProperty(secondUser)) {
                socket.to(users[secondUser].id).emit('decline_friend_request', user);
            }
        });

        socket.on('accept_friend_request', (response) => {
            const { user, secondUser } = response;
            user['online'] = users.hasOwnProperty(user.username)

            if (users.hasOwnProperty(secondUser)) {
                socket.to(users[secondUser].id).emit('accept_friend_request', user);
            }
        });

        socket.on('send_message', (response) => {
            const { user, secondUser, message, sent } = response;
            console.log(message);
            if (users.hasOwnProperty(secondUser)) {
                socket.to(users[secondUser].id).emit('receive_message', {
                    username: user.username,
                    message,
                    timestamp: sent
                });
            }
        })

        socket.on('disconnect', () => {
            users[username].disconnect();
            delete users[username];
            // console.log(Object.keys(users));
        })
    });
}

module.exports = SocketServer;
