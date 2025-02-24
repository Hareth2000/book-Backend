require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

// إضافة كتاب جديد
app.post('/books', async (req, res) => {
    const { title, author, genre, publication_date, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO books (title, author, genre, publication_date, description, is_deleted) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *',
            [title, author, genre, publication_date, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// جلب جميع الكتب غير المحذوفة
app.get('/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books WHERE is_deleted IS FALSE');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// تحديث بيانات كتاب
app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, publication_date, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE books SET title=$1, author=$2, genre=$3, publication_date=$4, description=$5 WHERE id=$6 RETURNING *',
            [title, author, genre, publication_date, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// حذف كتاب (Soft Delete)
app.put('/books/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE books SET is_deleted = TRUE WHERE id=$1 RETURNING *', [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: 'Book deleted (soft delete)', book: result.rows[0] });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// استرجاع كتاب محذوف
app.put('/books/restore/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE books SET is_deleted = FALSE WHERE id=$1 RETURNING *', [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Book not found or already active" });
        }

        res.json({ message: 'Book restored', book: result.rows[0] });
    } catch (error) {
        console.error("Error restoring book:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// تشغيل الخادم
app.listen(5000, () => console.log('Server running on port 5000'));