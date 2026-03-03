# 📊 FinTrack – Full-Stack Budget & Expense Management App

FinTrack is a **production-ready full-stack finance management application** that helps users **track budgets, manage expenses, and view financial analytics** across **Mobile (Android & iOS)** and **Web**.

Built using a modern, scalable stack with **clean architecture**, **secure authentication**, and **responsive UI**.

---

## 🚀 Features

### 🔐 Authentication

- User registration & login
- Secure JWT-based authentication
- Password hashing with bcrypt
- User-specific data isolation

### 💰 Budget Management

- Create monthly budgets by category
- Visual progress tracking
- Budget limit alerts
- Edit & delete budgets

### 🧾 Expense Tracking

- Add, edit, delete expenses
- Categorized expenses
- Date-based expense history
- Optional notes for expenses

### 📊 Dashboard & Analytics

- Monthly financial summary
- Total budget vs expenses
- Remaining balance
- Category-wise insights (charts ready)

### 🌐 Cross-Platform Support

- Android (Expo)
- iOS (Expo)
- Web (Expo Router + React DOM)

---

## 🧱 Tech Stack

### Frontend (Mobile + Web)

- **Expo (latest)**
- **React Native**
- **Expo Router**
- **TypeScript**
- **NativeWind (TailwindCSS)**
- Zustand (state management)
- Axios (API calls)

### Backend

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- bcrypt (password hashing)

---

## 📁 Project Structure

```text
FinTrack Mobile App v2/
│
├── backend/                 # Node.js + Express API
│
└── mobile-app/              # Expo (Android, iOS, Web)
```

---

## 📂 Backend Structure

```text
backend/
├── src/
│   ├── config/              # DB & environment config
│   ├── controllers/         # Route logic
│   ├── middlewares/         # Auth & error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── utils/               # Helpers (JWT, errors)
│   ├── app.js               # Express app
│   └── server.js            # Server entry
└── package.json
```

---

## 📂 Mobile App Structure (Expo Router)

```text
mobile-app/
├── app/                     # Expo Router (navigation)
│   ├── _layout.tsx          # Root layout (auth gate)
│   ├── index.tsx            # Landing page
│   ├── login.tsx
│   ├── register.tsx
│   └── (tabs)/              # Authenticated tabs
│       ├── dashboard.tsx
│       ├── budgets.tsx
│       ├── expenses.tsx
│       └── analytics.tsx
│
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen logic
│   ├── services/            # API layer
│   ├── store/               # Zustand stores
│   ├── utils/               # Token storage, helpers
│   └── theme/               # Tailwind theme
│
├── global.css               # Tailwind base (web)
├── tailwind.config.js
├── babel.config.js
└── package.json
```

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token is stored securely:
   - **Mobile:** Expo SecureStore
   - **Web:** localStorage

4. Token is attached automatically via Axios interceptor
5. Protected routes are guarded using Expo Router layouts

---

## 🌐 API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
```

### Budgets

```http
POST   /api/budgets
GET    /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

### Expenses

```http
POST   /api/expenses
GET    /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

### Dashboard

```http
GET /api/dashboard/summary
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## ▶️ Running the Project

### 1️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

### 2️⃣ Mobile App (Expo)

```bash
cd mobile-app
npm install
npx expo start -c
```

Run on:

- Android Emulator
- iOS Simulator
- Web Browser

---

## 🎨 Styling (NativeWind)

- Tailwind utility classes via `className`
- Responsive & mobile-first UI
- Works across Android, iOS & Web
- Global styles loaded via `app/_layout.tsx`

---

## 🛡️ Security Considerations

- Passwords hashed using bcrypt
- JWT stored securely (platform-aware)
- Auth middleware protects user routes
- User-specific data isolation enforced

---

## 🧪 Development Notes

- Uses **Expo Router** (no classic React Navigation)
- TypeScript enforced across frontend
- Clean separation of concerns
- Easily scalable to teams & production

---

## 🚀 Future Improvements

- 📊 Charts (Victory / Recharts – web safe)
- 🌙 Dark mode
- 🔔 Budget alerts & notifications
- 📁 Export reports (CSV / PDF)
- 🔄 Refresh tokens
- ☁️ Cloud deployment (Vercel + Mongo Atlas)

---

## 👨‍💻 Author

**Satinder Singh**
Senior Full-Stack Developer
Built with ❤️ using modern React Native & Node.js

---

## 📜 License

This project is licensed under the **MIT License**.

---
