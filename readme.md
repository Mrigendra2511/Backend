# 🎥 YouTube Backend Clone

A production-ready backend for a YouTube-like video streaming platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication** - JWT-based with Access & Refresh tokens
- **Password Security** - Bcrypt hashing
- **Video Management** - Upload, update, delete, publish/unpublish
- **File Handling** - Multer + Cloudinary
- **Engagement** - Likes, Comments, Subscriptions, Playlists
- **Watch History** - Track user video history
- **Aggregation Pipelines** - Complex queries for channel profiles

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Bcrypt
- **File Upload:** Multer
- **Cloud Storage:** Cloudinary

## 📁 Project Structure

\`\`\`
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── app.js
└── index.js
\`\`\`

## ⚙️ Installation

\`\`\`bash
git clone https://github.com/Mrigendra2511/Backend.git
cd Backend
npm install
npm run dev
\`\`\`

## 🔐 Environment Variables

Create `.env` file:

\`\`\`env
PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
\`\`\`

## 👨‍💻 Author

**Mrigendra**  
GitHub: [@Mrigendra2511](https://github.com/Mrigendra2511)
