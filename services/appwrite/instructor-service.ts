import { ID, Query } from 'appwrite';
import type {
    ClassAssignment,
    ClassSession,
    InstructorProfile,
    InstructorSchedule,
    OnlineSession,
    StudentRating
} from '../../lib/instructor-types';
import { getAppwriteClient } from './client';

// Helper functions for JSON field handling
const parseJsonField = (field: any, fallback: any = {}) => {
  if (!field) return fallback;
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch {
    return fallback;
  }
};

const stringifyJsonField = (data: any) => {
  return typeof data === 'string' ? data : JSON.stringify(data);
};

// Transform functions for simplified collections
const transformInstructorProfile = (doc: any): InstructorProfile => {
  const profileData = parseJsonField(doc.profileData, {});
  const currentAssignments = parseJsonField(doc.currentAssignments, []);

  return {
    $id: doc.$id,
    userId: doc.userId,
    displayName: doc.displayName,
    email: doc.email,
    phone: doc.phone,
    profileImage: profileData.profileImage,
    bio: profileData.bio,
    specialization: profileData.specialization || [],
    experience: profileData.experience || '1+ years',
    qualifications: profileData.qualifications || [],
    location: profileData.location,
    status: doc.status,
    maxClasses: doc.maxClasses,
    currentAssignments,
    rating: doc.rating,
    totalRatings: doc.totalRatings,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

const transformClassAssignment = (doc: any): ClassAssignment => {
  const classDetails = parseJsonField(doc.classDetails, {});

  return {
    $id: doc.$id,
    instructorId: doc.instructorId,
    instructorName: doc.instructorName,
    classId: doc.classId,
    schoolId: doc.schoolId,
    schoolName: doc.schoolName,
    className: classDetails.className || 'English Class',
    subject: classDetails.subject || 'English',
    grade: classDetails.grade || 'Intermediate',
    schedule: classDetails.schedule || 'TBD',
    startDate: doc.startDate,
    endDate: doc.endDate,
    isTemporary: doc.isTemporary,
    assignedBy: doc.assignedBy,
    status: doc.status,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

const transformClassSession = (doc: any): ClassSession => {
  const sessionTimes = parseJsonField(doc.sessionTimes, {});
  const sessionData = parseJsonField(doc.sessionData, {});
  
  // Parse timeSlot (e.g., "10:00-11:00")
  const [startTime, endTime] = doc.timeSlot?.split('-') || ['10:00', '11:00'];

  return {
    $id: doc.$id,
    classId: doc.classId,
    instructorId: doc.instructorId,
    schoolId: doc.schoolId,
    sessionDate: doc.sessionDate,
    startTime,
    endTime,
    actualStartTime: sessionTimes.actualStartTime,
    actualEndTime: sessionTimes.actualEndTime,
    sessionType: doc.sessionType,
    meetingLink: doc.meetingLink,
    attendanceCount: doc.attendanceCount,
    totalStudents: doc.totalStudents,
    lessonTopic: doc.lessonTopic,
    materials: sessionData.materials || [],
    homework: sessionData.homework,
    status: doc.status,
    cancellationReason: sessionData.cancellationReason,
    sessionNotes: sessionData.sessionNotes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

const transformStudentRating = (doc: any): StudentRating => {
  const ratings = parseJsonField(doc.ratings, {});
  const feedback = parseJsonField(doc.feedback, {});

  return {
    $id: doc.$id,
    instructorId: doc.instructorId,
    studentId: doc.studentId,
    classId: doc.classId,
    sessionId: doc.sessionId,
    date: doc.date,
    ratings,
    comments: feedback.comments || '',
    strengths: feedback.strengths || [],
    areasForImprovement: feedback.areasForImprovement || [],
    recommendations: feedback.recommendations || '',
    isVisible: doc.isVisible,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

const transformOnlineSession = (doc: any): OnlineSession => {
  const meetingData = parseJsonField(doc.meetingData, {});
  const recordingData = parseJsonField(doc.recordingData, {});
  const sessionContent = parseJsonField(doc.sessionContent, {});

  return {
    $id: doc.$id,
    sessionId: doc.sessionId,
    meetingPlatform: doc.meetingPlatform,
    meetingId: doc.meetingId,
    meetingPassword: meetingData.password,
    meetingLink: doc.meetingLink,
    recordingEnabled: doc.recordingEnabled,
    recordingUrl: recordingData.url,
    recordingDuration: recordingData.duration,
    attendees: meetingData.attendees || [],
    chatLog: sessionContent.chatLog,
    whiteboardData: sessionContent.whiteboardData,
    sharedFiles: sessionContent.sharedFiles || [],
    sessionQuality: meetingData.quality,
    technicalIssues: meetingData.issues || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

const instructorService = {
  // Instructor Profile Management
  getInstructorProfile: async (instructorId: string): Promise<InstructorProfile | null> => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.instructorProfilesCollectionId,
        [Query.equal('userId', instructorId)]
      );
      return response.documents[0] ? transformInstructorProfile(response.documents[0]) : null;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      throw error;
    }
  },

  createInstructorProfile: async (profileData: Omit<InstructorProfile, '$id' | 'createdAt' | 'updatedAt'>): Promise<InstructorProfile> => {
    try {
      const { databases, config } = getAppwriteClient();
      const profileDataJson = {
        profileImage: profileData.profileImage,
        bio: profileData.bio,
        specialization: profileData.specialization,
        experience: profileData.experience,
        qualifications: profileData.qualifications,
        location: profileData.location
      };

      const response = await databases.createDocument(
        config.databaseId,
        config.instructorProfilesCollectionId,
        ID.unique(),
        {
          userId: profileData.userId,
          displayName: profileData.displayName,
          email: profileData.email,
          phone: profileData.phone,
          profileData: stringifyJsonField(profileDataJson),
          status: profileData.status,
          maxClasses: profileData.maxClasses,
          currentAssignments: stringifyJsonField(profileData.currentAssignments),
          rating: profileData.rating,
          totalRatings: profileData.totalRatings,
          isActive: profileData.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return transformInstructorProfile(response);
    } catch (error) {
      console.error('Error creating instructor profile:', error);
      throw error;
    }
  },

  updateInstructorProfile: async (profileId: string, updates: Partial<InstructorProfile>): Promise<InstructorProfile> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Handle simple fields
      if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.maxClasses !== undefined) updateData.maxClasses = updates.maxClasses;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.totalRatings !== undefined) updateData.totalRatings = updates.totalRatings;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

      // Handle JSON fields
      if (updates.profileImage || updates.bio || updates.specialization || 
          updates.experience || updates.qualifications || updates.location) {
        const profileDataJson = {
          profileImage: updates.profileImage,
          bio: updates.bio,
          specialization: updates.specialization,
          experience: updates.experience,
          qualifications: updates.qualifications,
          location: updates.location
        };
        updateData.profileData = stringifyJsonField(profileDataJson);
      }

      if (updates.currentAssignments !== undefined) {
        updateData.currentAssignments = stringifyJsonField(updates.currentAssignments);
      }

      const response = await databases.updateDocument(
        config.databaseId,
        config.instructorProfilesCollectionId,
        profileId,
        updateData
      );
      return transformInstructorProfile(response);
    } catch (error) {
      console.error('Error updating instructor profile:', error);
      throw error;
    }
  },

  // Class Assignment Management
  getInstructorAssignments: async (instructorId: string): Promise<ClassAssignment[]> => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.classAssignmentsCollectionId,
        [Query.equal('instructorId', instructorId)]
      );
      return response.documents.map(transformClassAssignment);
    } catch (error) {
      console.error('Error fetching instructor assignments:', error);
      throw error;
    }
  },

  createClassAssignment: async (assignmentData: Omit<ClassAssignment, '$id' | 'createdAt' | 'updatedAt'>): Promise<ClassAssignment> => {
    try {
      const { databases, config } = getAppwriteClient();
      const classDetailsJson = {
        className: assignmentData.className,
        subject: assignmentData.subject,
        grade: assignmentData.grade,
        schedule: assignmentData.schedule
      };

      const response = await databases.createDocument(
        config.databaseId,
        config.classAssignmentsCollectionId,
        ID.unique(),
        {
          instructorId: assignmentData.instructorId,
          instructorName: assignmentData.instructorName,
          classId: assignmentData.classId,
          schoolId: assignmentData.schoolId,
          schoolName: assignmentData.schoolName,
          classDetails: stringifyJsonField(classDetailsJson),
          startDate: assignmentData.startDate,
          endDate: assignmentData.endDate,
          isTemporary: assignmentData.isTemporary,
          assignedBy: assignmentData.assignedBy,
          status: assignmentData.status,
          notes: assignmentData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return transformClassAssignment(response);
    } catch (error) {
      console.error('Error creating class assignment:', error);
      throw error;
    }
  },

  updateClassAssignment: async (assignmentId: string, updates: Partial<ClassAssignment>): Promise<ClassAssignment> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Handle simple fields
      if (updates.instructorName !== undefined) updateData.instructorName = updates.instructorName;
      if (updates.schoolName !== undefined) updateData.schoolName = updates.schoolName;
      if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
      if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
      if (updates.isTemporary !== undefined) updateData.isTemporary = updates.isTemporary;
      if (updates.assignedBy !== undefined) updateData.assignedBy = updates.assignedBy;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      // Handle JSON fields
      if (updates.className || updates.subject || updates.grade || updates.schedule) {
        const classDetailsJson = {
          className: updates.className,
          subject: updates.subject,
          grade: updates.grade,
          schedule: updates.schedule
        };
        updateData.classDetails = stringifyJsonField(classDetailsJson);
      }

      const response = await databases.updateDocument(
        config.databaseId,
        config.classAssignmentsCollectionId,
        assignmentId,
        updateData
      );
      return transformClassAssignment(response);
    } catch (error) {
      console.error('Error updating class assignment:', error);
      throw error;
    }
  },

  // Class Session Management
  getInstructorSessions: async (instructorId: string, filters?: {
    date?: string;
    status?: string;
    limit?: number;
  }): Promise<ClassSession[]> => {
    try {
      const { databases, config } = getAppwriteClient();
      const queries = [Query.equal('instructorId', instructorId)];
      
      if (filters?.date) {
        queries.push(Query.equal('sessionDate', filters.date));
      }
      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }
      if (filters?.limit) {
        queries.push(Query.limit(filters.limit));
      }

      const response = await databases.listDocuments(
        config.databaseId,
        config.classSessionsCollectionId,
        queries
      );
      return response.documents.map(transformClassSession);
    } catch (error) {
      console.error('Error fetching instructor sessions:', error);
      throw error;
    }
  },

  createClassSession: async (sessionData: Omit<ClassSession, '$id' | 'createdAt' | 'updatedAt'>): Promise<ClassSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const timeSlot = `${sessionData.startTime}-${sessionData.endTime}`;
      const sessionTimesJson = {
        actualStartTime: sessionData.actualStartTime,
        actualEndTime: sessionData.actualEndTime
      };
      const sessionDataJson = {
        materials: sessionData.materials,
        homework: sessionData.homework,
        sessionNotes: sessionData.sessionNotes,
        cancellationReason: sessionData.cancellationReason
      };

      const response = await databases.createDocument(
        config.databaseId,
        config.classSessionsCollectionId,
        ID.unique(),
        {
          classId: sessionData.classId,
          instructorId: sessionData.instructorId,
          schoolId: sessionData.schoolId,
          sessionDate: sessionData.sessionDate,
          timeSlot,
          sessionTimes: stringifyJsonField(sessionTimesJson),
          sessionType: sessionData.sessionType,
          meetingLink: sessionData.meetingLink,
          attendanceCount: sessionData.attendanceCount,
          totalStudents: sessionData.totalStudents,
          lessonTopic: sessionData.lessonTopic,
          sessionData: stringifyJsonField(sessionDataJson),
          status: sessionData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return transformClassSession(response);
    } catch (error) {
      console.error('Error creating class session:', error);
      throw error;
    }
  },

  updateClassSession: async (sessionId: string, updates: Partial<ClassSession>): Promise<ClassSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Handle simple fields
      if (updates.sessionDate !== undefined) updateData.sessionDate = updates.sessionDate;
      if (updates.sessionType !== undefined) updateData.sessionType = updates.sessionType;
      if (updates.meetingLink !== undefined) updateData.meetingLink = updates.meetingLink;
      if (updates.attendanceCount !== undefined) updateData.attendanceCount = updates.attendanceCount;
      if (updates.totalStudents !== undefined) updateData.totalStudents = updates.totalStudents;
      if (updates.lessonTopic !== undefined) updateData.lessonTopic = updates.lessonTopic;
      if (updates.status !== undefined) updateData.status = updates.status;

      // Handle JSON fields
      if (updates.startTime || updates.endTime) {
        const timeSlot = `${updates.startTime}-${updates.endTime}`;
        updateData.timeSlot = timeSlot;
      }

      if (updates.actualStartTime || updates.actualEndTime) {
        const sessionTimesJson = {
          actualStartTime: updates.actualStartTime,
          actualEndTime: updates.actualEndTime
        };
        updateData.sessionTimes = stringifyJsonField(sessionTimesJson);
      }

      if (updates.materials || updates.homework || updates.sessionNotes || updates.cancellationReason) {
        const sessionDataJson = {
          materials: updates.materials,
          homework: updates.homework,
          sessionNotes: updates.sessionNotes,
          cancellationReason: updates.cancellationReason
        };
        updateData.sessionData = stringifyJsonField(sessionDataJson);
      }

      const response = await databases.updateDocument(
        config.databaseId,
        config.classSessionsCollectionId,
        sessionId,
        updateData
      );
      return transformClassSession(response);
    } catch (error) {
      console.error('Error updating class session:', error);
      throw error;
    }
  },

  startSession: async (sessionId: string): Promise<ClassSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const sessionTimesJson = {
        actualStartTime: new Date().toISOString()
      };

      const response = await databases.updateDocument(
        config.databaseId,
        config.classSessionsCollectionId,
        sessionId,
        {
          status: 'ongoing',
          sessionTimes: stringifyJsonField(sessionTimesJson),
          updatedAt: new Date().toISOString()
        }
      );
      return transformClassSession(response);
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  endSession: async (sessionId: string, sessionNotes?: string): Promise<ClassSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const sessionTimesJson = {
        actualEndTime: new Date().toISOString()
      };
      const sessionDataJson = {
        sessionNotes: sessionNotes || ''
      };

      const response = await databases.updateDocument(
        config.databaseId,
        config.classSessionsCollectionId,
        sessionId,
        {
          status: 'completed',
          sessionTimes: stringifyJsonField(sessionTimesJson),
          sessionData: stringifyJsonField(sessionDataJson),
          updatedAt: new Date().toISOString()
        }
      );
      return transformClassSession(response);
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  // Student Rating Management
  createStudentRating: async (ratingData: Omit<StudentRating, '$id' | 'createdAt' | 'updatedAt'>): Promise<StudentRating> => {
    try {
      const { databases, config } = getAppwriteClient();
      const feedbackJson = {
        comments: ratingData.comments,
        strengths: ratingData.strengths,
        areasForImprovement: ratingData.areasForImprovement,
        recommendations: ratingData.recommendations
      };

      const response = await databases.createDocument(
        config.databaseId,
        config.studentRatingsCollectionId,
        ID.unique(),
        {
          instructorId: ratingData.instructorId,
          studentId: ratingData.studentId,
          classId: ratingData.classId,
          sessionId: ratingData.sessionId,
          date: ratingData.date,
          ratings: stringifyJsonField(ratingData.ratings),
          feedback: stringifyJsonField(feedbackJson),
          isVisible: ratingData.isVisible,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return transformStudentRating(response);
    } catch (error) {
      console.error('Error creating student rating:', error);
      throw error;
    }
  },

  getStudentRatings: async (filters: {
    studentId?: string;
    instructorId?: string;
    classId?: string;
    sessionId?: string;
  }): Promise<StudentRating[]> => {
    try {
      const { databases, config } = getAppwriteClient();
      const queries: string[] = [];
      
      if (filters.studentId) queries.push(Query.equal('studentId', filters.studentId));
      if (filters.instructorId) queries.push(Query.equal('instructorId', filters.instructorId));
      if (filters.classId) queries.push(Query.equal('classId', filters.classId));
      if (filters.sessionId) queries.push(Query.equal('sessionId', filters.sessionId));

      const response = await databases.listDocuments(
        config.databaseId,
        config.studentRatingsCollectionId,
        queries
      );
      return response.documents.map(transformStudentRating);
    } catch (error) {
      console.error('Error fetching student ratings:', error);
      throw error;
    }
  },

  updateStudentRating: async (ratingId: string, updates: Partial<StudentRating>): Promise<StudentRating> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Handle simple fields
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.isVisible !== undefined) updateData.isVisible = updates.isVisible;

      // Handle JSON fields
      if (updates.ratings) {
        updateData.ratings = stringifyJsonField(updates.ratings);
      }

      if (updates.comments || updates.strengths || updates.areasForImprovement || updates.recommendations) {
        const feedbackJson = {
          comments: updates.comments,
          strengths: updates.strengths,
          areasForImprovement: updates.areasForImprovement,
          recommendations: updates.recommendations
        };
        updateData.feedback = stringifyJsonField(feedbackJson);
      }

      const response = await databases.updateDocument(
        config.databaseId,
        config.studentRatingsCollectionId,
        ratingId,
        updateData
      );
      return transformStudentRating(response);
    } catch (error) {
      console.error('Error updating student rating:', error);
      throw error;
    }
  },

  // Online Session Management
  createOnlineSession: async (sessionData: Omit<OnlineSession, '$id' | 'createdAt' | 'updatedAt'>): Promise<OnlineSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const meetingDataJson = {
        password: sessionData.meetingPassword,
        attendees: sessionData.attendees,
        quality: sessionData.sessionQuality,
        issues: sessionData.technicalIssues
      };
      const recordingDataJson = {
        url: sessionData.recordingUrl,
        duration: sessionData.recordingDuration
      };
      const sessionContentJson = {
        chatLog: sessionData.chatLog,
        whiteboardData: sessionData.whiteboardData,
        sharedFiles: sessionData.sharedFiles
      };

      const response = await databases.createDocument(
        config.databaseId,
        config.onlineSessionsCollectionId,
        ID.unique(),
        {
          sessionId: sessionData.sessionId,
          meetingPlatform: sessionData.meetingPlatform,
          meetingId: sessionData.meetingId,
          meetingLink: sessionData.meetingLink,
          recordingEnabled: sessionData.recordingEnabled,
          meetingData: stringifyJsonField(meetingDataJson),
          recordingData: stringifyJsonField(recordingDataJson),
          sessionContent: stringifyJsonField(sessionContentJson),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return transformOnlineSession(response);
    } catch (error) {
      console.error('Error creating online session:', error);
      throw error;
    }
  },

  getOnlineSession: async (sessionId: string): Promise<OnlineSession | null> => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.onlineSessionsCollectionId,
        [Query.equal('sessionId', sessionId)]
      );
      return response.documents[0] ? transformOnlineSession(response.documents[0]) : null;
    } catch (error) {
      console.error('Error fetching online session:', error);
      throw error;
    }
  },

  updateOnlineSession: async (onlineSessionId: string, updates: Partial<OnlineSession>): Promise<OnlineSession> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };

      // Handle simple fields
      if (updates.meetingPlatform !== undefined) updateData.meetingPlatform = updates.meetingPlatform;
      if (updates.meetingId !== undefined) updateData.meetingId = updates.meetingId;
      if (updates.meetingLink !== undefined) updateData.meetingLink = updates.meetingLink;
      if (updates.recordingEnabled !== undefined) updateData.recordingEnabled = updates.recordingEnabled;

      // Handle JSON fields
      if (updates.meetingPassword || updates.attendees || updates.sessionQuality || updates.technicalIssues) {
        const meetingDataJson = {
          password: updates.meetingPassword,
          attendees: updates.attendees,
          quality: updates.sessionQuality,
          issues: updates.technicalIssues
        };
        updateData.meetingData = stringifyJsonField(meetingDataJson);
      }

      if (updates.recordingUrl || updates.recordingDuration) {
        const recordingDataJson = {
          url: updates.recordingUrl,
          duration: updates.recordingDuration
        };
        updateData.recordingData = stringifyJsonField(recordingDataJson);
      }

      if (updates.chatLog || updates.whiteboardData || updates.sharedFiles) {
        const sessionContentJson = {
          chatLog: updates.chatLog,
          whiteboardData: updates.whiteboardData,
          sharedFiles: updates.sharedFiles
        };
        updateData.sessionContent = stringifyJsonField(sessionContentJson);
      }

      const response = await databases.updateDocument(
        config.databaseId,
        config.onlineSessionsCollectionId,
        onlineSessionId,
        updateData
      );
      return transformOnlineSession(response);
    } catch (error) {
      console.error('Error updating online session:', error);
      throw error;
    }
  },

  // Schedule Management
  getInstructorSchedule: async (instructorId: string, date?: string): Promise<InstructorSchedule[]> => {
    try {
      const { databases, config } = getAppwriteClient();
      const queries = [Query.equal('instructorId', instructorId)];
      
      if (date) {
        queries.push(Query.equal('date', date));
      }

      const response = await databases.listDocuments(
        config.databaseId,
        config.instructorSchedulesCollectionId,
        queries
      );
      
      // Transform the documents to match InstructorSchedule interface
      return response.documents.map(doc => ({
        $id: doc.$id,
        instructorId: doc.instructorId,
        date: doc.date,
        timeSlots: parseJsonField(doc.timeSlots, []),
        totalClassesScheduled: doc.totalClassesScheduled,
        totalTeachingHours: doc.totalTeachingHours,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })) as InstructorSchedule[];
    } catch (error) {
      console.error('Error fetching instructor schedule:', error);
      throw error;
    }
  },

  createInstructorSchedule: async (scheduleData: Omit<InstructorSchedule, '$id' | 'createdAt' | 'updatedAt'>): Promise<InstructorSchedule> => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.createDocument(
        config.databaseId,
        config.instructorSchedulesCollectionId,
        ID.unique(),
        {
          instructorId: scheduleData.instructorId,
          date: scheduleData.date,
          timeSlots: stringifyJsonField(scheduleData.timeSlots),
          totalClassesScheduled: scheduleData.totalClassesScheduled,
          totalTeachingHours: scheduleData.totalTeachingHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      return {
        $id: response.$id,
        instructorId: response.instructorId,
        date: response.date,
        timeSlots: parseJsonField(response.timeSlots, []),
        totalClassesScheduled: response.totalClassesScheduled,
        totalTeachingHours: response.totalTeachingHours,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      } as InstructorSchedule;
    } catch (error) {
      console.error('Error creating instructor schedule:', error);
      throw error;
    }
  },

  updateInstructorSchedule: async (scheduleId: string, updates: Partial<InstructorSchedule>): Promise<InstructorSchedule> => {
    try {
      const { databases, config } = getAppwriteClient();
      const updateData: any = { updatedAt: new Date().toISOString() };
      
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.timeSlots !== undefined) updateData.timeSlots = stringifyJsonField(updates.timeSlots);
      if (updates.totalClassesScheduled !== undefined) updateData.totalClassesScheduled = updates.totalClassesScheduled;
      if (updates.totalTeachingHours !== undefined) updateData.totalTeachingHours = updates.totalTeachingHours;

      const response = await databases.updateDocument(
        config.databaseId,
        config.instructorSchedulesCollectionId,
        scheduleId,
        updateData
      );
      
      return {
        $id: response.$id,
        instructorId: response.instructorId,
        date: response.date,
        timeSlots: parseJsonField(response.timeSlots, []),
        totalClassesScheduled: response.totalClassesScheduled,
        totalTeachingHours: response.totalTeachingHours,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      } as InstructorSchedule;
    } catch (error) {
      console.error('Error updating instructor schedule:', error);
      throw error;
    }
  },

  // Analytics and Reports
  getInstructorAnalytics: async (instructorId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalStudentsRated: number;
    upcomingSessions: number;
  }> => {
    try {
      const [sessions, ratings] = await Promise.all([
        instructorService.getInstructorSessions(instructorId),
        instructorService.getStudentRatings({ instructorId })
      ]);

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;

      const totalStudentsRated = ratings.length;
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating.ratings.overall, 0) / ratings.length
        : 0;

      return {
        totalSessions,
        completedSessions,
        averageRating,
        totalStudentsRated,
        upcomingSessions
      };
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
      throw error;
    }
  }
};

export default instructorService;