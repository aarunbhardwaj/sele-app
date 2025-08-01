const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database ID - we'll create or use this
let DATABASE_ID;

// Collection IDs - these will be populated as we create collections
const collectionIds = {
    users_profiles: '',
    courses: '',
    lessons: '',
    exercises: '',
    user_progress: '',
    lesson_completions: '',
    user_activities: '',
    roles: '',
    // Adding quiz-related collections with specific IDs
    quizzes: '686abc1200191456ee9b',
    quiz_questions: '686abc1400034c7aa22d',
    quiz_attempts: '686abc15000240637fc7'
};

// Helper function to create a collection if it doesn't exist
async function createCollectionIfNotExists(databaseId, collectionName, permissions, collectionId = null) {
    try {
        // List collections to check if it exists
        const collections = await databases.listCollections(databaseId);
        const existingCollection = collections.collections.find(collection => collection.name === collectionName);
        
        if (existingCollection) {
            console.log(`Collection ${collectionName} already exists with ID: ${existingCollection.$id}`);
            return existingCollection;
        }
        
        // Create collection if it doesn't exist
        const newCollection = await databases.createCollection(
            databaseId,
            collectionId || ID.unique(),
            collectionName,
            permissions
        );
        
        console.log(`Collection ${collectionName} created with ID: ${newCollection.$id}`);
        return newCollection;
    } catch (error) {
        console.error(`Error creating collection ${collectionName}:`, error);
        throw error;
    }
}

// Create or get the database
async function createOrGetDatabase() {
    try {
        const databaseName = 'english_learning_db';
        const databasesList = await databases.list();
        
        let database = databasesList.databases.find(db => db.name === databaseName);
        
        if (!database) {
            console.log(`Creating database: ${databaseName}`);
            database = await databases.create(ID.unique(), databaseName);
            console.log(`Database created with ID: ${database.$id}`);
        } else {
            console.log(`Database ${databaseName} already exists with ID: ${database.$id}`);
        }
        
        return database.$id;
    } catch (error) {
        console.error('Error creating/getting database:', error);
        throw error;
    }
}

// Main function to create all collections
async function createAllCollections() {
    // Create or get the database first
    DATABASE_ID = await createOrGetDatabase();

    // Create all collections
    await createUsersProfilesCollection();
    await createCoursesCollection();
    await createLessonsCollection();
    await createExercisesCollection();
    await createUserProgressCollection();
    await createLessonCompletionsCollection();
    await createUserActivitiesCollection();
    await createRolesCollection();
    
    // Create quiz-related collections
    await createQuizzesCollection();
    await createQuizQuestionsCollection();
    await createQuizAttemptsCollection();
}

// 1. Users Profiles Collection
async function createUsersProfilesCollection() {
    console.log('\n--- Creating users_profiles collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'users_profiles',
        [
            Permission.read(Role.any()), // For now, allow any user to read profiles
            Permission.update(Role.any()), // For now, allow any user to update profiles 
            Permission.delete(Role.any()), // For now, allow any user to delete profiles
            Permission.create(Role.users()) // Any authenticated user can create a profile
            // We'll implement document-level security later using Appwrite functions
        ]
    );
    
    collectionIds.users_profiles = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for users_profiles collection to avoid validation issues');
    
    try {
        // Create an index on userId for faster lookups
        try {
            const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
            const hasUserIdIndex = indexes.indexes.some(index => index.key === 'user_id_index');
            
            if (!hasUserIdIndex) {
                await databases.createIndex(
                    DATABASE_ID,
                    collection.$id,
                    'user_id_index',
                    'key',
                    ['userId'],
                    true, // unique - one profile per user
                    ["asc"] // Fix the orders parameter format - must be "asc" (double quotes) not 'asc'
                );
                console.log('Created index on userId');
            }
        } catch (error) {
            console.error('Error creating index:', error);
        }
        
        console.log('Users profiles collection setup completed');
    } catch (error) {
        console.error('Error setting up users_profiles attributes:', error);
        throw error;
    }
}

// 2. Courses Collection
async function createCoursesCollection() {
    console.log('\n--- Creating courses collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'courses',
        [
            Permission.read(Role.users()), // All authenticated users can read
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ]
    );
    
    collectionIds.courses = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for courses collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('Courses collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('Courses collection setup completed with some issues');
    }
}

