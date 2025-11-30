# Medi Cloud Backend

Hospital Management System Backend API

## Features

- **Authentication**: JWT-based authentication
- **RBAC**: Role-Based Access Control with 4 roles:
  - `SUPER_ADMIN`: Full system access
  - `HOSPITAL_ADMIN`: Hospital-level administration
  - `DOCTOR`: Can create and manage prescriptions
  - `RECEPTIONIST`: Can manage patients
- **Multi-tenant**: Each hospital is isolated
- **MongoDB**: Database for all data storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medi-cloud
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. (Optional) Initialize demo data with hospital admins:
```bash
npm run init:demo
```
This creates demo hospitals and users:
- **City Hospital Admin**: `admin@city.com` / `admin123`
- **City Hospital Doctor**: `doc@city.com` / `doc123`
- **City Hospital Receptionist**: `nurse@city.com` / `nurse123`
- **Galaxy Care Admin**: `admin@galaxy.com` / `admin123`

Or initialize a SUPER_ADMIN user:
```bash
npm run init:admin
```
This creates a default SUPER_ADMIN with:
- Email: `admin@medicloud.com`
- Password: `admin123`
⚠️ **Change the password after first login!**

5. Start the server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new hospital
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users (HOSPITAL_ADMIN, SUPER_ADMIN)
- `GET /api/users/:id` - Get single user (HOSPITAL_ADMIN, SUPER_ADMIN)
- `POST /api/users` - Create user (HOSPITAL_ADMIN, SUPER_ADMIN)
- `PUT /api/users/:id` - Update user (HOSPITAL_ADMIN, SUPER_ADMIN)
- `DELETE /api/users/:id` - Delete user (HOSPITAL_ADMIN, SUPER_ADMIN)

### Tenants
- `GET /api/tenants` - Get all tenants (SUPER_ADMIN only)
- `GET /api/tenants/:id` - Get single tenant (SUPER_ADMIN only)

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (HOSPITAL_ADMIN, RECEPTIONIST)

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get single prescription
- `POST /api/prescriptions` - Create prescription (DOCTOR only)
- `PUT /api/prescriptions/:id` - Update prescription (DOCTOR only)
- `DELETE /api/prescriptions/:id` - Delete prescription (DOCTOR, HOSPITAL_ADMIN)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role Permissions

- **SUPER_ADMIN**: Full access to all tenants and data
- **HOSPITAL_ADMIN**: Manage users, patients, and view prescriptions in their hospital
- **DOCTOR**: Create and manage prescriptions, view patients
- **RECEPTIONIST**: Manage patients
