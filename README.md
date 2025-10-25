# ScholarQuest - Gamified Scholarship Finder

A full-stack web application that helps students find and apply to scholarships with a gamified experience.

## 🎓 Features

- **User Profile Management**: Create and save personalized profiles
- **Smart Scholarship Matching**: Find scholarships based on your criteria
- **Gamification**: Earn XP and level up as you apply to scholarships
- **Modern UI**: Beautiful Tailwind CSS design with aqua theme
- **Persistent Data**: SQLite database to save user profiles and applications

## 🚀 Tech Stack

### Frontend
- React (CDN)
- Tailwind CSS
- Modern responsive design

### Backend
- Node.js
- Express.js
- SQLite3 database
- RESTful API

## 📁 Project Structure

```
ScholarQuest/
├── index.html          # Frontend React application
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
├── scholarship.db      # SQLite database (auto-generated)
└── README.md          # This file
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/ScholarQuest.git
   cd ScholarQuest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```

4. **Open the frontend**
   - Open `index.html` in your web browser
   - Or serve it with a local server

## 🌐 API Endpoints

- `GET /api/health` - Health check
- `GET /api/scholarships` - Get all scholarships
- `POST /api/users` - Create/update user profile
- `GET /api/users/:name` - Get user profile
- `POST /api/applications` - Apply to scholarship
- `GET /api/users/:userId/applications` - Get user's applications

## 🎮 How to Use

1. **Create Profile**: Fill out your information (name, age, major, gender, experience)
2. **Find Scholarships**: Click "Find My Scholarships" to see matching opportunities
3. **Apply & Earn XP**: Apply to scholarships to earn experience points
4. **Level Up**: Watch your level increase as you apply to more scholarships

## 🎨 Design Features

- **Aqua Color Theme**: Beautiful teal/aqua color palette
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Hover effects and transitions
- **Modern UI**: Card-based layout with shadows and gradients

## 📊 Database Schema

### Users Table
- id, name, age, major, gender
- leadership, community (boolean flags)
- total_xp, level, timestamps

### Applications Table
- user_id, scholarship_id, scholarship_name
- xp_earned, applied_at

### Scholarships Table
- id, name, description, criteria, reward

## 🚀 Deployment

The application can be deployed to platforms like:
- Heroku
- Vercel
- Netlify
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- User authentication
- More scholarship sources
- Email notifications
- Social features
- Mobile app version
