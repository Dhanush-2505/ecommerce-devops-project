# 🛒 ShopZone — Complete E-Commerce Project Guide
## React + Node.js + PostgreSQL → Deployed on AWS

---

## 📁 Project Structure

```
ecommerce/
├── backend/                    ← Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           ← PostgreSQL connection
│   │   │   └── migrate.js      ← DB tables + seed data
│   │   ├── controllers/
│   │   │   ├── authController.js    ← Register / Login
│   │   │   ├── productController.js ← CRUD products
│   │   │   ├── cartController.js    ← Cart operations
│   │   │   └── orderController.js   ← Place / track orders
│   │   ├── middleware/
│   │   │   └── auth.js         ← JWT verification
│   │   ├── routes/
│   │   │   └── index.js        ← All API routes
│   │   └── server.js           ← Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                   ← React app
│   ├── src/
│   │   ├── components/Navbar/   ← Navigation bar
│   │   ├── context/AppContext.js ← Auth + Cart state
│   │   ├── pages/
│   │   │   ├── Home/            ← Product listing + search
│   │   │   ├── Product/         ← Product detail
│   │   │   ├── Cart/            ← Cart + checkout
│   │   │   ├── Login/           ← Login page
│   │   │   ├── Register/        ← Register page
│   │   │   ├── Orders/          ← Order history
│   │   │   └── Admin/           ← Admin dashboard
│   │   ├── utils/api.js         ← Axios instance
│   │   ├── App.js               ← Routes
│   │   └── App.css              ← All styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml          ← Local dev environment
└── GUIDE.md                    ← This file
```

---

## 🗄️ Database Schema

```
users          → id, name, email, password, role
categories     → id, name, slug
products       → id, name, description, price, stock, image_url, category_id
cart           → id, user_id, product_id, quantity
orders         → id, user_id, total_amount, status, address, phone
order_items    → id, order_id, product_id, quantity, price
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint           | Auth | Description     |
|--------|--------------------|------|-----------------|
| POST   | /api/auth/register | ✗    | Register user   |
| POST   | /api/auth/login    | ✗    | Login           |
| GET    | /api/auth/me       | ✓    | Get current user|

### Products
| Method | Endpoint           | Auth  | Description       |
|--------|--------------------|-------|-------------------|
| GET    | /api/products      | ✗     | List + search     |
| GET    | /api/products/:id  | ✗     | Product detail    |
| POST   | /api/products      | Admin | Create product    |
| PUT    | /api/products/:id  | Admin | Update product    |
| DELETE | /api/products/:id  | Admin | Delete product    |

### Cart
| Method | Endpoint     | Auth | Description    |
|--------|--------------|------|----------------|
| GET    | /api/cart    | ✓    | Get cart       |
| POST   | /api/cart    | ✓    | Add to cart    |
| PUT    | /api/cart/:id| ✓    | Update qty     |
| DELETE | /api/cart/:id| ✓    | Remove item    |

### Orders
| Method | Endpoint              | Auth  | Description    |
|--------|-----------------------|-------|----------------|
| POST   | /api/orders           | ✓     | Place order    |
| GET    | /api/orders           | ✓     | My orders      |
| GET    | /api/orders/:id       | ✓     | Order detail   |
| PUT    | /api/orders/:id/status| Admin | Update status  |

### Admin
| Method | Endpoint      | Auth  | Description  |
|--------|---------------|-------|--------------|
| GET    | /api/admin/stats | Admin | Dashboard stats |

---

## 🚀 LOCAL SETUP (Step by Step)

### Prerequisites
- Node.js v18+
- Docker + Docker Compose
- Git

### Option A — Docker (Easiest)

```bash
# 1. Clone / create project
cd ecommerce

# 2. Start everything
docker-compose up -d

# 3. Run database migrations (first time only)
docker exec -it ecommerce_backend_1 node src/config/migrate.js

# 4. Open browser
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# API docs:  http://localhost:5000/health
```

### Option B — Manual Setup

```bash
# === BACKEND ===
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL details

npm install
node src/config/migrate.js    # Create tables + seed data
npm run dev                    # Start on port 5000

# === FRONTEND ===
cd ../frontend
npm install
npm start                      # Start on port 3000
```

---

## 👤 First Admin User

After running migrations, manually promote a user to admin:

```sql
-- Connect to PostgreSQL
-- After registering via the UI, run:
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or via CLI:
```bash
# Docker
docker exec -it ecommerce_db_1 psql -U postgres -d ecommerce \
  -c "UPDATE users SET role='admin' WHERE email='your@email.com';"

# Direct psql
psql -h localhost -U postgres -d ecommerce \
  -c "UPDATE users SET role='admin' WHERE email='your@email.com';"
```

---

## ☁️ AWS DEPLOYMENT (EC2 + RDS)

### Architecture
```
Internet
   ↓
Route 53 (domain)
   ↓
ALB (Application Load Balancer) — public subnet
   ↓
EC2 (Docker containers) — private subnet
   ↓
RDS PostgreSQL — private subnet (no public access)
```