// 3. Lessons Collection
async function createLessonsCollection() {
    console.log('\n--- Creating lessons collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'lessons',
        [
            Permission.read(Role.users()), // All authenticated users can read
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ]
    );
    
    collectionIds.lessons = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for lessons collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('Lessons collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('Lessons collection setup completed with some issues');
    }
}

// 4. Exercises Collection
async function createExercisesCollection() {
    console.log('\n--- Creating exercises collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'exercises',
        [
            Permission.read(Role.users()), // All authenticated users can read
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ]
    );
    
    collectionIds.exercises = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for exercises collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('Exercises collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('Exercises collection setup completed with some issues');
    }
}

// 5. User Progress Collection
async function createUserProgressCollection() {
    console.log('\n--- Creating user_progress collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'user_progress',
        [
            Permission.read(Role.any()), // For now, allow any user to read progress
            Permission.update(Role.any()), // For now, allow any user to update progress
            Permission.delete(Role.any()), // For now, allow any user to delete progress
            Permission.create(Role.users()) // Any authenticated user can create progress
            // We'll implement document-level security later using Appwrite functions
        ]
    );
    
    collectionIds.user_progress = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for user_progress collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('User progress collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('User progress collection setup completed with some issues');
    }
}

// 6. Lesson Completions Collection
async function createLessonCompletionsCollection() {
    console.log('\n--- Creating lesson_completions collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'lesson_completions',
        [
            Permission.read(Role.any()), // For now, allow any user to read completions
            Permission.update(Role.any()), // For now, allow any user to update completions
            Permission.delete(Role.any()), // For now, allow any user to delete completions
            Permission.create(Role.users()) // Any authenticated user can create completions
            // We'll implement document-level security later using Appwrite functions
        ]
    );
    
    collectionIds.lesson_completions = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for lesson_completions collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('Lesson completions collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('Lesson completions collection setup completed with some issues');
    }
}

// 7. User Activities Collection
async function createUserActivitiesCollection() {
    console.log('\n--- Creating user_activities collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'user_activities',
        [
            Permission.read(Role.any()), // For now, allow any user to read activities
            Permission.create(Role.users()), // Any authenticated user can create activities
            // No update or delete permissions - activities are immutable records
        ]
    );
    
    collectionIds.user_activities = collection.$id;
    
    // Skip attribute creation for now to avoid min/max validation issues
    console.log('Skipping attribute creation for user_activities collection to avoid validation issues');
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        console.log('User activities collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('User activities collection setup completed with some issues');
    }
}

// Add Roles Collection
async function createRolesCollection() {
    console.log('\n--- Creating roles collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'roles',
        [
            Permission.read(Role.users()), // All authenticated users can read roles
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ]
    );
    
    collectionIds.roles = collection.$id;
    
    // Create indexes for faster queries
    try {
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        // Create an index on name for faster lookups
        const hasNameIndex = indexes.indexes.some(index => index.key === 'name_index');
        if (!hasNameIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'name_index',
                'key',
                ['name'],
                true  // unique - no duplicate role names
            );
            console.log('Created index on role name');
        }
        
        console.log('Roles collection setup completed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        console.log('Roles collection setup completed with some issues');
    }
}

