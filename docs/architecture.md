# React Tutorial App Architecture

This document outlines the architecture and user flows for the React Tutorial application. The application is designed as a mobile learning platform for English language learners with a focus on British English.

## System Overview

The application is built using:
- **Frontend**: React Native with Expo framework
- **Backend**: Appwrite Cloud (Authentication, Database, File Storage)
- **Styling**: TailwindCSS (NativeWind)

## Database Schema

The application uses several collections in Appwrite:

1. **Users Profiles** (`users_profiles`)
   - User personal data and settings
   - Contains learning preferences and progress metrics
   - Tracks admin status via `isAdmin` flag

2. **Roles** (`roles`)
   - Role-based permissions system
   - Admin role has permissions for content management and user administration
   - Permissions are stored as string arrays

3. **Courses** (`courses`)
   - Course metadata (title, description, level, etc.)
   - Published status for content visibility control

4. **Lessons** (`lessons`)
   - Organized by course
   - Contains learning material and order metadata

5. **Exercises** (`exercises`)
   - Practice activities for each lesson
   - Assessment and interactive learning components

6. **User Progress** (`user_progress`)
   - Tracks course enrollment
   - Stores progress metrics (completed lessons, overall percentage)
   - Records last access and activity timestamps

7. **Lesson Completions** (`lesson_completions`)
   - Records when users complete lessons
   - Stores performance metrics (score, time spent)
   - Logs exercise completion rates

8. **User Activities** (`user_activities`)
   - General activity log for analytics purposes
   - Timestamp-based tracking for user engagement

## File Storage

- `profile_images` bucket for user profile pictures
- Images are uploaded using Base64 encoding via React Native
- File preview URLs are generated for display within the app

## User Types and Permissions

### Guest Users
- Can view welcome/landing page
- Can create an account or log in
- No access to learning content

### Standard Users
- Can view and enroll in courses
- Can track their progress and complete lessons
- Can update their profile and preferences
- Can see learning analytics for their own account

### Admin Users
- Have all standard user permissions
- Can manage courses, lessons, and exercises
- Can view and manage other users
- Can assign roles and permissions
- Can view analytics across all users
- Can access the admin panel

## Authentication Flow

1. **Pre-Authentication**
   - Users start at the welcome screen (`/(pre-auth)/welcome.tsx`)
   - Can navigate to login or signup screens
   - Authentication status is managed by `AuthContext.tsx`

2. **Signup Process**
   - User enters name, email, password
   - Account created in Appwrite using `createAccount()`
   - User profile created using `createUserProfile()`
   - User automatically logged in and redirected to main app tabs

3. **Login Process**
   - User enters email and password
   - Authentication via `login()` in `AuthContext.tsx`
   - User profile fetched to check for admin status
   - Redirected to admin panel if admin, otherwise to main app

4. **Password Reset**
   - User enters email for password reset
   - Recovery link/code sent via `resetPassword()`
   - User enters verification code and new password
   - Password updated via `completePasswordRecovery()`

## Navigation Structure

### Pre-Authentication
- `/(pre-auth)/_layout.tsx` - Tab navigation for pre-auth screens
- `/(pre-auth)/welcome.tsx` - Landing page
- `/(pre-auth)/login.tsx` - Login form
- `/(pre-auth)/signup.tsx` - Registration form
- `/(pre-auth)/index.tsx` - Main entry point

### Main Application (Standard Users)
- `/(tabs)/_layout.tsx` - Tab navigation for authenticated users
- `/(tabs)/index.tsx` - Home/dashboard
- `/(tabs)/courses-catalog.tsx` - Browse available courses
- `/(tabs)/enrolled-courses.tsx` - View enrolled courses
- `/(tabs)/my-learning.tsx` - Learning progress and upcoming lessons
- `/(tabs)/profile.tsx` - User profile and settings

### Admin Panel
- `/(admin)/_layout.tsx` - Tab navigation for admin features
- `/(admin)/index.tsx` - Admin dashboard
- `/(admin)/users.tsx` - User management
- `/(admin)/roles.tsx` - Role and permission management

### Standalone Authentication Screens
- `/auth/login.tsx` - Alternative login screen
- `/auth/signup.tsx` - Alternative signup screen
- `/auth/forgot-password.tsx` - Password recovery
- `/auth/verification-code.tsx` - Code verification for password reset

## Key User Flows

### 1. User Registration and Onboarding
- User signs up with email and password
- System creates Appwrite account and user profile
- User can set language preferences, learning goals, and daily targets
- User can upload a profile image

### 2. Course Discovery and Enrollment
- Users can browse courses in the catalog
- Courses can be filtered by level, category, or search terms
- Users enroll in courses, creating user progress records

### 3. Learning Journey
- Users track progress through the "My Learning" tab
- Progress bars show completion percentages
- Users can continue from where they left off
- Users complete lessons sequentially
- Exercises are completed to reinforce learning

### 4. Profile Management
- Users can edit their display name, profile picture
- Users can set learning preferences (native language, English level)
- Users can set learning goals and daily targets
- Users can manage notification preferences

### 5. Admin User Management
- Admins can view all users
- Admins can assign or remove roles from users
- Admins can create and modify roles and permissions
- Script tools (`make-admin.js` and `make-admin-simple.js`) for admin user creation

### 6. Admin Content Management
- Admins can create and publish courses
- Admins can organize lessons within courses
- Admins can create exercises for lessons

## State Management

The application uses React's Context API for global state management:

- **AuthContext** (`services/AuthContext.tsx`)
  - Manages user authentication state
  - Provides login, signup, and logout functions
  - Checks admin status to control access to admin features

## Appwrite Service Layer

The `appwrite.ts` service file acts as a centralized API client layer with functionality grouped by domain:

- **Authentication Methods**: Account creation, login, password reset
- **Role Management Methods**: Role CRUD operations, role assignment
- **User Profile Methods**: Profile CRUD operations
- **Course Methods**: Course retrieval and filtering
- **Lesson Methods**: Lesson retrieval by course
- **Exercise Methods**: Exercise retrieval by lesson
- **User Progress Methods**: Track and update learning progress
- **Media Storage Methods**: File upload, preview, and deletion

## Admin Panel Features

The admin panel includes:
1. **Dashboard**: Overview statistics and recent activities
2. **User Management**: View and modify user roles
3. **Role Management**: Create, edit and delete roles with specific permissions

## Mobile Features

The app uses several mobile-specific features:
- Image picker for profile images
- File system access for uploading images
- Form validation for user inputs
- Responsive layouts for different screen sizes
- Tab-based navigation for easy access to features

## Initialization Scripts

The codebase includes scripts for initializing the Appwrite backend:
- `create-appwrite-collections.js`: Sets up all required collections
- `make-admin.js`: Assigns admin role to a user
- `make-admin-simple.js`: Simplified admin creation

## Security Considerations

- Role-based access control for admin features
- Document-level security using Appwrite permissions
- Secure password handling through Appwrite authentication
- Proper validation on inputs and form submissions