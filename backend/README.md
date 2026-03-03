# 📦 FinTrack Backend API

## 📊 FinTrack – Full-Stack Budget & Expense Management App

FinTrack is a **production-ready full-stack finance management application** that helps users **track budgets, manage expenses, and view financial analytics** across **Mobile (Android & iOS)** and **Web**.

Built using a modern, scalable stack with **clean architecture**, **secure authentication**, and **responsive UI**.

---

> Backend service for **FinTrack**, a full-stack finance management mobile application.
> Built with **Node.js, Express, MongoDB**, and **JWT authentication**, following a clean MVC architecture.

---

## 🚀 Features

- 🔐 User authentication (Register / Login)
- 🪪 JWT-based authorization middleware
- 💰 Budget management
- 🧾 Expense tracking
- 📊 Dashboard analytics
- 👤 User profile management
- 🧱 Modular MVC architecture
- ⚠️ Centralized error handling
- 🔒 Secure environment variable handling

---

## 🛠️ Tech Stack

| Technology     | Usage                 |
| -------------- | --------------------- |
| **Node.js**    | Runtime               |
| **Express.js** | Web framework         |
| **MongoDB**    | Database              |
| **Mongoose**   | ODM                   |
| **JWT**        | Authentication        |
| **bcrypt**     | Password hashing      |
| **dotenv**     | Environment variables |

---

## 📁 Folder Structure

```text
backend/
├── src/
│   ├── config/          # App & DB configuration
│   │   ├── db.js        # MongoDB connection
│   │   └── env.js       # Environment variable loader
│   │
│   ├── controllers/     # Request handlers (business logic)
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── expense.controller.js
│   │   └── profile.controller.js
│   │
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/          # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── Budget.model.js
│   │   └── Expense.model.js
│   │
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── expense.routes.js
│   │   └── profile.routes.js
│   │
│   ├── utils/           # Helper utilities
│   │   ├── apiError.js
│   │   └── generateToken.js
│   │
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
│
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **backend root**:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

> ⚠️ Never commit `.env` files to GitHub.

---

## 📦 Installation & Setup

### 1️⃣ Navigate to backend folder

```bash
cd backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start development server

```bash
npm run dev
```

or (production):

```bash
npm start
```

---

## 🔐 Authentication Flow

1. User registers → password hashed with `bcrypt`
2. User logs in → JWT token generated
3. Token sent via `Authorization` header
4. Protected routes validated using `auth.middleware.js`

---

## 🔗 API Endpoints (Overview)

### Auth

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register user |
| POST   | `/api/auth/login`    | Login user    |

### Budgets

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/api/budgets`     |
| POST   | `/api/budgets`     |
| PUT    | `/api/budgets/:id` |
| DELETE | `/api/budgets/:id` |

### Expenses

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | `/api/expenses`     |
| POST   | `/api/expenses`     |
| PUT    | `/api/expenses/:id` |
| DELETE | `/api/expenses/:id` |

### Dashboard

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/api/dashboard` |

### Profile

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/api/profile` |
| PUT    | `/api/profile` |

> 🔐 Most routes require a valid JWT token.

---

## ⚠️ Error Handling

- Centralized error handling via `error.middleware.js`
- Custom API errors using `ApiError` utility
- Consistent error responses for frontend consumption

---

## 🧪 Scripts

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

---

## 🚀 Deployment Notes

- Ensure `NODE_ENV=production`
- Use hosted MongoDB (MongoDB Atlas)
- Add environment variables on hosting platform
- Enable CORS if frontend is hosted separately

---

## 📌 Future Improvements

- Refresh tokens
- Role-based access control (RBAC)
- Rate limiting
- API documentation with Swagger
- Unit & integration tests

---

## 👨‍💻 Author

**Satinder Singh**
Full-Stack Developer
📱 React Native | 🌐 Node.js | 🍃 MongoDB

---
