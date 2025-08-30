require('dotenv').config();
const { Client, Databases, Permission, Role, ID } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = '6865602f000c8cc789bc';
const CLASSES_COLLECTION_ID = ID.unique();

async function createClassesCollection() {
    try {
        console.log('Creating Classes collection...');
        
        // Create the classes collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            CLASSES_COLLECTION_ID,
            'classes',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        console.log('Classes collection created successfully:', collection.name);
        console.log('Collection ID:', collection.$id);

        // Create attributes for the classes collection
        const attributes = [
            // Basic class information
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'code', type: 'string', size: 50, required: true }, // Unique class code like "MATH-101-A"
            
            // Relationships - Core for the signup flow
            { key: 'schoolId', type: 'string', size: 100, required: true }, // Which school this class belongs to
            { key: 'courseId', type: 'string', size: 100, required: true }, // Auto-assigned course for this class
            { key: 'instructorId', type: 'string', size: 100, required: false }, // Admin assigns instructor later
            { key: 'instructorName', type: 'string', size: 255, required: false }, // Cached instructor name
            
            // Class categorization
            { key: 'subject', type: 'string', size: 100, required: true }, // Math, Science, English, etc.
            { key: 'grade', type: 'string', size: 20, required: true }, // Grade 1, Grade 2, etc.
            { key: 'section', type: 'string', size: 10, required: false }, // A, B, C sections
            { key: 'level', type: 'string', size: 50, required: false }, // beginner, intermediate, advanced
            { key: 'academicYear', type: 'string', size: 20, required: true }, // 2024-2025
            { key: 'semester', type: 'string', size: 20, required: false }, // Fall, Spring, Summer
            
            // Enrollment management
            { key: 'maxStudents', type: 'integer', required: false }, // Maximum capacity
            { key: 'currentEnrollment', type: 'integer', required: false }, // Current number of enrolled students
            { key: 'enrolledStudents', type: 'string', size: 10000, required: false }, // JSON array of student IDs
            { key: 'waitingList', type: 'string', size: 2000, required: false }, // JSON array of student IDs on waiting list
            { key: 'allowWaitlist', type: 'boolean', required: false }, // Whether to allow waitlist when full
            
            // Scheduling information
            { key: 'schedule', type: 'string', size: 500, required: false }, // JSON schedule object
            { key: 'meetingDays', type: 'string', size: 100, required: false }, // "Monday,Wednesday,Friday"
            { key: 'startTime', type: 'string', size: 20, required: false }, // "09:00"
            { key: 'endTime', type: 'string', size: 20, required: false }, // "10:30"
            { key: 'duration', type: 'integer', required: false }, // Class duration in minutes
            { key: 'timezone', type: 'string', size: 50, required: false }, // America/New_York
            { key: 'room', type: 'string', size: 100, required: false }, // Physical or virtual room
            
            // Class status and settings
            { key: 'status', type: 'string', size: 50, required: true }, // active, inactive, full, archived
            { key: 'enrollmentStatus', type: 'string', size: 50, required: true }, // open, closed, waitlist-only
            { key: 'type', type: 'string', size: 50, required: false }, // in-person, online, hybrid
            { key: 'isPublic', type: 'boolean', required: false }, // Whether visible in public class listing
            { key: 'requiresApproval', type: 'boolean', required: false }, // Whether enrollment needs approval
            { key: 'isActive', type: 'boolean', required: true }, // Whether class is currently active
            
            // Learning management
            { key: 'syllabus', type: 'string', size: 10000, required: false }, // JSON syllabus object
            { key: 'materials', type: 'string', size: 10000, required: false }, // JSON array of materials
            { key: 'assignments', type: 'string', size: 10000, required: false }, // JSON array of assignments
            { key: 'gradingPolicy', type: 'string', size: 2000, required: false }, // JSON grading policy
            
            // Virtual class settings
            { key: 'meetingUrl', type: 'string', size: 500, required: false }, // Zoom/Teams meeting URL
            { key: 'meetingId', type: 'string', size: 100, required: false }, // Meeting ID
            { key: 'meetingPassword', type: 'string', size: 100, required: false }, // Meeting password
            { key: 'recordingUrl', type: 'string', size: 500, required: false }, // Recording URL
            { key: 'recordingSettings', type: 'string', size: 1000, required: false }, // JSON recording settings
            
            // Metadata
            { key: 'tags', type: 'string', size: 1000, required: false }, // JSON array of tags
            { key: 'notes', type: 'string', size: 2000, required: false }, // Admin notes
            { key: 'startDate', type: 'datetime', required: false }, // Class start date
            { key: 'endDate', type: 'datetime', required: false }, // Class end date
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true }
        ];

        console.log('Creating attributes...');
        
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        CLASSES_COLLECTION_ID,
                        attr.key,
                        attr.size,
                        attr.required
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        CLASSES_COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        CLASSES_COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        CLASSES_COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                }
                console.log(`✓ Created attribute: ${attr.key}`);
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error creating attribute ${attr.key}:`, error.message);
            }
        }

        // Create indexes for better performance and queries
        console.log('Creating indexes...');
        
        const indexes = [
            { name: 'schoolIdIndex', keys: ['schoolId'] },
            { name: 'courseIdIndex', keys: ['courseId'] },
            { name: 'instructorIdIndex', keys: ['instructorId'] },
            { name: 'statusIndex', keys: ['status'] },
            { name: 'enrollmentStatusIndex', keys: ['enrollmentStatus'] },
            { name: 'subjectGradeIndex', keys: ['subject', 'grade'] },
            { name: 'academicYearIndex', keys: ['academicYear'] },
            { name: 'schoolSubjectIndex', keys: ['schoolId', 'subject'] },
            { name: 'schoolGradeIndex', keys: ['schoolId', 'grade'] },
            { name: 'activeClassesIndex', keys: ['isActive', 'status'] },
            { name: 'enrollmentSearchIndex', keys: ['schoolId', 'isActive', 'enrollmentStatus'] }
        ];
        
        for (const index of indexes) {
            try {
                await databases.createIndex(
                    DATABASE_ID,
                    CLASSES_COLLECTION_ID,
                    index.name,
                    'key',
                    index.keys
                );
                console.log(`✓ Created index: ${index.name}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error creating index ${index.name}:`, error.message);
            }
        }

        console.log('Classes collection setup completed successfully!');
        console.log(`\nAdd this to your .env file:`);
        console.log(`EXPO_PUBLIC_CLASSES_COLLECTION_ID=${collection.$id}`);
        
        console.log(`\nClass collection structure supports the following workflow:`);
        console.log(`1. Student selects school during signup`);
        console.log(`2. Student selects from available classes in that school`);
        console.log(`3. Course is automatically assigned based on the selected class`);
        console.log(`4. Admin can later assign instructors to classes`);
        console.log(`5. Classes can be organized by subject, grade, section, and academic year`);
        
    } catch (error) {
        if (error.code === 409) {
            console.log('Classes collection already exists');
        } else {
            console.error('Error creating classes collection:', error);
        }
    }
}

// Run the script
createClassesCollection()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });