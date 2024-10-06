const express = require('express')
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tilluveer22Rannu05',
    database: 'to-do-list'
});

db.connect(err => {
    if (err) {
        console.log('Error While Connecting to the Database', err);
        return;
    }
    console.log('Successfully Connected to the Database');
});

app.post('/signup', (req, res) => {
    try {
        const { username, email, password } = req.body;
        const checkUserSql = 'SELECT * FROM users WHERE username = ?';
        db.query(checkUserSql, [username], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database query failed' });
            }

            if (result.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const insertUserSql = 'INSERT INTO users (username, email, password) VALUES (?)';
            const values = [username, email, hashedPassword];

            db.query(insertUserSql, [values], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Signup failed' });
                }
                return res.status(200).json({ message: 'Signup successful' });
            });
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid details' });
    }
});



app.post('/signin', (req, res) => {
    const { email, password } = req.body;  

    const signinsql = 'SELECT password FROM users WHERE email = ?';

    db.query(signinsql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (result.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }
        const hashedPassword = result[0].password;

        if (typeof hashedPassword !== 'string') {
            return res.status(500).json({ error: 'Internal server error' });
        }

        const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
        if (isPasswordValid) {
            return res.status(200).json({ message: 'SignIn Successful' });
        } else {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }
    });
});

app.post('/todo', (req, res) => {
    try {
        const { username, title, task, date } = req.body;

        const usersql = 'SELECT * FROM users WHERE username = ?';
        db.query(usersql, [username], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database query failed for user' });
            }

            if (result.length === 0) {
                return res.status(400).json({ message: 'User not found' });
            }

            const user_id = result[0].user_id;

            const sql = 'INSERT INTO tasks (user_id, title, task, date) VALUES (?, ?, ?, ?)';
            const values = [user_id, title, task, date];

            db.query(sql, values, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to insert task' });
                }

                return res.status(200).json({ message: 'Task inserted successfully' });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error while inserting task' });
    }
});



app.listen(PORT, () => {
    console.log(`Server Running on PORT ${PORT}`);
});

