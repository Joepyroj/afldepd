const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'C0nstruks1',
    database: 'idoltalk',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create tables if not exist
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content TEXT NOT NULL,
                author VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT,
                content TEXT NOT NULL,
                author VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Initialize database on server start
initializeDatabase();

// Route default untuk mengarahkan ke index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Endpoint untuk mendapatkan semua postingan dengan balasannya
app.get('/posts', async (req, res) => {
    try {
        const [posts] = await pool.query(`
            SELECT p.*, 
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'content', r.content, 
                           'author', r.author
                       )
                   ) as replies
            FROM posts p
            LEFT JOIN replies r ON p.id = r.post_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        // Transform posts to match the previous mongoose structure
        const formattedPosts = posts.map(post => ({
            _id: post.id,
            content: post.content,
            author: post.author,
            replies: JSON.parse(post.replies)[0].content ? JSON.parse(post.replies) : []
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk membuat postingan baru
app.post('/posts', async (req, res) => {
    try {
        const { content, author } = req.body;
        const [result] = await pool.query(
            'INSERT INTO posts (content, author) VALUES (?, ?)',
            [content, author]
        );

        const [newPost] = await pool.query(
            'SELECT * FROM posts WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            _id: newPost[0].id,
            content: newPost[0].content,
            author: newPost[0].author,
            replies: []
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// Endpoint untuk membalas postingan
app.post('/posts/:id/reply', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, author } = req.body;

        await pool.query(
            'INSERT INTO replies (post_id, content, author) VALUES (?, ?, ?)',
            [id, content, author]
        );

        const [posts] = await pool.query(`
            SELECT p.*, 
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'content', r.content, 
                           'author', r.author
                       )
                   ) as replies
            FROM posts p
            LEFT JOIN replies r ON p.id = r.post_id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]);

        const formattedPost = {
            _id: posts[0].id,
            content: posts[0].content,
            author: posts[0].author,
            replies: JSON.parse(posts[0].replies)
        };

        res.json(formattedPost);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// Endpoint untuk menghapus postingan
app.delete('/posts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});