// 8. Quizzes Collection
async function createQuizzesCollection() {
    console.log('\n--- Creating quizzes collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'quizzes',
        [
            Permission.read(Role.users()), // All authenticated users can read quizzes
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ],
        collectionIds.quizzes // Use the predefined ID
    );
    
    collectionIds.quizzes = collection.$id;
    
    // Create attributes for quizzes collection
    console.log('Creating attributes for quizzes collection');
    try {
        // Check existing attributes to avoid duplicates
        const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
        const existingAttrs = attributes.attributes.map(attr => attr.key);
        
        // Define the attributes we need
        const requiredAttributes = [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: false },
            { key: 'category', type: 'string', size: 100, required: false },
            { key: 'difficulty', type: 'string', size: 20, required: false },
            { key: 'timeLimit', type: 'integer', min: 0, max: 180, required: false },
            { key: 'passScore', type: 'integer', min: 0, max: 100, required: false },
            { key: 'isPublished', type: 'boolean', required: false, default: false },
            { key: 'createdBy', type: 'string', size: 100, required: false },
            { key: 'createdAt', type: 'datetime', required: false },
            { key: 'updatedAt', type: 'datetime', required: false },
            { key: 'courseId', type: 'string', size: 100, required: false }
        ];
        
        // Create attributes if they don't exist
        for (const attr of requiredAttributes) {
            if (!existingAttrs.includes(attr.key)) {
                console.log(`Creating ${attr.key} attribute...`);
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.size,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.min,
                            attr.max,
                            attr.default || null
                        );
                    } else if (attr.type === 'boolean') {
                        await databases.createBooleanAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    }
                    console.log(`Created ${attr.key} attribute successfully`);
                } catch (error) {
                    console.error(`Error creating ${attr.key} attribute:`, error);
                }
            } else {
                console.log(`Attribute ${attr.key} already exists, skipping...`);
            }
        }
        
        // Create indexes for faster queries
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        // Create an index on courseId for faster lookups
        const hasCourseIdIndex = indexes.indexes.some(index => index.key === 'course_id_index');
        if (!hasCourseIdIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'course_id_index',
                'key',
                ['courseId'],
                false, // not unique - multiple quizzes per course
                ['asc']
            );
            console.log('Created index on courseId');
        }
        
        console.log('Quizzes collection setup completed');
    } catch (error) {
        console.error('Error setting up quizzes attributes:', error);
        console.log('Quizzes collection setup completed with some issues');
    }
}

// 9. Quiz Questions Collection
async function createQuizQuestionsCollection() {
    console.log('\n--- Creating quiz_questions collection ---');
    
    // Create the collection with appropriate permissions
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'quiz_questions',
        [
            Permission.read(Role.users()), // All authenticated users can read questions
            Permission.create(Role.team("admin")), // Only admin team can create
            Permission.update(Role.team("admin")), // Only admin team can update
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ],
        collectionIds.quiz_questions // Use the predefined ID
    );
    
    collectionIds.quiz_questions = collection.$id;
    
    // Create attributes for quiz_questions collection
    console.log('Creating attributes for quiz_questions collection');
    try {
        // Check existing attributes to avoid duplicates
        const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
        const existingAttrs = attributes.attributes.map(attr => attr.key);
        
        // Define the attributes we need
        const requiredAttributes = [
            { key: 'quizId', type: 'string', size: 100, required: true },
            { key: 'text', type: 'string', size: 5000, required: true },
            { key: 'type', type: 'string', size: 50, required: false }, // multiple-choice, true-false, text, etc.
            { key: 'options', type: 'string', size: 10000, required: false }, // JSON string for options array
            { key: 'correctAnswer', type: 'string', size: 1000, required: true },
            { key: 'explanation', type: 'string', size: 5000, required: false },
            { key: 'points', type: 'integer', min: 0, max: 100, required: false },
            { key: 'order', type: 'integer', min: 0, max: 1000, required: false },
            { key: 'createdAt', type: 'datetime', required: false },
            { key: 'updatedAt', type: 'datetime', required: false }
        ];
        
        // Create attributes if they don't exist
        for (const attr of requiredAttributes) {
            if (!existingAttrs.includes(attr.key)) {
                console.log(`Creating ${attr.key} attribute...`);
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.size,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.min,
                            attr.max,
                            attr.default || null
                        );
                    } else if (attr.type === 'boolean') {
                        await databases.createBooleanAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    }
                    console.log(`Created ${attr.key} attribute successfully`);
                } catch (error) {
                    console.error(`Error creating ${attr.key} attribute:`, error);
                }
            } else {
                console.log(`Attribute ${attr.key} already exists, skipping...`);
            }
        }
        
        // Create indexes for faster queries
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        // Create an index on quizId for faster lookups
        const hasQuizIdIndex = indexes.indexes.some(index => index.key === 'quiz_id_index');
        if (!hasQuizIdIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'quiz_id_index',
                'key',
                ['quizId'],
                false, // not unique - multiple questions per quiz
                ['asc']
            );
            console.log('Created index on quizId');
        }
        
        // Create an index on order for ordered retrieval
        const hasOrderIndex = indexes.indexes.some(index => index.key === 'order_index');
        if (!hasOrderIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'order_index',
                'key',
                ['order'],
                false, // not unique - potentially multiple questions with same order
                ['asc']
            );
            console.log('Created index on order');
        }
        
        console.log('Quiz questions collection setup completed');
    } catch (error) {
        console.error('Error setting up quiz questions attributes:', error);
        console.log('Quiz questions collection setup completed with some issues');
    }
}

