const pool = require('../config/db');

// GET /api/products
const getProducts = async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let query  = 'SELECT p.*,c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE 1=1';
  let params = [];

  if (category) { params.push(category); query += ` AND c.slug=$${params.length}`; }
  if (search)   { params.push(`%${search}%`); query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }

  query += ` ORDER BY p.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);
    const count  = await pool.query('SELECT COUNT(*) FROM products');
    res.json({ products: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*,c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price required' });
  try {
    const result = await pool.query(
      'INSERT INTO products (name,description,price,stock,image_url,category_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, price, stock || 0, image_url, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1,description=$2,price=$3,stock=$4,image_url=$5,
       category_id=$6,updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, description, price, stock, image_url, category_id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
