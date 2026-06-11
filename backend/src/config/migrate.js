const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Running migrations...');

    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20) DEFAULT 'customer',
        created_at  TIMESTAMP DEFAULT NOW()
      );

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        slug        VARCHAR(100) UNIQUE NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW()
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(200) NOT NULL,
        description   TEXT,
        price         DECIMAL(10,2) NOT NULL,
        stock         INTEGER DEFAULT 0,
        image_url     VARCHAR(500),
        category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount  DECIMAL(10,2) NOT NULL,
        status        VARCHAR(50) DEFAULT 'pending',
        address       TEXT,
        phone         VARCHAR(20),
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity    INTEGER NOT NULL,
        price       DECIMAL(10,2) NOT NULL
      );

      -- Cart table
      CREATE TABLE IF NOT EXISTS cart (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity    INTEGER NOT NULL DEFAULT 1,
        created_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);

    // Seed default categories
    await client.query(`
      INSERT INTO categories (name, slug) VALUES
        ('Electronics', 'electronics'),
        ('Clothing', 'clothing'),
        ('Books', 'books'),
        ('Home & Kitchen', 'home-kitchen'),
        ('Sports', 'sports')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Seed sample products
    await client.query(`
      INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
        ('Wireless Headphones', 'Premium noise-cancelling headphones', 2999.00, 50,
         'https://via.placeholder.com/400x400?text=Headphones', 1),
        ('Running Shoes', 'Lightweight breathable running shoes', 1499.00, 100,
         'https://via.placeholder.com/400x400?text=Shoes', 2),
        ('JavaScript Book', 'Complete guide to modern JavaScript', 599.00, 30,
         'https://via.placeholder.com/400x400?text=JS+Book', 3),
        ('Coffee Maker', 'Automatic drip coffee maker 12 cups', 3499.00, 25,
         'https://via.placeholder.com/400x400?text=Coffee+Maker', 4),
        ('Yoga Mat', 'Non-slip premium yoga mat 6mm', 799.00, 75,
         'https://via.placeholder.com/400x400?text=Yoga+Mat', 5),
        ('Smart Watch', 'Fitness tracking smartwatch with GPS', 5999.00, 40,
         'https://via.placeholder.com/400x400?text=Smart+Watch', 1)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrate();
