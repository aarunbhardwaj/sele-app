const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'app', '(admin)', '(users)', 'user-details.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Update the state variables
content = content.replace(
  /\/\/ Editable user fields[\s\S]+?const \[isAdmin, setIsAdmin\] = useState\(false\);/m,
  `// Editable user fields
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [englishLevel, setEnglishLevel] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState('15');
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);`
);

// Update the loadUserData function
content = content.replace(
  /setDisplayName\(userData\.displayName \|\| ''\);[\s\S]+?setIsAdmin\(userData\.isAdmin \|\| false\);/m,
  `setDisplayName(userData.displayName || '');
          setProfileImage(userData.profileImage || '');
          setNativeLanguage(userData.nativeLanguage || '');
          setEnglishLevel(userData.englishLevel || 'beginner');
          setLearningGoal(userData.learningGoal || '');
          setDailyGoalMinutes(userData.dailyGoalMinutes ? userData.dailyGoalMinutes.toString() : '15');
          setIsActive(userData.status !== 'suspended');
          setIsAdmin(userData.isAdmin || false);`
);

// Update the handleSaveChanges function
content = content.replace(
  /const updatedData = {[\s\S]+?};/m,
  `const updatedData = {
        displayName,
        profileImage,
        nativeLanguage,
        englishLevel,
        learningGoal,
        dailyGoalMinutes: parseInt(dailyGoalMinutes, 10) || 15,
        status: isActive ? 'active' : 'suspended',
        isAdmin,
      };`
);

// Update the Basic Information section
let startPos = content.indexOf('<View style={styles.infoSection}>');
let endPos = content.indexOf('</View>', startPos);
endPos = content.indexOf('</View>', endPos + 1) + 6;

const newBasicInfoSection = `<View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Display Name</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter display name"
                />
              ) : (
                <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Native Language</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={nativeLanguage}
                  onChangeText={setNativeLanguage}
                  placeholder="Enter native language"
                />
              ) : (
                <Text style={styles.value}>{user?.nativeLanguage || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>English Level</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={englishLevel}
                  onChangeText={setEnglishLevel}
                  placeholder="Enter English proficiency level"
                />
              ) : (
                <Text style={styles.value}>{user?.englishLevel || 'Beginner'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Learning Goal</Text>
              {editMode ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={learningGoal}
                  onChangeText={setLearningGoal}
                  placeholder="Enter learning goal"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.value}>{user?.learningGoal || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Daily Goal (Minutes)</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={dailyGoalMinutes}
                  onChangeText={setDailyGoalMinutes}
                  placeholder="Enter daily goal in minutes"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{user?.dailyGoalMinutes || '15'} minutes</Text>
              )}
            </View>
          </View>`;

content = content.substring(0, startPos) + newBasicInfoSection + content.substring(endPos);

// Update the reset function in the Cancel button
content = content.replace(
  /setDisplayName\(user\?.displayName \|\| ''\);[\s\S]+?setIsAdmin\(user\?.isAdmin \|\| false\);/m,
  `setDisplayName(user?.displayName || '');
                  setProfileImage(user?.profileImage || '');
                  setNativeLanguage(user?.nativeLanguage || '');
                  setEnglishLevel(user?.englishLevel || 'beginner');
                  setLearningGoal(user?.learningGoal || '');
                  setDailyGoalMinutes(user?.dailyGoalMinutes ? user.dailyGoalMinutes.toString() : '15');
                  setIsActive(user?.status !== 'suspended');
                  setIsAdmin(user?.isAdmin || false);`
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);
console.log('Updated user-details.tsx with the correct fields');
