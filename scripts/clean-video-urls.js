const { Client, Databases, Query } = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68651f96001557986822';
const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '6865602f000c8cc789bc';
const LESSONS_COLLECTION_ID = process.env.EXPO_PUBLIC_LESSONS_COLLECTION_ID || '6865e600000561ebba31';

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);

/**
 * Clean video URLs by removing mode=admin parameter
 */
function cleanVideoUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    // Remove mode=admin parameter
    let cleanedUrl = url.replace(/[?&]mode=admin/g, '');
    
    // Clean up malformed URLs (double ampersands, trailing question marks, etc.)
    cleanedUrl = cleanedUrl
        .replace(/[?&]{2,}/g, '&')  // Remove multiple consecutive ? or &
        .replace(/[?&]$/, '')       // Remove trailing ? or &
        .replace(/\?&/, '?');       // Replace ?& with ?
    
    return cleanedUrl;
}

/**
 * Update video URLs in all lessons to remove mode=admin parameter
 */
async function cleanLessonVideoUrls() {
    try {
        console.log('🔧 Starting cleanup of lesson video URLs...');
        console.log(`Database: ${APPWRITE_DATABASE_ID}`);
        console.log(`Collection: ${LESSONS_COLLECTION_ID}`);
        
        let allLessons = [];
        let hasMore = true;
        let lastId = null;
        
        // Fetch all lessons in batches
        while (hasMore) {
            const queries = [Query.limit(100)];
            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }
            
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                LESSONS_COLLECTION_ID,
                queries
            );
            
            allLessons = allLessons.concat(response.documents);
            
            if (response.documents.length < 100) {
                hasMore = false;
            } else {
                lastId = response.documents[response.documents.length - 1].$id;
            }
        }
        
        console.log(`📊 Found ${allLessons.length} lessons to check`);
        
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const lesson of allLessons) {
            try {
                let needsUpdate = false;
                const updateData = {};
                
                // Check mediaUrls field
                if (lesson.mediaUrls) {
                    let cleanedMediaUrls = lesson.mediaUrls;
                    
                    if (Array.isArray(lesson.mediaUrls)) {
                        // Handle array of URLs
                        const cleanedArray = lesson.mediaUrls.map(url => {
                            const cleaned = cleanVideoUrl(url);
                            if (cleaned !== url) {
                                needsUpdate = true;
                            }
                            return cleaned;
                        });
                        cleanedMediaUrls = cleanedArray;
                    } else if (typeof lesson.mediaUrls === 'string') {
                        // Handle single URL string
                        const cleaned = cleanVideoUrl(lesson.mediaUrls);
                        if (cleaned !== lesson.mediaUrls) {
                            needsUpdate = true;
                            cleanedMediaUrls = cleaned;
                        }
                    }
                    
                    if (needsUpdate) {
                        updateData.mediaUrls = cleanedMediaUrls;
                    }
                }
                
                // Check mediaUrl field (legacy)
                if (lesson.mediaUrl) {
                    const cleanedMediaUrl = cleanVideoUrl(lesson.mediaUrl);
                    if (cleanedMediaUrl !== lesson.mediaUrl) {
                        needsUpdate = true;
                        updateData.mediaUrl = cleanedMediaUrl;
                    }
                }
                
                // Update the lesson if needed
                if (needsUpdate) {
                    console.log(`🔄 Updating lesson: ${lesson.title} (${lesson.$id})`);
                    console.log(`  Original mediaUrls: ${JSON.stringify(lesson.mediaUrls)}`);
                    console.log(`  Cleaned mediaUrls: ${JSON.stringify(updateData.mediaUrls)}`);
                    
                    await databases.updateDocument(
                        APPWRITE_DATABASE_ID,
                        LESSONS_COLLECTION_ID,
                        lesson.$id,
                        updateData
                    );
                    
                    updatedCount++;
                } else {
                    console.log(`✅ Lesson already clean: ${lesson.title}`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating lesson ${lesson.$id}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n📈 Cleanup Summary:');
        console.log(`  Total lessons checked: ${allLessons.length}`);
        console.log(`  Lessons updated: ${updatedCount}`);
        console.log(`  Errors: ${errorCount}`);
        console.log('✅ Video URL cleanup completed!');
        
    } catch (error) {
        console.error('❌ Failed to clean lesson video URLs:', error);
        throw error;
    }
}

// Run the cleanup
if (require.main === module) {
    cleanLessonVideoUrls()
        .then(() => {
            console.log('🎉 Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { cleanLessonVideoUrls, cleanVideoUrl };