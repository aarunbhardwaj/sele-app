const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;

async function recreateInstructorCollections() {
  try {
    console.log('Recreating instructor module collections with proper IDs...');
    
    // First, try to delete existing collections if they exist
    const oldCollectionNames = [
      'instructor_profiles',
      'class_assignments', 
      'class_sessions',
      'student_ratings',
      'online_sessions',
      'instructor_schedules'
    ];

    for (const collectionId of oldCollectionNames) {
      try {
        await databases.deleteCollection(DATABASE_ID, collectionId);
        console.log(`Deleted old collection: ${collectionId}`);
      } catch (error) {
        console.log(`Collection ${collectionId} doesn't exist or already deleted`);
      }
    }

    const collections = [];

    // 1. Instructor Profiles Collection
    console.log('Creating instructor_profiles collection...');
    const instructorProfilesId = ID.unique();
    const instructorProfiles = await databases.createCollection(
      DATABASE_ID,
      instructorProfilesId,
      'Instructor Profiles'
    );
    collections.push({ name: 'INSTRUCTOR_PROFILES', id: instructorProfilesId });

    // Create attributes for instructor profiles
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'userId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'displayName', 100, true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'email', 100, true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'phone', 20, false);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'profileData', 5000, false);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'status', 20, true);
    await databases.createIntegerAttribute(DATABASE_ID, instructorProfilesId, 'maxClasses', true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'currentAssignments', 2000, false);
    await databases.createFloatAttribute(DATABASE_ID, instructorProfilesId, 'rating', true);
    await databases.createIntegerAttribute(DATABASE_ID, instructorProfilesId, 'totalRatings', true);
    await databases.createBooleanAttribute(DATABASE_ID, instructorProfilesId, 'isActive', true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, instructorProfilesId, 'updatedAt', 30, true);

    // 2. Class Assignments Collection
    console.log('Creating class_assignments collection...');
    const classAssignmentsId = ID.unique();
    const classAssignments = await databases.createCollection(
      DATABASE_ID,
      classAssignmentsId,
      'Class Assignments'
    );
    collections.push({ name: 'CLASS_ASSIGNMENTS', id: classAssignmentsId });

    // Create attributes for class assignments
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'instructorId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'instructorName', 100, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'classId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'schoolId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'schoolName', 100, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'classDetails', 2000, false);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'startDate', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'endDate', 20, false);
    await databases.createBooleanAttribute(DATABASE_ID, classAssignmentsId, 'isTemporary', true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'assignedBy', 50, false);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'status', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'notes', 1000, false);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, classAssignmentsId, 'updatedAt', 30, true);

    // 3. Class Sessions Collection
    console.log('Creating class_sessions collection...');
    const classSessionsId = ID.unique();
    const classSessions = await databases.createCollection(
      DATABASE_ID,
      classSessionsId,
      'Class Sessions'
    );
    collections.push({ name: 'CLASS_SESSIONS', id: classSessionsId });

    // Create attributes for class sessions
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'classId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'instructorId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'schoolId', 50, false);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'sessionDate', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'timeSlot', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'sessionTimes', 500, false);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'sessionType', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'meetingLink', 500, false);
    await databases.createIntegerAttribute(DATABASE_ID, classSessionsId, 'attendanceCount', false);
    await databases.createIntegerAttribute(DATABASE_ID, classSessionsId, 'totalStudents', false);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'lessonTopic', 200, false);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'sessionData', 3000, false);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'status', 20, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, classSessionsId, 'updatedAt', 30, true);

    // 4. Student Ratings Collection
    console.log('Creating student_ratings collection...');
    const studentRatingsId = ID.unique();
    const studentRatings = await databases.createCollection(
      DATABASE_ID,
      studentRatingsId,
      'Student Ratings'
    );
    collections.push({ name: 'STUDENT_RATINGS', id: studentRatingsId });

    // Create attributes for student ratings
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'instructorId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'studentId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'classId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'sessionId', 50, false);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'date', 20, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'ratings', 1000, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'feedback', 2000, false);
    await databases.createBooleanAttribute(DATABASE_ID, studentRatingsId, 'isVisible', true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, studentRatingsId, 'updatedAt', 30, true);

    // 5. Online Sessions Collection
    console.log('Creating online_sessions collection...');
    const onlineSessionsId = ID.unique();
    const onlineSessions = await databases.createCollection(
      DATABASE_ID,
      onlineSessionsId,
      'Online Sessions'
    );
    collections.push({ name: 'ONLINE_SESSIONS', id: onlineSessionsId });

    // Create attributes for online sessions
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'sessionId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'meetingPlatform', 50, true);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'meetingId', 100, true);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'meetingLink', 500, true);
    await databases.createBooleanAttribute(DATABASE_ID, onlineSessionsId, 'recordingEnabled', true);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'meetingData', 2000, false);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'recordingData', 1000, false);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'sessionContent', 5000, false);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, onlineSessionsId, 'updatedAt', 30, true);

    // 6. Instructor Schedules Collection
    console.log('Creating instructor_schedules collection...');
    const instructorSchedulesId = ID.unique();
    const instructorSchedules = await databases.createCollection(
      DATABASE_ID,
      instructorSchedulesId,
      'Instructor Schedules'
    );
    collections.push({ name: 'INSTRUCTOR_SCHEDULES', id: instructorSchedulesId });

    // Create attributes for instructor schedules
    await databases.createStringAttribute(DATABASE_ID, instructorSchedulesId, 'instructorId', 50, true);
    await databases.createStringAttribute(DATABASE_ID, instructorSchedulesId, 'date', 20, true);
    await databases.createStringAttribute(DATABASE_ID, instructorSchedulesId, 'timeSlots', 3000, true);
    await databases.createIntegerAttribute(DATABASE_ID, instructorSchedulesId, 'totalClassesScheduled', true);
    await databases.createFloatAttribute(DATABASE_ID, instructorSchedulesId, 'totalTeachingHours', true);
    await databases.createStringAttribute(DATABASE_ID, instructorSchedulesId, 'createdAt', 30, true);
    await databases.createStringAttribute(DATABASE_ID, instructorSchedulesId, 'updatedAt', 30, true);

    console.log('\n✅ All instructor collections created successfully!');
    console.log('\nCollection IDs for .env file:');
    collections.forEach(collection => {
      console.log(`EXPO_PUBLIC_${collection.name}_COLLECTION_ID=${collection.id}`);
    });

    return collections;
  } catch (error) {
    console.error('❌ Error creating instructor collections:', error);
    throw error;
  }
}

recreateInstructorCollections().then(() => {
  console.log('\nScript completed successfully!');
}).catch(error => {
  console.error('Script failed:', error);
});