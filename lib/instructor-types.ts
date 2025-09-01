// Instructor Module Data Models

export interface InstructorProfile {
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

export interface ClassAssignment {
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

export interface ClassSession {
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

export interface StudentRating {
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

export interface OnlineSession {
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

export interface InstructorSchedule {
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