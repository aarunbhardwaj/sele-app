import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { StudentRating } from '../../lib/instructor-types';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

const airbnbColors = {
  primary: '#FF5A5F',
  secondary: '#00A699',
  tertiary: '#FC642D',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

interface Student {
  $id: string;
  name: string;
  email: string;
}

interface RatingComponentProps {
  student: Student;
  classId: string;
  sessionId: string;
  onRatingComplete: () => void;
}

const StarRating = ({ value, onValueChange, label }: {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
}) => {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onValueChange(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={24}
              color={star <= value ? airbnbColors.warning : airbnbColors.mediumGray}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingValue}>{value}/5</Text>
    </View>
  );
};

const StudentRatingComponent: React.FC<RatingComponentProps> = ({
  student,
  classId,
  sessionId,
  onRatingComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    participation: 0,
    comprehension: 0,
    homework: 0,
    speaking: 0,
    listening: 0,
    overall: 0,
  });
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const updateRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateOverallRating = () => {
    const { participation, comprehension, homework, speaking, listening } = ratings;
    const average = (participation + comprehension + homework + speaking + listening) / 5;
    setRatings(prev => ({ ...prev, overall: Math.round(average) }));
  };

  useEffect(() => {
    calculateOverallRating();
  }, [ratings.participation, ratings.comprehension, ratings.homework, ratings.speaking, ratings.listening]);

  const handleSubmitRating = async () => {
    if (!user?.$id) {
      Alert.alert('Error', 'You must be logged in to submit ratings');
      return;
    }

    // Validation
    if (ratings.overall === 0) {
      Alert.alert('Error', 'Please provide ratings for all categories');
      return;
    }

    if (!comments.trim()) {
      Alert.alert('Error', 'Please provide comments about the student');
      return;
    }

    try {
      setLoading(true);

      const ratingData: Omit<StudentRating, '$id' | 'createdAt' | 'updatedAt'> = {
        instructorId: user.$id,
        studentId: student.$id,
        classId,
        sessionId,
        date: new Date().toISOString().split('T')[0],
        ratings,
        comments: comments.trim(),
        strengths: strengths.trim().split(',').map(s => s.trim()).filter(s => s.length > 0),
        areasForImprovement: areasForImprovement.trim().split(',').map(s => s.trim()).filter(s => s.length > 0),
        recommendations: recommendations.trim(),
        isVisible
      };

      await appwriteService.createStudentRating(ratingData);
      
      Alert.alert('Success', 'Student rating submitted successfully', [
        { text: 'OK', onPress: onRatingComplete }
      ]);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentEmail}>{student.email}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.ratingsSection}>
        <Text style={styles.sectionTitle}>Performance Ratings</Text>
        
        <StarRating
          label="Participation"
          value={ratings.participation}
          onValueChange={(value) => updateRating('participation', value)}
        />
        
        <StarRating
          label="Comprehension"
          value={ratings.comprehension}
          onValueChange={(value) => updateRating('comprehension', value)}
        />
        
        <StarRating
          label="Homework"
          value={ratings.homework}
          onValueChange={(value) => updateRating('homework', value)}
        />
        
        <StarRating
          label="Speaking"
          value={ratings.speaking}
          onValueChange={(value) => updateRating('speaking', value)}
        />
        
        <StarRating
          label="Listening"
          value={ratings.listening}
          onValueChange={(value) => updateRating('listening', value)}
        />

        <View style={styles.overallRating}>
          <Text style={styles.overallLabel}>Overall Rating</Text>
          <View style={styles.overallStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= ratings.overall ? 'star' : 'star-outline'}
                size={28}
                color={star <= ratings.overall ? airbnbColors.warning : airbnbColors.mediumGray}
              />
            ))}
          </View>
          <Text style={styles.overallValue}>{ratings.overall}/5</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Detailed Feedback</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Comments *</Text>
          <TextInput
            style={styles.textArea}
            value={comments}
            onChangeText={setComments}
            placeholder="Provide detailed comments about the student's performance..."
            multiline
            numberOfLines={4}
            placeholderTextColor={airbnbColors.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Strengths (comma separated)</Text>
          <TextInput
            style={styles.textInput}
            value={strengths}
            onChangeText={setStrengths}
            placeholder="e.g., Good pronunciation, Active participation"
            placeholderTextColor={airbnbColors.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Areas for Improvement (comma separated)</Text>
          <TextInput
            style={styles.textInput}
            value={areasForImprovement}
            onChangeText={setAreasForImprovement}
            placeholder="e.g., Grammar needs work, Vocabulary expansion"
            placeholderTextColor={airbnbColors.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Recommendations</Text>
          <TextInput
            style={styles.textArea}
            value={recommendations}
            onChangeText={setRecommendations}
            placeholder="Provide recommendations for the student's continued learning..."
            multiline
            numberOfLines={3}
            placeholderTextColor={airbnbColors.mediumGray}
          />
        </View>

        <View style={styles.visibilityToggle}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsVisible(!isVisible)}
          >
            <Ionicons
              name={isVisible ? 'eye' : 'eye-off'}
              size={20}
              color={airbnbColors.primary}
            />
            <Text style={styles.toggleText}>
              {isVisible ? 'Visible to student' : 'Hidden from student'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.submitSection}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={airbnbColors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={airbnbColors.white} />
              <Text style={styles.submitButtonText}>Submit Rating</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

export default function StudentRatingScreen() {
  const router = useRouter();
  const [students] = useState<Student[]>([
    { $id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
    { $id: '2', name: 'Bob Smith', email: 'bob@example.com' },
    { $id: '3', name: 'Carol Williams', email: 'carol@example.com' },
  ]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [completedRatings, setCompletedRatings] = useState<Set<string>>(new Set());

  // Mock values - these would come from navigation params in real app
  const classId = 'class123';
  const sessionId = 'session123';

  const handleRatingComplete = () => {
    const currentStudent = students[currentStudentIndex];
    setCompletedRatings(prev => new Set([...prev, currentStudent.$id]));
    
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    } else {
      Alert.alert('All Ratings Complete', 'You have rated all students in this class.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const currentStudent = students[currentStudentIndex];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.progressHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={airbnbColors.charcoal} />
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Student {currentStudentIndex + 1} of {students.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStudentIndex + 1) / students.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {currentStudent && (
        <StudentRatingComponent
          student={currentStudent}
          classId={classId}
          sessionId={sessionId}
          onRatingComplete={handleRatingComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  backButton: {
    marginRight: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: airbnbColors.primary,
    borderRadius: 2,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.white,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  ratingsSection: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
  starsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.darkGray,
    minWidth: 30,
  },
  overallRating: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    marginTop: 16,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
  },
  overallStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
  },
  feedbackSection: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: airbnbColors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: airbnbColors.charcoal,
    backgroundColor: airbnbColors.offWhite,
  },
  textArea: {
    borderWidth: 1,
    borderColor: airbnbColors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: airbnbColors.charcoal,
    backgroundColor: airbnbColors.offWhite,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visibilityToggle: {
    marginTop: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
    marginLeft: 8,
  },
  submitSection: {
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: airbnbColors.mediumGray,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.white,
    marginLeft: 8,
  },
});