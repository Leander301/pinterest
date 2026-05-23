# 📌 PinVault — Pinterest-Inspired Full Stack App

A modern, full-featured visual discovery platform built with React, Node.js/Express, and MongoDB.

---

## ✨ Features

### Frontend
- 🏠 **Responsive Homepage** — Masonry grid layout with infinite scrolling
- 🔐 **Auth Pages** — Login & Register with beautiful split-screen design
- 📌 **Pin Detail Page** — Full image view, likes, saves, comments
- ➕ **Create Pin Page** — Drag & drop upload or image URL, category, tags
- 👤 **Profile Page** — Created/Saved pins, follow system, editable profile
- 🔍 **Search Page** — Search pins by text/category, search users
- 📱 **Mobile-First** — Fully responsive on all screen sizes
- ✨ **Smooth Animations** — CSS transitions, masonry layout, skeleton loading

### Backend
- 🔑 **JWT Authentication** — Register, login, protected routes
- 📷 **Image Upload** — Multer-based local storage (Cloudinary-ready)
- 💾 **MongoDB** — Mongoose models for Users, Pins, Comments
- ❤️ **Likes & Saves** — Toggle like/save on pins
- 💬 **Comments** — Add and delete comments
- 👥 **Follow System** — Follow/unfollow users
- 🔎 **Full-Text Search** — MongoDB text index on pins
- 🛡️ **Security** — Helmet, rate limiting, CORS, input validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone or extract the project
cd pinvault

# Install all dependencies (root, server, client)
npm run install:all
# OR manually:
cd server && npm install
cd ../client && npm install
```

### Configuration

The `.env` file in `/server` is pre-configured with your MongoDB URI:
```
MONGODB_URI=mongodb+srv://leander:Leander_301@cluster0.fszvyvm.mongodb.net/pinvault
JWT_SECRET=pinvault_super_secret_jwt_key_2024
PORT=5000
CLIENT_URL=http://localhost:3000
```

> **Optional:** For Cloudinary image hosting, add your Cloudinary credentials to `.env`. Without them, images are stored locally in `/server/uploads/`.

### Running the App

```bash
# Run both server and client simultaneously (from root)
npm run dev

# OR run separately:
npm run dev:server    # Backend on http://localhost:5000
npm run dev:client    # Frontend on http://localhost:3000
```

---

## 📁 Project Structure

```
pinvault/
├── package.json          # Root scripts (concurrently)
├── README.md
│
├── server/               # Node.js + Express Backend
│   ├── index.js          # Entry point
│   ├── .env              # Environment variables
│   ├── models/
│   │   ├── User.js       # User schema (auth, follow, savedPins)
│   │   └── Pin.js        # Pin schema (likes, saves, comments)
│   ├── routes/
│   │   ├── auth.js       # /api/auth (register, login, me)
│   │   ├── pins.js       # /api/pins (CRUD, like, save, comment)
│   │   ├── users.js      # /api/users (profile, follow, search)
│   │   └── categories.js # /api/categories
│   └── middleware/
│       ├── auth.js       # JWT protect + optionalAuth
│       └── upload.js     # Multer image upload
│
└── client/               # React Frontend
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx           # Router + QueryClient setup
        ├── index.js          # React entry
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        ├── utils/
        │   └── api.js            # Axios instance + API methods
        ├── styles/
        │   └── globals.css       # Design tokens + global styles
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx    # Navbar + Outlet
        │   │   └── Layout.module.css
        │   └── pins/
        │       ├── PinCard.jsx         # Individual pin card
        │       ├── PinCard.module.css
        │       ├── PinGrid.jsx         # Masonry grid
        │       ├── PinGrid.module.css
        │       ├── CategoryFilter.jsx  # Category pills
        │       └── CategoryFilter.module.css
        └── pages/
            ├── HomePage.jsx        # Feed with infinite scroll
            ├── LoginPage.jsx       # Sign in
            ├── RegisterPage.jsx    # Sign up
            ├── PinDetailPage.jsx   # Full pin view
            ├── CreatePinPage.jsx   # Upload + create
            ├── ProfilePage.jsx     # User profile
            └── SearchPage.jsx      # Search pins + users
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Pins
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/pins` | Get all pins (paginated, filterable) |
| GET | `/api/pins/:id` | Get single pin |
| POST | `/api/pins` | Create pin (auth required) |
| PUT | `/api/pins/:id` | Update pin (owner only) |
| DELETE | `/api/pins/:id` | Delete pin (owner only) |
| POST | `/api/pins/:id/like` | Toggle like |
| POST | `/api/pins/:id/save` | Toggle save |
| POST | `/api/pins/:id/comments` | Add comment |
| DELETE | `/api/pins/:id/comments/:commentId` | Delete comment |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/:username` | Get user profile |
| PUT | `/api/users/profile/update` | Update profile (auth) |
| POST | `/api/users/:id/follow` | Toggle follow |
| GET | `/api/users/search/query?q=` | Search users |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State | Zustand, React Query, Context API |
| Styling | CSS Modules, custom design tokens |
| Forms | React Hook Form, React Dropzone |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Upload | Multer (local) / Cloudinary (optional) |
| Security | Helmet, express-rate-limit, express-validator |

---

## 🔧 Adding Cloudinary (Optional)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Update `/server/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
4. In `/server/middleware/upload.js`, swap the storage to use `multer-storage-cloudinary`

---

## 📝 Notes

- Images uploaded without Cloudinary are stored in `/server/uploads/` (auto-created)
- The frontend proxies API requests to `http://localhost:5000` via CRA proxy config
- JWT tokens expire in 7 days by default
- MongoDB text indexes are created automatically on first run
