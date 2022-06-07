const { Pool, Client } = require('pg')
const fs = require('fs')

const client = new Client(
    {
        user: 'doadmin',
        host: 'db-postgresql-fra1-06655-do-user-9114632-0.b.db.ondigitalocean.com',
        database: 'defaultdb',
        password: 'taunb33leac3zrez',
        port: 25060,
        ssl: require,
        ssl: {
            ca: fs.readFileSync('ssl/ca-certificate.crt.txt'),
            rejectUnauthorized: true,
        }
    }
)


client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')
    }
})


module.exports = client;