### Step 1 — Create RDS PostgreSQL

```bash
# In AWS Console:
RDS → Create Database
  Engine:       PostgreSQL 15
  Template:     Free tier (dev) / Production
  DB name:      ecommerce
  Username:     postgres
  Password:     YourStrongPassword
  Instance:     db.t3.micro (dev) / db.t3.small (prod)
  Storage:      20 GB gp2
  VPC:          Your VPC
  Subnet group: Private subnets
  Public access: NO ← Important!
  SG:           Allow 5432 from EC2 SG only
```

### Step 2 — Create EC2 Instance

```bash
# In AWS Console:
EC2 → Launch Instance
  AMI:          Ubuntu 22.04 LTS
  Type:         t3.medium (2 vCPU, 4GB RAM)
  VPC:          Your VPC
  Subnet:       Private subnet
  SG:           Allow 80, 443 from ALB SG; 22 from bastion
  Storage:      30 GB gp3
  IAM role:     EC2-ECR-ReadOnly (to pull from ECR)
```

### Step 3 — Install Docker on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@<ec2-ip>

# Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
sudo systemctl enable docker && sudo systemctl start docker

# Logout and login again for docker group
exit
```

### Step 4 — Create ECR Repositories

```bash
# Create repos
aws ecr create-repository --repository-name shopzone-backend --region ap-south-1
aws ecr create-repository --repository-name shopzone-frontend --region ap-south-1

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com
```

### Step 5 — Build and Push Images

```bash
ACCOUNT=<your-account-id>
REGION=ap-south-1
ECR=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com

# Backend
cd backend
docker build -t shopzone-backend .
docker tag shopzone-backend:latest $ECR/shopzone-backend:latest
docker push $ECR/shopzone-backend:latest

# Frontend
cd ../frontend
docker build -t shopzone-frontend .
docker tag shopzone-frontend:latest $ECR/shopzone-frontend:latest
docker push $ECR/shopzone-frontend:latest
```

### Step 6 — Deploy on EC2

```bash
# On EC2 — create production .env
cat > /home/ubuntu/backend.env << EOF
PORT=5000
NODE_ENV=production
DB_HOST=your-rds-endpoint.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=YourStrongPassword
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
EOF

# Pull and run backend
docker pull $ECR/shopzone-backend:latest
docker run -d \
  --name backend \
  --env-file /home/ubuntu/backend.env \
  -p 5000:5000 \
  --restart always \
  $ECR/shopzone-backend:latest

# Run DB migrations
docker exec backend node src/config/migrate.js

# Pull and run frontend
docker pull $ECR/shopzone-frontend:latest
docker run -d \
  --name frontend \
  -p 80:80 \
  --link backend:backend \
  --restart always \
  $ECR/shopzone-frontend:latest
```

### Step 7 — Create ALB

```bash
# In AWS Console:
EC2 → Load Balancers → Create ALB
  Name:     shopzone-alb
  Scheme:   Internet-facing
  VPC:      Your VPC
  Subnets:  Public subnets (2 AZs)
  SG:       Allow 80, 443 from 0.0.0.0/0

# Target Group:
  Name:     shopzone-tg
  Protocol: HTTP / Port 80
  Target:   Your EC2 instance
  Health:   GET /health

# Listener:
  Port 80 → forward to shopzone-tg
  Port 443 → forward to shopzone-tg (after SSL cert)
```

### Step 8 — Point Domain

```bash
# Route 53 → Hosted Zone → Create Record
# Type: A (Alias)
# Value: ALB DNS name
# yourdomain.com → ALB

# Or CNAME:
# www.yourdomain.com → alb-dns.ap-south-1.elb.amazonaws.com
```

### Step 9 — SSL Certificate (HTTPS)

```bash
# AWS Certificate Manager:
# Request cert for yourdomain.com
# Add DNS validation record to Route 53
# Attach cert to ALB Listener on port 443
# Add redirect: HTTP 80 → HTTPS 443
```

---

## 🔒 Security Checklist

- [ ] RDS in private subnet (no public access)
- [ ] EC2 in private subnet (behind ALB)
- [ ] SG: RDS allows only EC2 SG on port 5432
- [ ] SG: EC2 allows only ALB SG on port 80
- [ ] JWT_SECRET is strong random string
- [ ] DB password is strong
- [ ] HTTPS enabled via ACM
- [ ] .env files not committed to Git

---

## 🛠️ Useful Commands

```bash
# Check backend logs
docker logs -f backend

# Restart containers
docker restart backend frontend

# Connect to DB from EC2
docker exec -it backend node -e "require('./src/config/db').query('SELECT NOW()')"

# Check container status
docker ps

# Update to latest image
docker pull $ECR/shopzone-backend:latest
docker stop backend && docker rm backend
docker run -d --name backend ... (same run command)
```

---

## 🧪 Test API with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get products
curl http://localhost:5000/api/products

# Search products
curl "http://localhost:5000/api/products?search=headphone&category=electronics"
```
