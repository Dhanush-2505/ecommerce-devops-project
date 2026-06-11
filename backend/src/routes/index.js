const express  = require('express');
const router   = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

const { register, login, me }                              = require('../controllers/authController');
const { getProducts, getProduct, createProduct,
        updateProduct, deleteProduct }                     = require('../controllers/productController');
const { getCart, addToCart, updateCart, removeFromCart }   = require('../controllers/cartController');
const { placeOrder, getOrders, getOrder,
        updateOrderStatus }                                = require('../controllers/orderController');
const pool = require('../config/db');

// ── Auth ──────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login',    login);
router.get ('/auth/me',       auth, me);

// ── Products ──────────────────────────────────────
router.get   ('/products',       getProducts);
router.get   ('/products/:id',   getProduct);
router.post  ('/products',       adminAuth, createProduct);
router.put   ('/products/:id',   adminAuth, updateProduct);
router.delete('/products/:id',   adminAuth, deleteProduct);

// ── Categories ────────────────────────────────────
router.get('/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(result.rows);
});

// ── Cart ──────────────────────────────────────────
router.get   ('/cart',       auth, getCart);
router.post  ('/cart',       auth, addToCart);
router.put   ('/cart/:id',   auth, updateCart);
router.delete('/cart/:id',   auth, removeFromCart);

// ── Orders ────────────────────────────────────────
router.post('/orders',              auth,      placeOrder);
router.get ('/orders',              auth,      getOrders);
router.get ('/orders/:id',          auth,      getOrder);
router.put ('/orders/:id/status',   adminAuth, updateOrderStatus);

// ── Admin stats ───────────────────────────────────
router.get('/admin/stats', adminAuth, async (req, res) => {
  const [users, products, orders, revenue] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query('SELECT COUNT(*) FROM products'),
    pool.query('SELECT COUNT(*) FROM orders'),
    pool.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status!='cancelled'"),
  ]);
  res.json({
    users:    parseInt(users.rows[0].count),
    products: parseInt(products.rows[0].count),
    orders:   parseInt(orders.rows[0].count),
    revenue:  parseFloat(revenue.rows[0].total),
  });
});

module.exports = router;
