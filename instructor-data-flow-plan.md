# Instructor Module Data Flow Plan

## Overview
This document outlines the complete data flow for the instructor module based on the workflow: Admin assigns instructors to schools and classes → Instructors teach classes → Instructors rate students → Instructors view schedules and history → Online teaching capabilities.

## Core Data Models

### 1. Instructor Profile
```typescript
interface InstructorProfile {
  $id: string;
  userId: string;
  displayName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  specialization: string[];        // e.g., ["Grammar", "Conversation", "Business English"]
  experience: string;              // Years of experience
  qualifications: string[];        // Certifications, degrees
  location?: string;
  status: 'available' | 'assigned' | 'unavailable' | 'on-leave';
  maxClasses: number;              // Maximum classes instructor can handle
  currentAssignments: string[];    // Array of class IDs
  rating: number;                  // Average rating from students
  totalRatings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Class Assignment
```typescript
interface ClassAssignment {
  $id: string;
  instructorId: string;
  instructorName: string;
  classId: string;
  schoolId: string;
  schoolName: string;
  className: string;
  subject: string;
  grade: string;
  schedule: string;                // "Mon, Wed, Fri - 10:00 AM - 11:00 AM"
  startDate: string;
  endDate?: string;
  isTemporary: boolean;            // Temporary or permanent assignment
  assignedBy: string;              // Admin user ID who made assignment
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  notes?: string;                  // Admin notes about assignment
  createdAt: string;
  updatedAt: string;
}
```

### 3. Class Session
```typescript
interface ClassSession {
  $id: string;
  classId: string;
  instructorId: string;
  schoolId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  actualStartTime?: string;        // When instructor actually started
  actualEndTime?: string;          // When instructor actually ended
  sessionType: 'in-person' | 'online' | 'hybrid';
  meetingLink?: string;            // For online sessions
  attendanceCount: number;
  totalStudents: number;
  lessonTopic: string;
  materials: string[];             // URLs or references to materials used
  homework?: string;               // Assigned homework
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  cancellationReason?: string;
  sessionNotes?: string;           // Instructor's notes about the session
  createdAt: string;
  updatedAt: string;
}
```

### 4. Student Rating
```typescript
interface StudentRating {
  $id: string;
  instructorId: string;
  studentId: string;
  classId: string;
  sessionId: string;
  date: string;
  ratings: {
    participation: number;         // 1-5 scale
    comprehension: number;         // 1-5 scale
    homework: number;              // 1-5 scale
    speaking: number;              // 1-5 scale
    listening: number;             // 1-5 scale
    overall: number;               // 1-5 scale
  };
  comments: string;
  strengths: string[];             // ["Good pronunciation", "Active participation"]
  areasForImprovement: string[];   // ["Grammar needs work", "Vocabulary expansion"]
  recommendations: string;         // Instructor recommendations for student
  isVisible: boolean;              // Whether student can see this rating
  createdAt: string;
  updatedAt: string;
}
```

### 5. Online Teaching Session
```typescript
interface OnlineSession {
  $id: string;
  sessionId: string;              // Links to ClassSession
  meetingPlatform: 'zoom' | 'teams' | 'google-meet' | 'custom';
  meetingId: string;
  meetingPassword?: string;
  meetingLink: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  recordingDuration?: number;      // In minutes
  attendees: {
    studentId: string;
    joinTime?: string;
    leaveTime?: string;
    duration: number;              // In minutes
  }[];
  chatLog?: string;                // Chat messages during session
  whiteboardData?: string;         // Whiteboard content if used
  sharedFiles: string[];           // Files shared during session
  sessionQuality: {
    videoQuality: 'good' | 'fair' | 'poor';
    audioQuality: 'good' | 'fair' | 'poor';
    connectionStability: 'stable' | 'unstable';
  };
  technicalIssues?: string[];      // Any technical problems encountered
  createdAt: string;
  updatedAt: string;
}
```

### 6. Instructor Schedule
```typescript
interface InstructorSchedule {
  $id: string;
  instructorId: string;
  date: string;                    // "2024-01-15"
  timeSlots: {
    startTime: string;             // "09:00"
    endTime: string;               // "10:00"
    status: 'available' | 'booked' | 'break' | 'unavailable';
    classId?: string;              // If booked
    sessionId?: string;            // If there's an active session
    location?: string;             // Physical location or "Online"
  }[];
  totalClassesScheduled: number;
  totalTeachingHours: number;
  createdAt: string;
  updatedAt: string;
}
```

## Data Flow Processes

### 1. Admin Assignment Flow
```
Admin Dashboard → Roster Management → Select Instructor → Select School/Class
↓
Create ClassAssignment record
↓
Update Instructor currentAssignments
↓
Update Class instructorId and instructorName
↓
Generate InstructorSchedule entries
↓
Send notification to Instructor
```

### 2. Daily Teaching Flow
```
Instructor Login → Dashboard showing today's schedule
↓
View Class Assignment details
↓
Start Class Session (create ClassSession record)
↓
Conduct class (update session status to 'ongoing')
↓
Take attendance (update attendanceCount)
↓
Rate Students (create StudentRating records)
↓
End Session (update actualEndTime, status to 'completed')
↓
Add session notes and homework assignments
```

### 3. Online Teaching Flow
```
Instructor selects "Teach Online" option
↓
System generates meeting link (create OnlineSession record)
↓
Students receive meeting invitation
↓
Session starts (update session tracking)
↓
Real-time monitoring of attendees
↓
Record session if enabled
↓
Save chat logs, shared files
↓
End session and save all data
```

### 4. Student Rating Flow
```
After each class session
↓
Instructor accesses student list for that class
↓
Rate each student on multiple criteria
↓
Add qualitative comments and recommendations
↓
Save ratings (visible/hidden toggle)
↓
Generate progress reports for parents/admin
```

### 5. Schedule Management Flow
```
Admin creates class assignments
↓
System auto-generates instructor schedule
↓
Instructor can view daily/weekly/monthly schedule
↓
Filter by school, subject, class type
↓
View past sessions and upcoming classes
↓
Access session history and student ratings
```

## API Endpoints Required

### Assignment Management
- `POST /assignments` - Create new class assignment
- `GET /assignments/instructor/:id` - Get instructor's assignments
- `PUT /assignments/:id` - Update assignment details
- `DELETE /assignments/:id` - Remove assignment

### Session Management
- `POST /sessions` - Create new class session
- `GET /sessions/instructor/:id` - Get instructor's sessions
- `GET /sessions/upcoming/:instructorId` - Get upcoming sessions
- `GET /sessions/history/:instructorId` - Get past sessions
- `PUT /sessions/:id` - Update session details
- `POST /sessions/:id/start` - Start a session
- `POST /sessions/:id/end` - End a session

### Student Rating
- `POST /ratings` - Create student rating
- `GET /ratings/student/:id` - Get student's ratings
- `GET /ratings/class/:id` - Get all ratings for a class
- `PUT /ratings/:id` - Update rating
- `GET /ratings/instructor/:id/analytics` - Get rating analytics

### Online Teaching
- `POST /online-sessions` - Create online session
- `GET /online-sessions/:sessionId` - Get online session details
- `POST /online-sessions/:id/join` - Student joins session
- `POST /online-sessions/:id/leave` - Student leaves session
- `PUT /online-sessions/:id/recording` - Update recording status

### Schedule Management
- `GET /schedule/instructor/:id` - Get instructor schedule
- `GET /schedule/instructor/:id/date/:date` - Get schedule for specific date
- `POST /schedule/availability` - Set instructor availability
- `GET /schedule/conflicts/:instructorId` - Check for schedule conflicts

## Database Collections (Appwrite)

### 1. instructorProfiles
- Stores instructor personal and professional information
- Indexes: userId, email, status, specialization

### 2. classAssignments
- Links instructors to specific classes and schools
- Indexes: instructorId, classId, schoolId, status, startDate

### 3. classSessions
- Records of individual teaching sessions
- Indexes: instructorId, classId, sessionDate, status

### 4. studentRatings
- Student performance ratings by instructors
- Indexes: instructorId, studentId, classId, date

### 5. onlineSessions
- Online teaching session data
- Indexes: sessionId, meetingId, recordingEnabled

### 6. instructorSchedules
- Daily schedule management for instructors
- Indexes: instructorId, date

## Mobile App Screens & Navigation

### Instructor Dashboard
- Overview stats (classes today, total students, ratings)
- Quick actions (start class, view schedule, rate students)
- Recent assignments and upcoming sessions

### Schedule Management
- Calendar view (daily/weekly/monthly)
- Class details and student information
- Online session controls

### Class Management
- Active class session interface
- Student list with rating interface
- Session notes and homework assignment

### Student Rating
- Multi-criteria rating system
- Comment and recommendation interface
- Progress tracking over time

### Online Teaching
- Video conferencing integration
- Screen sharing and whiteboard tools
- Recording and file sharing

### Reports & Analytics
- Teaching performance metrics
- Student progress analytics
- Session history and attendance reports

## Integration Points

### 1. Video Conferencing APIs
- Zoom SDK integration
- Microsoft Teams integration
- Google Meet API
- Custom WebRTC solution

### 2. Notification System
- Push notifications for class reminders
- Email notifications for assignments
- SMS alerts for urgent updates

### 3. File Storage
- Session recordings storage
- Teaching materials upload
- Student work submissions

### 4. Analytics & Reporting
- Teaching performance dashboards
- Student progress tracking
- Administrative reporting tools

## Security & Privacy Considerations

### Data Protection
- Encrypt sensitive student rating data
- Secure video session recordings
- GDPR compliance for student data

### Access Control
- Role-based permissions (instructor vs admin)
- Student data visibility controls
- Session recording consent management

### Session Security
- Encrypted video communications
- Meeting room access controls
- Recording permission management

## Future Enhancements

### AI-Powered Features
- Automated session transcription
- AI-assisted student rating suggestions
- Predictive analytics for student performance

### Advanced Online Teaching
- Virtual classroom environments
- Interactive whiteboard tools
- Breakout room management

### Mobile Optimization
- Offline session note-taking
- Mobile-first rating interface
- Push notification optimization

This data flow plan provides a comprehensive framework for implementing the instructor module with all the features you described, including admin assignments, class teaching, student rating, schedule management, and online teaching capabilities.