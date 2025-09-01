const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

async function createInstructorCollections() {
    try {
        console.log('Creating instructor module collections...');

        // 1. Instructor Profiles Collection (Simplified)
        console.log('Creating instructor_profiles collection...');
        const instructorProfiles = await databases.createCollection(
            DATABASE_ID,
            'instructor_profiles',
            'Instructor Profiles',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        // Simplified attributes for instructor_profiles
        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'userId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'displayName', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'email', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'phone', 20, false),
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'profileData', 5000, false), // JSON: bio, specialization, experience, qualifications, location
            databases.createEnumAttribute(DATABASE_ID, 'instructor_profiles', 'status', ['available', 'assigned', 'unavailable', 'on-leave'], true),
            databases.createIntegerAttribute(DATABASE_ID, 'instructor_profiles', 'maxClasses', true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_profiles', 'currentAssignments', 2000, false), // JSON array as string
            databases.createFloatAttribute(DATABASE_ID, 'instructor_profiles', 'rating', false),
            databases.createIntegerAttribute(DATABASE_ID, 'instructor_profiles', 'totalRatings', false),
            databases.createBooleanAttribute(DATABASE_ID, 'instructor_profiles', 'isActive', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'instructor_profiles', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'instructor_profiles', 'updatedAt', true)
        ]);

        // 2. Class Assignments Collection (Simplified)
        console.log('Creating class_assignments collection...');
        const classAssignments = await databases.createCollection(
            DATABASE_ID,
            'class_assignments',
            'Class Assignments',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'instructorId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'instructorName', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'classId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'schoolId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'schoolName', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'classDetails', 2000, true), // JSON: className, subject, grade, schedule
            databases.createDatetimeAttribute(DATABASE_ID, 'class_assignments', 'startDate', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'class_assignments', 'endDate', false),
            databases.createBooleanAttribute(DATABASE_ID, 'class_assignments', 'isTemporary', true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'assignedBy', 255, true),
            databases.createEnumAttribute(DATABASE_ID, 'class_assignments', 'status', ['active', 'pending', 'completed', 'cancelled'], true),
            databases.createStringAttribute(DATABASE_ID, 'class_assignments', 'notes', 1000, false),
            databases.createDatetimeAttribute(DATABASE_ID, 'class_assignments', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'class_assignments', 'updatedAt', true)
        ]);

        // 3. Class Sessions Collection (Simplified)
        console.log('Creating class_sessions collection...');
        const classSessions = await databases.createCollection(
            DATABASE_ID,
            'class_sessions',
            'Class Sessions',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'classId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'instructorId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'schoolId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'sessionDate', 20, true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'timeSlot', 50, true), // "10:00-11:00"
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'sessionTimes', 500, false), // JSON: actualStartTime, actualEndTime
            databases.createEnumAttribute(DATABASE_ID, 'class_sessions', 'sessionType', ['in-person', 'online', 'hybrid'], true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'meetingLink', 500, false),
            databases.createIntegerAttribute(DATABASE_ID, 'class_sessions', 'attendanceCount', true),
            databases.createIntegerAttribute(DATABASE_ID, 'class_sessions', 'totalStudents', true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'lessonTopic', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'class_sessions', 'sessionData', 3000, false), // JSON: materials, homework, sessionNotes, cancellationReason
            databases.createEnumAttribute(DATABASE_ID, 'class_sessions', 'status', ['scheduled', 'ongoing', 'completed', 'cancelled'], true),
            databases.createDatetimeAttribute(DATABASE_ID, 'class_sessions', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'class_sessions', 'updatedAt', true)
        ]);

        // 4. Student Ratings Collection (Simplified)
        console.log('Creating student_ratings collection...');
        const studentRatings = await databases.createCollection(
            DATABASE_ID,
            'student_ratings',
            'Student Ratings',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'instructorId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'studentId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'classId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'sessionId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'date', 20, true),
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'ratings', 1000, true), // JSON object: all ratings
            databases.createStringAttribute(DATABASE_ID, 'student_ratings', 'feedback', 3000, true), // JSON: comments, strengths, areasForImprovement, recommendations
            databases.createBooleanAttribute(DATABASE_ID, 'student_ratings', 'isVisible', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'student_ratings', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'student_ratings', 'updatedAt', true)
        ]);

        // 5. Online Sessions Collection (Simplified)
        console.log('Creating online_sessions collection...');
        const onlineSessions = await databases.createCollection(
            DATABASE_ID,
            'online_sessions',
            'Online Sessions',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'sessionId', 255, true),
            databases.createEnumAttribute(DATABASE_ID, 'online_sessions', 'meetingPlatform', ['zoom', 'teams', 'google-meet', 'custom'], true),
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'meetingId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'meetingLink', 500, true),
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'meetingData', 3000, false), // JSON: password, attendees, quality, issues
            databases.createBooleanAttribute(DATABASE_ID, 'online_sessions', 'recordingEnabled', true),
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'recordingData', 2000, false), // JSON: url, duration
            databases.createStringAttribute(DATABASE_ID, 'online_sessions', 'sessionContent', 10000, false), // JSON: chatLog, whiteboardData, sharedFiles
            databases.createDatetimeAttribute(DATABASE_ID, 'online_sessions', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'online_sessions', 'updatedAt', true)
        ]);

        // 6. Instructor Schedules Collection (Simplified)
        console.log('Creating instructor_schedules collection...');
        const instructorSchedules = await databases.createCollection(
            DATABASE_ID,
            'instructor_schedules',
            'Instructor Schedules',
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await Promise.all([
            databases.createStringAttribute(DATABASE_ID, 'instructor_schedules', 'instructorId', 255, true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_schedules', 'date', 20, true),
            databases.createStringAttribute(DATABASE_ID, 'instructor_schedules', 'timeSlots', 5000, true), // JSON array of time slots
            databases.createIntegerAttribute(DATABASE_ID, 'instructor_schedules', 'totalClassesScheduled', true),
            databases.createIntegerAttribute(DATABASE_ID, 'instructor_schedules', 'totalTeachingHours', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'instructor_schedules', 'createdAt', true),
            databases.createDatetimeAttribute(DATABASE_ID, 'instructor_schedules', 'updatedAt', true)
        ]);

        // Create indexes for better performance
        console.log('Creating indexes...');
        
        // Wait a bit for collections to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Instructor Profiles indexes
        await databases.createIndex(DATABASE_ID, 'instructor_profiles', 'userId_index', 'key', ['userId']);
        await databases.createIndex(DATABASE_ID, 'instructor_profiles', 'email_index', 'key', ['email']);
        await databases.createIndex(DATABASE_ID, 'instructor_profiles', 'status_index', 'key', ['status']);

        // Class Assignments indexes
        await databases.createIndex(DATABASE_ID, 'class_assignments', 'instructorId_index', 'key', ['instructorId']);
        await databases.createIndex(DATABASE_ID, 'class_assignments', 'classId_index', 'key', ['classId']);
        await databases.createIndex(DATABASE_ID, 'class_assignments', 'schoolId_index', 'key', ['schoolId']);
        await databases.createIndex(DATABASE_ID, 'class_assignments', 'status_index', 'key', ['status']);

        // Class Sessions indexes
        await databases.createIndex(DATABASE_ID, 'class_sessions', 'instructorId_index', 'key', ['instructorId']);
        await databases.createIndex(DATABASE_ID, 'class_sessions', 'classId_index', 'key', ['classId']);
        await databases.createIndex(DATABASE_ID, 'class_sessions', 'sessionDate_index', 'key', ['sessionDate']);
        await databases.createIndex(DATABASE_ID, 'class_sessions', 'status_index', 'key', ['status']);

        // Student Ratings indexes
        await databases.createIndex(DATABASE_ID, 'student_ratings', 'instructorId_index', 'key', ['instructorId']);
        await databases.createIndex(DATABASE_ID, 'student_ratings', 'studentId_index', 'key', ['studentId']);
        await databases.createIndex(DATABASE_ID, 'student_ratings', 'classId_index', 'key', ['classId']);
        await databases.createIndex(DATABASE_ID, 'student_ratings', 'date_index', 'key', ['date']);

        // Online Sessions indexes
        await databases.createIndex(DATABASE_ID, 'online_sessions', 'sessionId_index', 'key', ['sessionId']);
        await databases.createIndex(DATABASE_ID, 'online_sessions', 'meetingId_index', 'key', ['meetingId']);

        // Instructor Schedules indexes
        await databases.createIndex(DATABASE_ID, 'instructor_schedules', 'instructorId_index', 'key', ['instructorId']);
        await databases.createIndex(DATABASE_ID, 'instructor_schedules', 'date_index', 'key', ['date']);

        console.log('✅ All instructor module collections created successfully!');
        console.log('Collections created:');
        console.log('- instructor_profiles');
        console.log('- class_assignments');
        console.log('- class_sessions');
        console.log('- student_ratings');
        console.log('- online_sessions');
        console.log('- instructor_schedules');

    } catch (error) {
        console.error('❌ Error creating instructor collections:', error);
        
        // More specific error handling
        if (error.code === 409) {
            console.log('Some collections may already exist. This is normal if running the script multiple times.');
        } else {
            throw error;
        }
    }
}

// Run the script
createInstructorCollections()
    .then(() => {
        console.log('Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });