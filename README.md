> [!IMPORTANT]
> **This repository is archived and read-only.** The Medi Cloud API now lives in the
> [medi-cloud monorepo](https://github.com/ikbal-hussain/medi-cloud) under [`apps/api`](https://github.com/ikbal-hussain/medi-cloud/tree/main/apps/api),
> rewritten in TypeScript on PostgreSQL. The live API at https://medi-cloud-backend.vercel.app/api is built from there
> ([interactive API docs](https://medi-cloud-backend.vercel.app/api/docs)). The MongoDB code below is kept for history only.

# 🏥 Medi Cloud Backend

> A robust RESTful API for hospital management system with multi-tenant architecture, JWT authentication, and role-based access control.

**🌐 Live API:** `https://medi-cloud-backend.vercel.app/api` (on Vercel)

**Health Check:** [https://medi-cloud-backend.vercel.app/api/health](https://medi-cloud-backend.vercel.app/api/health)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control (RBAC)** - 4 distinct user roles with granular permissions
- 🏢 **Multi-Tenant Architecture** - Complete data isolation per hospital
- 📊 **MongoDB Database** - Scalable NoSQL data storage
- 🛡️ **Secure Password Hashing** - Bcrypt encryption for passwords
- 🚀 **RESTful API** - Clean and intuitive API endpoints

---

## 🎭 User Roles

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full system access across all tenants |
| **HOSPITAL_ADMIN** | Manage users, patients, and view prescriptions within their hospital |
| **DOCTOR** | Create and manage prescriptions, view patients |
| **RECEPTIONIST** | Manage patients (add, update, delete) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ikbal-hussain/medi-cloud-backend.git
   cd medi-cloud-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/medi-cloud
   JWT_SECRET=your-super-secret-jwt-key-change
   NODE_ENV=development
   ```

   On Vercel, `MONGODB_URI` and `JWT_SECRET` must be set: there's no fallback for them once deployed. `CORS_ORIGINS` lists the app origins allowed to call the API (comma-separated; defaults to `https://medi-cloud-app.netlify.app`).

4. **Initialize demo data (Optional)**
   ```bash
   npm run init:demo
   ```
   
   This creates demo hospitals and users:
   - **City Hospital Admin**: `admin@city.com` / `admin123`
   - **City Hospital Doctor**: `doc@city.com` / `doc123`
   - **City Hospital Receptionist**: `nurse@city.com` / `nurse123`
   - **Galaxy Care Admin**: `admin@galaxy.com` / `admin123`

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will run on `http://localhost:3000`

---

## 📚 API Documentation

Base URL: `https://medi-cloud-backend.vercel.app` (Production; endpoints below include `/api`)  
Local: `http://localhost:3000` (Development)

### 🔑 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new hospital | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### 👥 User Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | Get all users | HOSPITAL_ADMIN, SUPER_ADMIN |
| `GET` | `/api/users/:id` | Get single user | HOSPITAL_ADMIN, SUPER_ADMIN |
| `POST` | `/api/users` | Create user | HOSPITAL_ADMIN, SUPER_ADMIN |
| `PUT` | `/api/users/:id` | Update user | HOSPITAL_ADMIN, SUPER_ADMIN |
| `DELETE` | `/api/users/:id` | Delete user | HOSPITAL_ADMIN, SUPER_ADMIN |

### 🏢 Tenant Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/tenants` | Get all tenants | SUPER_ADMIN |
| `GET` | `/api/tenants/:id` | Get single tenant | SUPER_ADMIN |

### 🏥 Patient Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/patients` | Get all patients | All authenticated users |
| `GET` | `/api/patients/:id` | Get single patient | All authenticated users |
| `POST` | `/api/patients` | Create patient | All authenticated users |
| `PUT` | `/api/patients/:id` | Update patient | All authenticated users |
| `DELETE` | `/api/patients/:id` | Delete patient | HOSPITAL_ADMIN, RECEPTIONIST |

### 💊 Prescription Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `GET` | `/api/prescriptions` | Get all prescriptions | All authenticated users |
| `GET` | `/api/prescriptions/:id` | Get single prescription | All authenticated users |
| `POST` | `/api/prescriptions` | Create prescription | DOCTOR |
| `PUT` | `/api/prescriptions/:id` | Update prescription | DOCTOR |
| `DELETE` | `/api/prescriptions/:id` | Delete prescription | DOCTOR, HOSPITAL_ADMIN |

### ❤️ Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Server health status | ❌ |

---

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Example Request

```bash
curl -X GET https://medi-cloud-backend.vercel.app/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment:** dotenv

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run init:admin` | Initialize SUPER_ADMIN user |
| `npm run init:demo` | Initialize demo data with hospitals and users |

---

## 📝 Example API Usage

### Register a Hospital

```bash
curl -X POST https://medi-cloud-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalName": "City Hospital",
    "adminEmail": "admin@city.com",
    "adminName": "Dr. John Doe",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST https://medi-cloud-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@city.com",
    "password": "securepassword123"
  }'
```

### Get Patients (Authenticated)

```bash
curl -X GET https://medi-cloud-backend.vercel.app/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏗️ Project Structure

```
medi-cloud-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── rbac.js              # Role-based access control
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Tenant.js            # Tenant (Hospital) model
│   │   ├── Patient.js           # Patient model
│   │   └── Prescription.js      # Prescription model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User routes
│   │   ├── tenants.js           # Tenant routes
│   │   ├── patients.js          # Patient routes
│   │   └── prescriptions.js     # Prescription routes
│   ├── scripts/
│   │   ├── initSuperAdmin.js    # Initialize SUPER_ADMIN
│   │   └── initDemoData.js      # Initialize demo data
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   ├── app.js                    # Express app (shared by server.js and Vercel)
│   └── server.js                 # Local server
├── api/index.js                  # Vercel entry point
├── vercel.json                   # Vercel config
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Multi-tenant data isolation
- ✅ CORS limited to the app's origins (`CORS_ORIGINS`)
- ✅ Input validation and error handling

---

## 👤 Author

**Ikbal Hussain**

- GitHub: [@ikbal-hussain](https://github.com/ikbal-hussain)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**⭐ If you find this project helpful, please consider giving it a star!**
