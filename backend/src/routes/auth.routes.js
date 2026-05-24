const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, hash, name]
    );
    const token = jwt.sign({ id: rows[0].id, email }, config.jwt.secret, { expiresIn: config.jwt.expiry });
    res.status(201).json({ success: true, data: { user: rows[0], token } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query(`SELECT id, email, name, password_hash FROM users WHERE email = $1`, [email]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return next(new AppError('Invalid credentials', 401));
    }
    const token = jwt.sign({ id: rows[0].id, email }, config.jwt.secret, { expiresIn: config.jwt.expiry });
    res.json({ success: true, data: { user: { id: rows[0].id, email: rows[0].email, name: rows[0].name }, token } });
  } catch (err) { next(err); }
});

module.exports = router;
