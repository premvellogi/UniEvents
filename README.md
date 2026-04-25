# University Event Management System

A comprehensive event management platform for universities with role-based access control (RBAC). Built with Node.js/Express backend and Next.js frontend.

## 🎯 Features

- **Event Management**: Create, update, delete, and view university events
- **Role-Based Access Control**: Three-tier permission system
  - **Students**: View events and receive notifications
  - **Secondary Admins**: Manage events and broadcast notifications
  - **Superior Admin**: Full control including admin management
- **Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Notifications**: Email-based notification system for events
- **Modern UI**: Responsive design with Tailwind CSS and Framer Motion animations

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications
- **Cloudinary** for file uploads
- **Multer** for file handling

### Frontend
- **Next.js** 9.3.3 with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uni-info
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables in .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Configure your environment variables in .env.local
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_host
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 👥 User Roles & Permissions

| Action | Student | Secondary Admin | Superior Admin |
|--------|---------|----------------|----------------|
| View Events | ✅ | ✅ | ✅ |
| Create/Edit/Delete Events | ❌ | ✅ | ✅ |
| Broadcast Notifications | ❌ | ✅ | ✅ |
| Manage Secondary Admins | ❌ | ❌ | ✅ |

**Superior Admin**: Hardcoded to `premvellogi@gmail.com` for security

## 📁 Project Structure

```
uni-info/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   └── types/
└── README.md
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run seed` - Seed database with initial data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Contact

For any queries or support, please reach out to the project maintainers.

---

**Note**: The Superior Admin role is hardcoded to `premvellogi@gmail.com` for security purposes. This cannot be changed through the application interface.
