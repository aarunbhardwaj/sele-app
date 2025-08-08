const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'app', '(admin)', '(users)', 'user-details.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the handleSaveChanges function
const handleSaveChangesStart = content.indexOf('const handleSaveChanges = async () => {');
const functionStart = content.substring(handleSaveChangesStart);
const openingBraceIndex = functionStart.indexOf('{') + 1;
const closingBraceIndex = findMatchingClosingBrace(functionStart, openingBraceIndex);
const oldFunction = functionStart.substring(0, closingBraceIndex + 1);

// Create the updated function
const newFunction = `const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Prepare updated user data - only include fields that exist in the database collection
      const updatedData = {
        displayName,
        status: isActive ? 'active' : 'suspended',
        isAdmin,
      };
      
      try {
        if (!user || !user.$id) {
          console.error("Missing document ID for update");
          Alert.alert('Error', 'User document ID is missing. Cannot update profile.');
          return;
        }
        
        console.log("Updating user with document ID:", user.$id);
        console.log("Update data:", updatedData);
        
        // Use the document ID ($id) for updates, not the userId
        await appwriteService.updateUserProfile(user.$id, updatedData);
        
        // If admin status changed, update roles
        if (isAdmin !== user?.isAdmin) {
          if (isAdmin) {
            // Find admin role ID
            const adminRole = roles.find(role => 
              role.name.toLowerCase().includes('admin')
            );
            
            if (adminRole) {
              await appwriteService.assignRoleToUser(user.userId, adminRole.$id);
            }
          } else {
            // Find admin role ID
            const adminRole = roles.find(role => 
              role.name.toLowerCase().includes('admin')
            );
            
            if (adminRole) {
              await appwriteService.removeRoleFromUser(user.userId, adminRole.$id);
            }
          }
        }
        
        Alert.alert('Success', 'User profile updated successfully');
        setEditMode(false);
        
        // Update local state
        setUser({
          ...user,
          ...updatedData
        });
      } catch (error) {
        console.error('Failed to update user:', error);
        Alert.alert('Error', 'Failed to update user profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };`;

// Replace the old function with the new one
const updatedContent = content.replace(oldFunction, newFunction);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent);
console.log('Updated handleSaveChanges function in user-details.tsx');

// Helper function to find the matching closing brace
function findMatchingClosingBrace(text, openingBraceIndex) {
  let braceCount = 1;
  let i = openingBraceIndex;
  
  while (braceCount > 0 && i < text.length) {
    i++;
    if (text[i] === '{') braceCount++;
    else if (text[i] === '}') braceCount--;
  }
  
  return i;
}
