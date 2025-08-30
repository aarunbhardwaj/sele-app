# React Native Language Learning App - Setup Guide

## Project Overview

This is a comprehensive React Native language learning application built with Expo, featuring:

- 🎓 **Course Management**: Complete course creation and management workflow
- 👨‍🎓 **User Management**: Admin and student role management
- 📱 **Cross-platform**: iOS, Android, and Web support
- 🎥 **Video Learning**: Integrated video player with progress tracking
- 🧠 **Quiz System**: Interactive quiz builder and assessment tools
- 📊 **Analytics**: Comprehensive learning analytics and progress tracking
- 🔐 **Authentication**: Secure user authentication with role-based access
- 💾 **Backend**: Appwrite integration for data management

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Appwrite Account**: Sign up at [appwrite.io](https://appwrite.io)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd react_tutorial
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your Appwrite credentials:
```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_DATABASE_ID=your_database_id_here
APPWRITE_STORAGE_BUCKET_ID=your_bucket_id_here

# Collection IDs (create these in Appwrite console)
USERS_COLLECTION_ID=your_users_collection_id
ROLES_COLLECTION_ID=your_roles_collection_id
COURSES_COLLECTION_ID=your_courses_collection_id
LESSONS_COLLECTION_ID=your_lessons_collection_id
# ... (see .env.example for complete list)
```

### 3. Appwrite Backend Setup

#### Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project
3. Copy the Project ID to your `.env` file

#### Create Database and Collections
Run the provided setup script:
```bash
node scripts/create-appwrite-collections.js
```

Or manually create collections with these schemas:

**Users Collection**:
- `userId` (string, required)
- `firstName` (string)
- `lastName` (string) 
- `displayName` (string)
- `bio` (string)
- `profilePicture` (string)
- `isAdmin` (boolean)
- `experienceLevel` (string)
- `preferences` (object)

**Courses Collection**:
- `title` (string, required)
- `description` (string)
- `level` (string)
- `category` (string)
- `duration` (integer)
- `isPublished` (boolean)
- `thumbnail` (string)

**Lessons Collection**:
- `courseId` (string, required)
- `title` (string, required)
- `content` (string)
- `videoUrl` (string)
- `duration` (integer)
- `order` (integer)

#### Set Permissions
Configure collection permissions:
- **Read**: `users` role
- **Write**: `users` role (for user-generated content)
- **Admin collections**: Restrict to admin users only

### 4. Run the Application

Start the development server:
```bash
npm start
```

This will open the Expo development server. You can then:

- **iOS**: Press `i` to open iOS Simulator
- **Android**: Press `a` to open Android Emulator  
- **Web**: Press `w` to open in web browser
- **Device**: Scan QR code with Expo Go app

## Project Structure

```
react_tutorial/
├── app/                          # Main application screens
│   ├── (admin)/                  # Admin-only screens
│   │   ├── (users)/              # User management
│   │   ├── (courses)/            # Course management
│   │   └── (analytics)/          # Admin analytics
│   ├── (tabs)/                   # Student interface (tab navigation)
│   │   ├── (courses)/            # Course browsing
│   │   ├── (learning)/           # Learning dashboard
│   │   ├── (quiz)/               # Quiz interface
│   │   ├── (classes)/            # Live classes
│   │   ├── (profile)/            # User profile
│   │   └── (support)/            # Help & support
│   ├── (pre-auth)/               # Authentication screens
│   └── _layout.tsx               # Root layout with providers
├── components/
│   ├── ui/                       # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── VideoPlayer.tsx       # Custom video player
│   │   ├── QuizBuilder.tsx       # Quiz creation tool
│   │   ├── AnalyticsDashboard.tsx # Analytics dashboard
│   │   └── ErrorBoundary.tsx     # Error handling
│   └── ui2/                      # Advanced UI components
├── lib/
│   ├── config.ts                 # Environment configuration
│   ├── types.ts                  # TypeScript interfaces
│   ├── errors.ts                 # Error handling utilities
│   ├── utils.ts                  # General utilities
│   └── toast.ts                  # Toast notifications
├── services/
│   ├── appwrite/                 # Appwrite service integration
│   │   ├── auth-service.ts       # Authentication
│   │   ├── course-service.ts     # Course management
│   │   ├── quiz-service.ts       # Quiz operations
│   │   └── client.ts             # Appwrite client setup
│   ├── AuthContext.tsx           # Authentication context
│   └── LearningProgressContext.tsx # Progress tracking
└── scripts/                     # Setup and utility scripts
    ├── create-appwrite-collections.js
    └── setup-permissions.js
```

## Key Features

### 🔐 Authentication System
- User registration and login
- Role-based access (Student/Instructor/Admin)
- Profile management with preferences
- Password reset functionality

### 📚 Course Management
- Course creation with multimedia content
- Lesson organization with video support
- Progress tracking per lesson
- Course enrollment system

### 🧠 Quiz System
- Multiple question types (multiple choice, true/false, short answer)
- Quiz builder with drag-and-drop interface
- Automatic grading and feedback
- Performance analytics

### 🎥 Video Learning
- Custom video player with controls
- Progress tracking and resume functionality
- Playback speed control
- Full-screen mode support

### 📊 Analytics & Progress
- Learning progress visualization
- Vocabulary mastery tracking
- Study session analytics
- Achievement system

### 👥 Admin Features
- User management with role assignment
- Content moderation and approval
- System-wide analytics dashboard
- Course and quiz management

## Development Guidelines

### Code Organization
- Follow the file-based routing structure
- Keep components modular and reusable
- Use TypeScript for type safety
- Implement proper error handling

### State Management
- Use React Context for global state
- Local state for component-specific data
- AsyncStorage for persistence
- Appwrite for backend data

### Styling
- TailwindCSS with NativeWind for consistent styling
- Responsive design for multiple screen sizes
- Dark/light mode support
- Accessibility considerations

## Testing

Run tests to validate the setup:
```bash
npm test
```

Test on different platforms:
- iOS Simulator
- Android Emulator  
- Web browser
- Physical devices via Expo Go

## Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Deployment
1. Configure app signing certificates
2. Set up Expo Application Services (EAS)
3. Build and submit to app stores
4. Set up over-the-air updates

## Troubleshooting

### Common Issues

**Appwrite Connection Issues**:
- Verify project ID and endpoint in `.env`
- Check network connectivity
- Ensure proper CORS settings in Appwrite console

**Metro Bundle Issues**:
```bash
npx expo start --clear
```

**iOS/Android Build Issues**:
- Clean and rebuild: `expo r -c`
- Check for conflicting dependencies
- Verify Expo SDK compatibility

**Environment Variables Not Loading**:
- Restart development server after changing `.env`
- Ensure `.env` file is in project root
- Check for typos in variable names

### Getting Help

1. **Documentation**: Check Expo and Appwrite documentation
2. **Community**: Join Expo Discord/Reddit communities  
3. **Issues**: Create GitHub issues for bugs
4. **Support**: Contact support for critical issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Expo Team** for the excellent development platform
- **Appwrite** for the backend-as-a-service solution
- **React Native Community** for the ecosystem and components