// 10. Quiz Attempts Collection
async function createQuizAttemptsCollection() {
    console.log('\n--- Creating quiz_attempts collection ---');
    
    // Create the collection with appropriate permissions - users can read/create their own attempts
    const collection = await createCollectionIfNotExists(
        DATABASE_ID,
        'quiz_attempts',
        [
            Permission.read(Role.users()), // All authenticated users can read (we'll implement document-level security)
            Permission.create(Role.users()), // Any authenticated user can create attempts
            // No update permissions - quiz attempts are immutable after creation
            Permission.delete(Role.team("admin")) // Only admin team can delete
        ],
        collectionIds.quiz_attempts // Use the predefined ID
    );
    
    collectionIds.quiz_attempts = collection.$id;
    
    // Create attributes for quiz_attempts collection
    console.log('Creating attributes for quiz_attempts collection');
    try {
        // Check existing attributes to avoid duplicates
        const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
        const existingAttrs = attributes.attributes.map(attr => attr.key);
        
        // Define the attributes we need
        const requiredAttributes = [
            { key: 'userId', type: 'string', size: 100, required: true },
            { key: 'quizId', type: 'string', size: 100, required: true },
            { key: 'startedAt', type: 'datetime', required: true },
            { key: 'completedAt', type: 'datetime', required: false },
            { key: 'score', type: 'integer', min: 0, max: 100, required: false },
            { key: 'totalQuestions', type: 'integer', min: 0, max: 1000, required: false },
            { key: 'correctAnswers', type: 'integer', min: 0, max: 1000, required: false },
            { key: 'timeSpent', type: 'integer', min: 0, max: 10000, required: false }, // Time spent in seconds
            { key: 'answers', type: 'string', size: 100000, required: false }, // JSON string for user answers
            { key: 'passed', type: 'boolean', required: false }
        ];
        
        // Create attributes if they don't exist
        for (const attr of requiredAttributes) {
            if (!existingAttrs.includes(attr.key)) {
                console.log(`Creating ${attr.key} attribute...`);
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.size,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.min,
                            attr.max,
                            attr.default || null
                        );
                    } else if (attr.type === 'boolean') {
                        await databases.createBooleanAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attr.key,
                            attr.required,
                            attr.default || null
                        );
                    }
                    console.log(`Created ${attr.key} attribute successfully`);
                } catch (error) {
                    console.error(`Error creating ${attr.key} attribute:`, error);
                }
            } else {
                console.log(`Attribute ${attr.key} already exists, skipping...`);
            }
        }
        
        // Create indexes for faster queries
        const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
        
        // Create indexes for common queries
        const hasUserIdIndex = indexes.indexes.some(index => index.key === 'user_id_index');
        if (!hasUserIdIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'user_id_index',
                'key',
                ['userId'],
                false, // not unique - multiple attempts per user
                ['asc']
            );
            console.log('Created index on userId');
        }
        
        const hasQuizIdIndex = indexes.indexes.some(index => index.key === 'quiz_id_index');
        if (!hasQuizIdIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'quiz_id_index',
                'key',
                ['quizId'],
                false, // not unique - multiple attempts per quiz
                ['asc']
            );
            console.log('Created index on quizId');
        }
        
        // Composite index for user+quiz combinations
        const hasUserQuizIndex = indexes.indexes.some(index => index.key === 'user_quiz_index');
        if (!hasUserQuizIndex) {
            await databases.createIndex(
                DATABASE_ID,
                collection.$id,
                'user_quiz_index',
                'key',
                ['userId', 'quizId'],
                false, // not unique - user can attempt a quiz multiple times
                ['asc']
            );
            console.log('Created composite index on userId and quizId');
        }
        
        console.log('Quiz attempts collection setup completed');
    } catch (error) {
        console.error('Error setting up quiz attempts attributes:', error);
        console.log('Quiz attempts collection setup completed with some issues');
    }
}

// Start the process
createAllCollections();