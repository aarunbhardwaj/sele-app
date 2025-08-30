import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import appwriteService from '../../../services/appwrite';

// Airbnb Colors
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E1474C',
  secondary: '#00A699',
  tertiary: '#FC642D',
  dark: '#484848',
  mediumGray: '#767676',
  lightGray: '#EBEBEB',
  superLightGray: '#F7F7F7',
  white: '#FFFFFF',
  black: '#222222',
  success: '#008A05',
  warning: '#FFB400',
  error: '#C13515',
  background: '#FDFDFD',
  border: '#DDDDDD',
};

// Airbnb Typography
const airbnbTypography = {
  fontFamily: Platform.OS === 'ios' ? 'Circular' : 'CircularStd',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Airbnb Spacing
const airbnbSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const levelOptions = ["beginner", "intermediate", "advanced", "all levels"];
const categoryOptions = ["grammar", "vocabulary", "speaking", "writing", "reading", "listening", "general"];

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export default function CourseCreatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Course form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  const [category, setCategory] = useState('general');
  const [estimatedDuration, setEstimatedDuration] = useState('4 weeks');
  const [totalLessons, setTotalLessons] = useState('0');
  const [isPublished, setIsPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    estimatedDuration: '',
    totalLessons: '',
    category: ''
  });

  // Create Airbnb-style Text component
  const AirbnbText = ({ children, style = {}, variant = 'body', color = airbnbColors.dark, ...props }: AirbnbTextProps) => {
    const getTextStyle = () => {
      switch (variant) {
        case 'hero':
          return { fontSize: airbnbTypography.sizes.huge, fontWeight: airbnbTypography.weights.bold };
        case 'title':
          return { fontSize: airbnbTypography.sizes.xxxl, fontWeight: airbnbTypography.weights.semibold };
        case 'subtitle':
          return { fontSize: airbnbTypography.sizes.xl, fontWeight: airbnbTypography.weights.regular };
        case 'body':
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
        case 'caption':
          return { fontSize: airbnbTypography.sizes.md, fontWeight: airbnbTypography.weights.regular };
        case 'small':
          return { fontSize: airbnbTypography.sizes.sm, fontWeight: airbnbTypography.weights.regular };
        default:
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
      }
    };

    return (
      <Animated.Text
        style={[
          {
            color,
            fontFamily: airbnbTypography.fontFamily,
            ...getTextStyle(),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.Text>
    );
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
      estimatedDuration: '',
      totalLessons: '',
      category: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
      isValid = false;
    }
    
    if (!estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Duration is required';
      isValid = false;
    }

    if (!totalLessons.trim() || isNaN(Number(totalLessons))) {
      newErrors.totalLessons = 'Total lessons must be a valid number';
      isValid = false;
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleCreateCourse = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format tags as array
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];
      
      // Create course data object
      const courseData = {
        title,
        description,
        level,
        category,
        estimatedDuration,
        totalLessons: parseInt(totalLessons, 10),
        isPublished,
        imageUrl: imageUrl || '',
        tags: tagsArray
      };
      
      // Create course using appwrite service
      const newCourse = await appwriteService.createCourse(courseData);
      
      Alert.alert(
        'Success', 
        'Course created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/(admin)/(courses)/course-library`)
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create course:', error);
      Alert.alert(
        'Error',
        'Failed to create course: ' + (error.message || error),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const renderLevelSelection = () => (
    <View style={styles.optionsSelector}>
      {levelOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            level === option && styles.selectedOption
          ]}
          onPress={() => setLevel(option)}
        >
          <AirbnbText 
            variant="caption" 
            color={level === option ? airbnbColors.white : airbnbColors.dark}
            style={styles.optionText}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </AirbnbText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.optionsSelector}>
      {categoryOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            category === option && styles.selectedOption
          ]}
          onPress={() => setCategory(option)}
        >
          <AirbnbText 
            variant="caption" 
            color={category === option ? airbnbColors.white : airbnbColors.dark}
            style={styles.optionText}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </AirbnbText>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
        </TouchableOpacity>
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Create Course</AirbnbText>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <AirbnbText variant="hero" style={styles.heroTitle}>
              Create New Course
            </AirbnbText>
            <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.heroSubtitle}>
              Build an engaging learning experience for your students
            </AirbnbText>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={32} color={airbnbColors.primary} />
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Course Title */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Course Title *</AirbnbText>
            <TextInput 
              style={[styles.input, errors.title ? styles.inputError : null]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter course title"
              placeholderTextColor={airbnbColors.mediumGray}
            />
            {errors.title ? (
              <AirbnbText variant="small" color={airbnbColors.error} style={styles.errorText}>
                {errors.title}
              </AirbnbText>
            ) : null}
          </View>
          
          {/* Description */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Description *</AirbnbText>
            <TextInput 
              style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter course description"
              placeholderTextColor={airbnbColors.mediumGray}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {errors.description ? (
              <AirbnbText variant="small" color={airbnbColors.error} style={styles.errorText}>
                {errors.description}
              </AirbnbText>
            ) : null}
          </View>

          {/* Category Selection */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Category *</AirbnbText>
            {renderCategorySelection()}
            {errors.category ? (
              <AirbnbText variant="small" color={airbnbColors.error} style={styles.errorText}>
                {errors.category}
              </AirbnbText>
            ) : null}
          </View>
          
          {/* Level Selection */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Course Level *</AirbnbText>
            {renderLevelSelection()}
          </View>
          
          {/* Duration */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Estimated Duration *</AirbnbText>
            <TextInput 
              style={[styles.input, errors.estimatedDuration ? styles.inputError : null]}
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              placeholder="e.g. 4 weeks, 10 hours, etc."
              placeholderTextColor={airbnbColors.mediumGray}
            />
            {errors.estimatedDuration ? (
              <AirbnbText variant="small" color={airbnbColors.error} style={styles.errorText}>
                {errors.estimatedDuration}
              </AirbnbText>
            ) : null}
          </View>

          {/* Total Lessons */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Total Lessons *</AirbnbText>
            <TextInput 
              style={[styles.input, errors.totalLessons ? styles.inputError : null]}
              value={totalLessons}
              onChangeText={setTotalLessons}
              placeholder="Enter number of lessons"
              placeholderTextColor={airbnbColors.mediumGray}
              keyboardType="numeric"
            />
            {errors.totalLessons ? (
              <AirbnbText variant="small" color={airbnbColors.error} style={styles.errorText}>
                {errors.totalLessons}
              </AirbnbText>
            ) : null}
          </View>

          {/* Image URL */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Course Image URL</AirbnbText>
            <TextInput 
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="Enter course image URL (optional)"
              placeholderTextColor={airbnbColors.mediumGray}
            />
            <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.helperText}>
              Add a cover image to make your course more appealing
            </AirbnbText>
          </View>
          
          {/* Tags */}
          <View style={styles.formGroup}>
            <AirbnbText variant="subtitle" style={styles.label}>Tags</AirbnbText>
            <TextInput 
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. grammar, vocabulary, beginner"
              placeholderTextColor={airbnbColors.mediumGray}
            />
            <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.helperText}>
              Separate tags with commas to help students find your course
            </AirbnbText>
          </View>
          
          {/* Publish Switch */}
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <AirbnbText variant="subtitle" style={styles.switchLabel}>Publish immediately</AirbnbText>
              <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.switchHelper}>
                Make this course visible to students right away
              </AirbnbText>
            </View>
            <Switch
              value={isPublished}
              onValueChange={setIsPublished}
              trackColor={{ false: airbnbColors.lightGray, true: airbnbColors.primary + '40' }}
              thumbColor={isPublished ? airbnbColors.primary : airbnbColors.white}
              ios_backgroundColor={airbnbColors.lightGray}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <AirbnbText variant="body" color={airbnbColors.dark} style={styles.buttonText}>
              Cancel
            </AirbnbText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCreateCourse}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={airbnbColors.white} />
            ) : (
              <>
                <Ionicons name="add" size={20} color={airbnbColors.white} style={styles.buttonIcon} />
                <AirbnbText variant="body" color={airbnbColors.white} style={styles.buttonText}>
                  Create Course
                </AirbnbText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.border,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  headerTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: airbnbSpacing.lg,
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.md,
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: airbnbTypography.sizes.huge,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.sm,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
    lineHeight: 24,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: airbnbSpacing.lg,
  },
  formSection: {
    margin: airbnbSpacing.lg,
    padding: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formGroup: {
    marginBottom: airbnbSpacing.lg,
  },
  label: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.sm,
  },
  input: {
    backgroundColor: airbnbColors.white,
    borderWidth: 1,
    borderColor: airbnbColors.border,
    borderRadius: 12,
    paddingHorizontal: airbnbSpacing.md,
    paddingVertical: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    fontFamily: airbnbTypography.fontFamily,
  },
  inputError: {
    borderColor: airbnbColors.error,
    borderWidth: 2,
  },
  textArea: {
    height: 120,
    paddingTop: airbnbSpacing.md,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.error,
  },
  helperText: {
    marginTop: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
    lineHeight: 18,
  },
  optionsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: airbnbSpacing.xs,
    gap: airbnbSpacing.sm,
  },
  option: {
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  selectedOption: {
    backgroundColor: airbnbColors.primary,
    borderColor: airbnbColors.primary,
  },
  optionText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.medium,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.md,
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 12,
    marginTop: airbnbSpacing.sm,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: airbnbSpacing.md,
  },
  switchLabel: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.xs,
  },
  switchHelper: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
  },
  actionsSection: {
    flexDirection: 'row',
    marginHorizontal: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.xl,
    gap: airbnbSpacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    borderRadius: 12,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
  },
  secondaryButton: {
    backgroundColor: airbnbColors.white,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  buttonIcon: {
    marginRight: airbnbSpacing.sm,
  },
  buttonText: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
  },
});