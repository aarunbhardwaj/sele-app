# Language Learning Hub 🎓

A comprehensive language learning platform built with React Native and Expo, featuring instructor management, student progress tracking, and interactive lessons.

## ✨ Features

### For Students
- 📚 Interactive lessons and exercises
- 🎯 Progress tracking and analytics
- 📝 Quizzes with immediate feedback
- 👨‍🏫 Direct communication with instructors
- 📊 Performance dashboards

### For Instructors
- 🗓️ Calendar and schedule management
- 👥 Class roster and student management
- ⭐ Student rating and feedback system
- 📈 Progress tracking across multiple schools
- 🎪 Assignment priority management

### For Administrators
- 🏫 Multi-school management
- 👨‍💼 Instructor assignment and roster management
- 📊 Comprehensive analytics dashboard
- 🔧 User management and permissions
- 📋 Course and curriculum management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- EAS CLI (for building)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/language-learning-hub.git
   cd language-learning-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Project Structure

```
├── app/                    # App screens and navigation
│   ├── (admin)/           # Admin dashboard and management
│   ├── (instructor)/      # Instructor interface
│   ├── (tabs)/           # Student main app
│   └── (pre-auth)/       # Authentication screens
├── components/           # Reusable UI components
├── services/            # API services and contexts
├── lib/                # Utilities and types
├── assets/             # Images, fonts, and static assets
└── scripts/            # Database and utility scripts
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Appwrite
- **State Management**: React Context
- **TypeScript**: Full type safety

### Key Components
- **Authentication**: Secure user login and registration
- **Role-based Access**: Student, Instructor, Admin permissions
- **Real-time Data**: Live updates for schedules and assignments
- **Offline Support**: Core functionality works offline

## 📱 Building for Production

### Android (Google Play Store)

1. **Build AAB for Play Store**
   ```bash
   npm run build:android
   ```

2. **Submit to Play Store**
   ```bash
   npm run submit:android
   ```

### iOS (App Store)

1. **Build for App Store**
   ```bash
   npm run build:ios
   ```

2. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```

## 🔧 Configuration

### Environment Variables

Required environment variables (see `.env.production`):

```bash
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=your-endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id

# Collection IDs
EXPO_PUBLIC_USERS_COLLECTION_ID=your-users-collection
EXPO_PUBLIC_COURSES_COLLECTION_ID=your-courses-collection
# ... additional collections
```

### Appwrite Setup

1. Create an Appwrite project
2. Set up databases and collections using the provided scripts
3. Configure authentication methods
4. Set up proper permissions for each collection

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Manual Testing Checklist
- [ ] User authentication flows
- [ ] Role-based access control
- [ ] Instructor calendar and scheduling
- [ ] Student progress tracking
- [ ] Admin roster management
- [ ] Offline functionality

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Privacy Policy](./PRIVACY_POLICY.md) - App privacy policy
- [Architecture Guide](./docs/architecture.md) - Technical architecture
- [API Documentation](./docs/api.md) - Backend API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Email: support@languagelearninghub.com
- Documentation: [docs.languagelearninghub.com](https://docs.languagelearninghub.com)
- Issues: [GitHub Issues](https://github.com/your-username/language-learning-hub/issues)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Powered by [Appwrite](https://appwrite.io)
- UI components inspired by [Airbnb Design System](https://airbnb.design)

---

Made with ❤️ for language learners worldwide
